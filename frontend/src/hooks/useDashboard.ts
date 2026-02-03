import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary } from '../api/dashboard.api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30_000,
  });
}
