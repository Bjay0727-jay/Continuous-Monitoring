import { PaginatedResponse, UnifiedFinding, FindingsQueryParams } from '@forgecomply/shared';
import { api } from './client';

export function fetchFindings(params: FindingsQueryParams): Promise<PaginatedResponse<UnifiedFinding>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString());
  if (params.severity?.length) searchParams.set('severity', params.severity.join(','));
  if (params.source?.length) searchParams.set('source', params.source.join(','));
  if (params.status?.length) searchParams.set('status', params.status.join(','));
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy as string);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const qs = searchParams.toString();
  return api.get<PaginatedResponse<UnifiedFinding>>(`/findings${qs ? `?${qs}` : ''}`);
}

export function fetchFindingById(id: string): Promise<UnifiedFinding> {
  return api.get<UnifiedFinding>(`/findings/${id}`);
}
