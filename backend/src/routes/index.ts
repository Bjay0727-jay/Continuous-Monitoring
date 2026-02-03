import { Router } from 'express';
import { findingsRouter } from './findings.routes';
import { integrationsRouter } from './integrations.routes';
import { dashboardRouter } from './dashboard.routes';
import { webhooksRouter } from './webhooks.routes';

export function createRoutes(): Router {
  const router = Router();

  router.use('/findings', findingsRouter);
  router.use('/integrations', integrationsRouter);
  router.use('/dashboard', dashboardRouter);
  router.use('/webhooks', webhooksRouter);

  return router;
}
