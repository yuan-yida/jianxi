import { Router, type Request, Response } from 'express';
import { ASRClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = Router();

/**
 * POST /api/asr/recognize
 * Recognize speech from audio data
 */
router.post('/api/asr/recognize', async (req: Request, res: Response) => {
  const { audioData, audioUrl } = req.body as {
    audioData?: string;  // base64 encoded audio
    audioUrl?: string;   // URL to audio file
  };

  if (!audioData && !audioUrl) {
    res.status(400).json({ error: 'audioData or audioUrl is required' });
    return;
  }

  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const config = new Config();
    const client = new ASRClient(config, customHeaders);

    const result = await client.recognize({
      uid: `user_${Date.now()}`,
      url: audioUrl,
      base64Data: audioData,
    });

    res.json({
      text: result.text,
      duration: result.duration,
    });
  } catch (error: unknown) {
    console.error('ASR error:', error);
    const errMsg = error instanceof Error ? error.message : 'Speech recognition failed';
    res.status(500).json({ error: errMsg });
  }
});

export default router;
