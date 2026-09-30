import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// GET /metrics - Return current service metrics
router.get('/', (req: Request, res: Response) => {
  res.json(state.metrics);
});

export default router;
