import { Router } from 'express';
import chatRoutes from './chat';
import ttsRoutes from './tts';
import asrRoutes from './asr';
import assessmentRoutes from './assessment';
import authRoutes from './auth';
import communityRoutes from './community';

const router = Router();

// Health check
router.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.COZE_PROJECT_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Register API routes
router.use(chatRoutes);
router.use(ttsRoutes);
router.use(asrRoutes);
router.use(assessmentRoutes);
router.use(authRoutes);
router.use(communityRoutes);

export default router;
