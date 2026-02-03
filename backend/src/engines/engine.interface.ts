import { UnifiedFinding, IntegrationConfig, ConnectionTestResult } from '@forgecomply/shared';

export interface IIntegrationEngine {
  pull(config: IntegrationConfig): Promise<Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[]>;
  testConnection(config: IntegrationConfig): Promise<ConnectionTestResult>;
  parseWebhook(payload: unknown, headers: Record<string, string>): Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[];
}
