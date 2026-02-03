import { IntegrationConfig, ConnectionTestResult, UnifiedFinding } from '@forgecomply/shared';
import { IIntegrationEngine } from '../engine.interface';
import { GitHubDependabotClient } from './github.client';
import { normalizeGitHubAlert } from './github.normalizer';
import { GitHubDependabotAlert } from './github.types';
import { logger } from '../../utils/logger';

export class GitHubDependabotEngine implements IIntegrationEngine {
  async pull(config: IntegrationConfig): Promise<Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const client = new GitHubDependabotClient(config);
    const alerts = await client.getAlerts();
    return alerts.map((a) => normalizeGitHubAlert(a, config.id, client.repoFullName));
  }

  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    try {
      const client = new GitHubDependabotClient(config);
      await client.testConnection();
      return { success: true, message: 'Successfully connected to GitHub repository' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      logger.error(`GitHub connection test failed: ${message}`);
      return { success: false, message };
    }
  }

  parseWebhook(payload: unknown, _headers: Record<string, string>): Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[] {
    const body = payload as Record<string, unknown>;

    if (body.action && body.alert) {
      const alert = body.alert as GitHubDependabotAlert;
      const repo = body.repository as { full_name?: string } | undefined;
      return [normalizeGitHubAlert(alert, 'webhook', repo?.full_name)];
    }

    return [];
  }
}
