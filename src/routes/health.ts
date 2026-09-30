import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// GET /health - Return production health summary to verify recovery
router.get('/', (req: Request, res: Response) => {
  res.json(state.getHealthSummary());
});

export default router;
