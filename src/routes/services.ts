import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// GET /services - Return the current health of all services
router.get('/', (req: Request, res: Response) => {
  res.json({
    services: state.services
  });
});

export default router;
