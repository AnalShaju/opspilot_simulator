import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// GET /deployments - Return deployment history
router.get('/', (req: Request, res: Response) => {
  res.json({
    deployments: state.deployments
  });
});

export default router;
