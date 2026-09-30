import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    services: state.services
  });
});

export default router;
