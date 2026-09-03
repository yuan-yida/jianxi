import { Router, type Request, Response } from 'express';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = Router();

/**
 * POST /api/tts/synthesize
 * Convert text to speech audio
 */
router.post('/api/tts/synthesize', async (req: Request, res: Response) => {
  const { text, speaker } = req.body as {
    text: string;
    speaker?: string;
  };

  if (!text) {
    res.status(400).json({ error: 'text is required' });
    return;
  }

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    const response = await client.synthesize({
      uid: `user_${Date.now()}`,
      text,
      speaker: speaker || 'zh_female_vv_uranus_bigtts',
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    res.json({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error: unknown) {
    console.error('TTS error:', error);
    const errMsg = error instanceof Error ? error.message : 'TTS synthesis failed';
    res.status(500).json({ error: errMsg });
  }
});

export default router;
