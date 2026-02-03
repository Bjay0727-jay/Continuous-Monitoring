import { UnifiedFinding } from './finding';
import { Severity } from './severity';
import { SourceProvider } from './source';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FindingsQueryParams {
  page?: number;
  pageSize?: number;
  severity?: Severity[];
  source?: SourceProvider[];
  status?: string[];
  search?: string;
  sortBy?: keyof UnifiedFinding;
  sortOrder?: 'asc' | 'desc';
}

export interface DashboardSummary {
  totalFindings: number;
  activeFindings: number;
  resolvedLast24h: number;
  newLast24h: number;
  severityBreakdown: Record<Severity, number>;
  providerBreakdown: Record<SourceProvider, number>;
  trend: { date: string; count: number }[];
  integrations: IntegrationHealthStatus[];
}

export interface IntegrationHealthStatus {
  id: string;
  name: string;
  provider: SourceProvider;
  enabled: boolean;
  status: 'healthy' | 'degraded' | 'failed' | 'disabled';
  lastPollAt: string | null;
  findingsCount: number;
}

export interface WebhookResponse {
  received: number;
  new: number;
  updated: number;
}
