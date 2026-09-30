import { Router, Request, Response } from 'express';
import { scenarios } from '../data/scenarios';

const router = Router();

// GET /scenarios
router.get('/', (_req: Request, res: Response) => {
  res.json(scenarios);
});

export default router;
