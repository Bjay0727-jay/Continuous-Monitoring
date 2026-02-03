import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { createRoutes } from './routes';
import { logger } from './utils/logger';

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });

  app.use('/api', createRoutes());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ForgeComply 360', timestamp: new Date().toISOString() });
  });

  app.use(errorHandler);

  return app;
}
