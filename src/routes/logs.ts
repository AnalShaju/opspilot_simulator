import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// GET /logs - Return application logs
router.get('/', (req: Request, res: Response) => {
  res.json({
    logs: state.logs
  });
});

export default router;
