import {
  IntegrationConfig,
  IntegrationCreateInput,
  IntegrationUpdateInput,
  ConnectionTestResult,
} from '@forgecomply/shared';
import { api } from './client';

export function fetchIntegrations(): Promise<IntegrationConfig[]> {
  return api.get<IntegrationConfig[]>('/integrations');
}

export function createIntegration(input: IntegrationCreateInput): Promise<IntegrationConfig> {
  return api.post<IntegrationConfig>('/integrations', input);
}

export function updateIntegration(id: string, input: IntegrationUpdateInput): Promise<IntegrationConfig> {
  return api.put<IntegrationConfig>(`/integrations/${id}`, input);
}

export function deleteIntegration(id: string): Promise<void> {
  return api.delete<void>(`/integrations/${id}`);
}

export function testIntegrationConnection(id: string): Promise<ConnectionTestResult> {
  return api.post<ConnectionTestResult>(`/integrations/${id}/test`);
}

export function testNewConnection(provider: string, credentials: Record<string, string>): Promise<ConnectionTestResult> {
  return api.post<ConnectionTestResult>('/integrations/test', { provider, credentials });
}

export function triggerPoll(id: string): Promise<{ message: string }> {
  return api.post<{ message: string }>(`/integrations/${id}/poll`);
}
