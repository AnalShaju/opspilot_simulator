import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    deployments: state.deployments
  });
});

export default router;
