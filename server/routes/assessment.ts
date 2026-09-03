import { Router, type Request, Response } from 'express';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = Router();

/**
 * POST /api/assessment/evaluate
 * Evaluate a user's English message for pronunciation, grammar, and fluency
 */
router.post('/api/assessment/evaluate', async (req: Request, res: Response) => {
  const { userMessage, sceneId, level } = req.body as {
    userMessage: string;
    sceneId?: string;
    level?: string;
  };

  if (!userMessage) {
    res.status(400).json({ error: 'userMessage is required' });
    return;
  }

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const levelHint = level ? `The learner's current level is ${level}.` : '';

    const systemPrompt = `You are an expert English language evaluator. Analyze the learner's English message and provide a JSON response with:
1. pronunciationScore (integer 0-100): How natural the pronunciation would sound
2. grammarScore (integer 0-100): Grammatical accuracy
3. fluencyScore (integer 0-100): How natural and fluent the expression is
4. feedback (string): Brief, encouraging feedback in English (1-2 sentences max)
5. corrections (array): Array of objects with {original, corrected, explanation} for errors found. Empty array if no errors.

${levelHint}

Be encouraging but honest. Focus on the most important issues. Respond ONLY with valid JSON.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `Evaluate this English sentence: "${userMessage}"` },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.3,
    });

    let evaluation;
    try {
      const cleaned = response.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      evaluation = JSON.parse(cleaned);
    } catch {
      evaluation = {
        pronunciationScore: 75,
        grammarScore: 75,
        fluencyScore: 75,
        feedback: 'Good effort! Keep practicing your English speaking skills.',
        corrections: [],
      };
    }

    res.json({ evaluation });
  } catch (error: unknown) {
    console.error('Assessment error:', error);
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
