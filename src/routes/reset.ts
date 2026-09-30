import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// POST /reset - Reset state back to initial healthy defaults
router.post('/', (_req: Request, res: Response) => {
  state.reset();

  res.json({
    success: true,
    message: 'Production state reset to initial healthy defaults',
    status: 'healthy',
    recovered: false,
    activeScenario: null
  });
});

export default router;
