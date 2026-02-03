import { DashboardSummary } from '@forgecomply/shared';
import { api } from './client';

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>('/dashboard/summary');
}
