import { Router, Request, Response } from 'express';
import {
  getAllIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
} from '../services/integrations.service';
import { getEngine } from '../engines/registry';
import { executePoll } from '../services/poller.service';
import { registerJob, unregisterJob } from '../scheduler/cron';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const integrations = getAllIntegrations();
  res.json(integrations);
});

router.get('/:id', (req: Request, res: Response) => {
  const integration = getIntegrationById(req.params.id);
  if (!integration) throw new AppError(404, 'Integration not found');
  res.json(integration);
});

router.post('/', (req: Request, res: Response) => {
  const integration = createIntegration(req.body);
  if (integration.enabled) {
    registerJob(integration.id, integration.pollIntervalMinutes);
  }
  res.status(201).json(integration);
});

router.put('/:id', (req: Request, res: Response) => {
  const integration = updateIntegration(req.params.id, req.body);
  if (!integration) throw new AppError(404, 'Integration not found');

  if (integration.enabled) {
    registerJob(integration.id, integration.pollIntervalMinutes);
  } else {
    unregisterJob(integration.id);
  }

  res.json(integration);
});

router.delete('/:id', (req: Request, res: Response) => {
  unregisterJob(req.params.id);
  const deleted = deleteIntegration(req.params.id);
  if (!deleted) throw new AppError(404, 'Integration not found');
  res.status(204).send();
});

router.post('/:id/test', async (req: Request, res: Response) => {
  const integration = getIntegrationById(req.params.id, false);
  if (!integration) throw new AppError(404, 'Integration not found');

  const engine = getEngine(integration.provider);
  const result = await engine.testConnection(integration);
  res.json(result);
});

router.post('/test', async (req: Request, res: Response) => {
  const { provider, credentials } = req.body;
  if (!provider || !credentials) throw new AppError(400, 'Provider and credentials are required');

  const engine = getEngine(provider);
  const result = await engine.testConnection({
    id: 'test',
    provider,
    name: 'Test',
    credentials,
    pollIntervalMinutes: 15,
    enabled: false,
    lastPollAt: null,
    lastPollStatus: null,
    lastPollError: null,
    createdAt: '',
    updatedAt: '',
  });
  res.json(result);
});

router.post('/:id/poll', async (req: Request, res: Response) => {
  const integration = getIntegrationById(req.params.id);
  if (!integration) throw new AppError(404, 'Integration not found');

  await executePoll(req.params.id);
  res.json({ message: 'Poll triggered successfully' });
});

export { router as integrationsRouter };
