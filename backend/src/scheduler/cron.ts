import cron from 'node-cron';
import { getEnabledIntegrations } from '../services/integrations.service';
import { executePoll } from '../services/poller.service';
import { logger } from '../utils/logger';

const jobs = new Map<string, cron.ScheduledTask>();

export function startScheduler(): void {
  const integrations = getEnabledIntegrations();

  for (const integration of integrations) {
    registerJob(integration.id, integration.pollIntervalMinutes);
  }

  logger.info(`Scheduler started with ${integrations.length} active jobs`);
}

export function stopScheduler(): void {
  for (const [id, task] of jobs) {
    task.stop();
    logger.debug(`Stopped cron job for integration: ${id}`);
  }
  jobs.clear();
  logger.info('Scheduler stopped');
}

export function registerJob(integrationId: string, intervalMinutes: number): void {
  unregisterJob(integrationId);

  const cronExpr = minutesToCron(intervalMinutes);

  const task = cron.schedule(cronExpr, async () => {
    logger.debug(`Cron triggered poll for integration: ${integrationId}`);
    try {
      await executePoll(integrationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(`Cron poll error for ${integrationId}: ${message}`);
    }
  });

  jobs.set(integrationId, task);
  logger.info(`Registered cron job for integration ${integrationId}: ${cronExpr}`);
}

export function unregisterJob(integrationId: string): void {
  const existing = jobs.get(integrationId);
  if (existing) {
    existing.stop();
    jobs.delete(integrationId);
    logger.debug(`Unregistered cron job for integration: ${integrationId}`);
  }
}

function minutesToCron(minutes: number): string {
  if (minutes <= 0) minutes = 15;
  if (minutes < 60) {
    return `*/${minutes} * * * *`;
  }
  const hours = Math.floor(minutes / 60);
  return `0 */${hours} * * *`;
}
