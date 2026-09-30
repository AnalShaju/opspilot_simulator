import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// POST /simulate/:scenarioId
router.post('/:scenarioId', (req: Request, res: Response) => {
  const scenarioId = req.params.scenarioId;

  // Backward-compatible alias
  const normalized =
    scenarioId === 'payment-failure'
      ? 'PAYMENT_DEPLOYMENT_REGRESSION'
      : scenarioId;

  const result = state.simulate(normalized);

  if (!result.success) {
    return res.status(result.statusCode).json({
      success: false,
      message: result.message
    });
  }

  return res.json({
    success: true,
    scenarioId: result.scenarioId,
    message: result.message,
    incidentId: 'INC-001'
  });
});

export default router;
