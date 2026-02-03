import { IntegrationConfig, ConnectionTestResult, UnifiedFinding } from '@forgecomply/shared';
import { IIntegrationEngine } from '../engine.interface';
import { AzureDefenderClient } from './azure.client';
import { normalizeAzureAlert } from './azure.normalizer';
import { AzureSecurityAlert } from './azure.types';
import { logger } from '../../utils/logger';

export class AzureDefenderEngine implements IIntegrationEngine {
  async pull(config: IntegrationConfig): Promise<Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const client = new AzureDefenderClient(config);
    const alerts = await client.getAlerts();
    return alerts.map((a) => normalizeAzureAlert(a, config.id));
  }

  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    try {
      const client = new AzureDefenderClient(config);
      await client.testConnection();
      return { success: true, message: 'Successfully connected to Azure Defender' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      logger.error(`Azure connection test failed: ${message}`);
      return { success: false, message };
    }
  }

  parseWebhook(payload: unknown, _headers: Record<string, string>): Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[] {
    const body = payload as Record<string, unknown>;

    let alerts: AzureSecurityAlert[];
    if (body.data && (body.data as Record<string, unknown>).alertType) {
      alerts = [{ id: '', name: '', type: '', properties: body.data } as unknown as AzureSecurityAlert];
    } else if (Array.isArray(body.value)) {
      alerts = body.value;
    } else {
      alerts = [body as unknown as AzureSecurityAlert];
    }

    return alerts.map((a) => normalizeAzureAlert(a, 'webhook'));
  }
}
