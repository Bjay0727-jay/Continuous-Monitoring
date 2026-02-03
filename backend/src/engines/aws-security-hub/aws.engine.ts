import { IntegrationConfig, ConnectionTestResult, UnifiedFinding } from '@forgecomply/shared';
import { IIntegrationEngine } from '../engine.interface';
import { AWSSecurityHubClient } from './aws.client';
import { normalizeAWSFinding } from './aws.normalizer';
import { AWSSecurityFinding } from './aws.types';
import { logger } from '../../utils/logger';

export class AWSSecurityHubEngine implements IIntegrationEngine {
  async pull(config: IntegrationConfig): Promise<Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[]> {
    const client = new AWSSecurityHubClient(config);
    const rawFindings = await client.getAllFindings();
    return rawFindings.map((f) => normalizeAWSFinding(f, config.id));
  }

  async testConnection(config: IntegrationConfig): Promise<ConnectionTestResult> {
    try {
      const client = new AWSSecurityHubClient(config);
      await client.testConnection();
      return { success: true, message: 'Successfully connected to AWS Security Hub' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed';
      logger.error(`AWS connection test failed: ${message}`);
      return { success: false, message };
    }
  }

  parseWebhook(payload: unknown, _headers: Record<string, string>): Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[] {
    const body = payload as Record<string, unknown>;

    // Handle SNS notification wrapper
    let findings: AWSSecurityFinding[];
    if (body.Type === 'Notification' && typeof body.Message === 'string') {
      const message = JSON.parse(body.Message);
      findings = message.detail?.findings || [message];
    } else if (body.detail && (body.detail as Record<string, unknown>).findings) {
      findings = (body.detail as Record<string, unknown>).findings as AWSSecurityFinding[];
    } else if (Array.isArray(body.findings)) {
      findings = body.findings;
    } else {
      findings = [body as unknown as AWSSecurityFinding];
    }

    return findings.map((f) => normalizeAWSFinding(f, 'webhook'));
  }
}
