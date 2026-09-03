import { Router, type Request, Response } from 'express';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = Router();

/**
 * POST /api/chat/stream
 * Streaming LLM chat for scenario role-play
 */
router.post('/api/chat/stream', async (req: Request, res: Response) => {
  const { messages } = req.body as {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    sceneId?: string;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required' });
    return;
  }

  // Ensure there's at least one user message
  const hasUserMsg = messages.some((m) => m.role === 'user');
  if (!hasUserMsg) {
    res.status(400).json({ error: 'At least one user message is required' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const stream = client.stream(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.8,
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        const data = JSON.stringify({ content: chunk.content.toString() });
        res.write(`data: ${data}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    console.error('LLM stream error:', error);
    const errMsg = error instanceof Error ? error.message : 'Internal server error';
    const errorData = JSON.stringify({ error: errMsg });
    res.write(`data: ${errorData}\n\n`);
    res.end();
  }
});

/**
 * POST /api/chat/evaluate
 * Non-streaming evaluation of user's English
 */
router.post('/api/chat/evaluate', async (req: Request, res: Response) => {
  const { userMessage, sceneContext } = req.body as {
    userMessage: string;
    sceneContext?: string;
  };

  if (!userMessage) {
    res.status(400).json({ error: 'userMessage is required' });
    return;
  }

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `You are an English language evaluator. Analyze the user's English message and provide:
1. pronunciationScore (0-100): How well the sentence would sound if spoken naturally
2. grammarScore (0-100): Grammatical accuracy
3. fluencyScore (0-100): How natural and fluent the expression is
4. feedback: A brief, encouraging feedback in English (1-2 sentences)
5. corrections: Array of {original, corrected, explanation} for any errors found

Respond ONLY with valid JSON, no markdown or extra text.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: sceneContext
          ? `Scene context: ${sceneContext}\n\nEvaluate this English message: "${userMessage}"`
          : `Evaluate this English message: "${userMessage}"`,
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.3,
    });

    // Parse the JSON response
    let evaluation;
    try {
      const cleaned = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      evaluation = JSON.parse(cleaned);
    } catch {
      evaluation = {
        pronunciationScore: 75,
        grammarScore: 75,
        fluencyScore: 75,
        feedback: 'Good effort! Keep practicing to improve your English skills.',
        corrections: [],
      };
    }

    res.json({ evaluation });
  } catch (error: unknown) {
    console.error('Evaluation error:', error);
    res.json({
      evaluation: {
        pronunciationScore: 75,
        grammarScore: 75,
        fluencyScore: 75,
        feedback: 'Good effort! Keep practicing.',
        corrections: [],
      },
    });
  }
});

export default router;
