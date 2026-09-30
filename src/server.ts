import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

import servicesRouter from './routes/services';
import logsRouter from './routes/logs';
import metricsRouter from './routes/metrics';
import deploymentsRouter from './routes/deployments';
import incidentsRouter from './routes/incidents';
import simulationRouter from './routes/simulation';
import actionsRouter from './routes/actions';
import healthRouter from './routes/health';
import resetRouter from './routes/reset';
import scenariosRouter from './routes/scenarios';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

app.get('/api-status', (_req: Request, res: Response) => {
  res.json({
    name: 'OpsPilot Production Simulator',
    status: 'running',
    description: 'Fake production environment for OpsPilot AI Incident Response'
  });
});

app.use('/services', servicesRouter);
app.use('/logs', logsRouter);
app.use('/metrics', metricsRouter);
app.use('/deployments', deploymentsRouter);
app.use('/incidents', incidentsRouter);
app.use('/scenarios', scenariosRouter);
app.use('/simulate', simulationRouter);
app.use('/actions', actionsRouter);
app.use('/health', healthRouter);
app.use('/reset', resetRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('==================================================');
  console.log(`OpsPilot Production Simulator`);
  console.log(`UI & API:  http://localhost:${PORT}`);
  console.log(`Listening: 0.0.0.0:${PORT} (network accessible)`);
  console.log('==================================================');
});
