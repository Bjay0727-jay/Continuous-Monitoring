import { createApp } from './app';
import { config } from './config/env';
import { getDatabase, closeDatabase } from './db/connection';
import { startScheduler, stopScheduler } from './scheduler/cron';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  getDatabase();

  const app = createApp();

  startScheduler();

  const server = app.listen(config.port, () => {
    logger.info(`ForgeComply 360 server running on port ${config.port}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`Health check: http://localhost:${config.port}/health`);
  });

  const shutdown = (): void => {
    logger.info('Shutting down...');
    stopScheduler();
    server.close();
    closeDatabase();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
