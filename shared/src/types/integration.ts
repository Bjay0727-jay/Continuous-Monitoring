import { SourceProvider } from './source';

export interface IntegrationConfig {
  id: string;
  provider: SourceProvider;
  name: string;
  credentials: Record<string, string>;
  pollIntervalMinutes: number;
  enabled: boolean;
  lastPollAt: string | null;
  lastPollStatus: 'SUCCESS' | 'PARTIAL' | 'FAILED' | null;
  lastPollError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationCreateInput {
  provider: SourceProvider;
  name: string;
  credentials: Record<string, string>;
  pollIntervalMinutes?: number;
  enabled?: boolean;
}

export interface IntegrationUpdateInput {
  name?: string;
  credentials?: Record<string, string>;
  pollIntervalMinutes?: number;
  enabled?: boolean;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: Record<string, unknown>;
}
