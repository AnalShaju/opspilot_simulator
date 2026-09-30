import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// GET /incidents - Return historical incident reports
router.get('/', (req: Request, res: Response) => {
  res.json({
    incidents: state.incidents
  });
});

export default router;
