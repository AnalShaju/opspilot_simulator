import { Router, Request, Response } from 'express';
import { state } from '../state';

const router = Router();

// POST /actions/rollback — body: { version, service? }
router.post('/rollback', (req: Request, res: Response) => {
  const { version, service } = req.body || {};

  if (!version || typeof version !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Missing or invalid \'version\'. Example: { "version": "v1.8.4" } or { "service": "Users Service", "version": "v2.3.0" }'
    });
  }

  if (service !== undefined && typeof service !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid \'service\' field. Expected a string service name.'
    });
  }

  const result = state.performRollback(version, service);

  if (!result.success) {
    return res.status(result.statusCode).json({
      success: false,
      message: result.message
    });
  }

  return res.json({
    success: true,
    action: result.action,
    version: result.version,
    service: result.service,
    message: result.message
  });
});

// POST /actions/restart-redis
router.post('/restart-redis', (_req: Request, res: Response) => {
  const result = state.restartRedis();

  if (!result.success) {
    return res.status(result.statusCode).json({
      success: false,
      message: result.message
    });
  }

  return res.json({
    success: true,
    action: result.action,
    message: result.message
  });
});

// POST /actions/recover-database
router.post('/recover-database', (_req: Request, res: Response) => {
  const result = state.recoverDatabase();

  if (!result.success) {
    return res.status(result.statusCode).json({
      success: false,
      message: result.message
    });
  }

  return res.json({
    success: true,
    action: result.action,
    message: result.message
  });
});

export default router;
