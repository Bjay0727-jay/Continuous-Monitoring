export interface PaginationParams {
  page: number;
  pageSize: number;
}

export function parsePagination(query: { page?: string; pageSize?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize || '25', 10)));
  return { page, pageSize };
}

export function paginationToSql(params: PaginationParams): { limit: number; offset: number } {
  return {
    limit: params.pageSize,
    offset: (params.page - 1) * params.pageSize,
  };
}
