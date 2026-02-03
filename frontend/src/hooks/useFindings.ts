import { useQuery } from '@tanstack/react-query';
import { FindingsQueryParams } from '@forgecomply/shared';
import { fetchFindings, fetchFindingById } from '../api/findings.api';

export function useFindings(params: FindingsQueryParams) {
  return useQuery({
    queryKey: ['findings', params],
    queryFn: () => fetchFindings(params),
    refetchInterval: 30_000,
  });
}

export function useFinding(id: string) {
  return useQuery({
    queryKey: ['finding', id],
    queryFn: () => fetchFindingById(id),
    enabled: !!id,
  });
}
