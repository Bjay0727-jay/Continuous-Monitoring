import { v4 as uuid } from 'uuid';
import { getDatabase } from '../db/connection';
import { getIntegrationById, updatePollStatus } from './integrations.service';
import { upsertFindings } from './findings.service';
import { getEngine } from '../engines/registry';
import { logger } from '../utils/logger';

export async function executePoll(integrationId: string): Promise<void> {
  const integration = getIntegrationById(integrationId, false);
  if (!integration) {
    logger.error(`Integration not found: ${integrationId}`);
    return;
  }

  if (!integration.enabled) {
    logger.debug(`Skipping disabled integration: ${integration.name}`);
    return;
  }

  const db = getDatabase();
  const historyId = uuid();

  db.prepare(`
    INSERT INTO poll_history (id, integration_id, started_at, status)
    VALUES (?, ?, datetime('now'), 'RUNNING')
  `).run(historyId, integrationId);

  logger.info(`Starting poll for integration: ${integration.name} (${integration.provider})`);

  try {
    const engine = getEngine(integration.provider);
    const findings = await engine.pull(integration);

    const result = upsertFindings(findings);

    db.prepare(`
      UPDATE poll_history
      SET completed_at = datetime('now'), findings_count = ?, new_count = ?, updated_count = ?, status = 'SUCCESS'
      WHERE id = ?
    `).run(findings.length, result.new, result.updated, historyId);

    updatePollStatus(integrationId, 'SUCCESS');
    logger.info(`Poll complete for ${integration.name}: ${result.new} new, ${result.updated} updated`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';

    db.prepare(`
      UPDATE poll_history
      SET completed_at = datetime('now'), status = 'FAILED', error_message = ?
      WHERE id = ?
    `).run(errorMessage, historyId);

    updatePollStatus(integrationId, 'FAILED', errorMessage);
    logger.error(`Poll failed for ${integration.name}: ${errorMessage}`);
  }
}
