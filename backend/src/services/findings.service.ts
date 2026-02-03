import { v4 as uuid } from 'uuid';
import { UnifiedFinding, FindingStatus, Severity, SourceProvider, PaginatedResponse, FindingsQueryParams } from '@forgecomply/shared';
import { getDatabase } from '../db/connection';
import { parsePagination, paginationToSql } from '../utils/pagination';
import { logger } from '../utils/logger';

interface FindingRow {
  id: string;
  external_id: string;
  source: string;
  integration_id: string;
  title: string;
  description: string;
  severity: string;
  severity_score: number;
  status: string;
  resource_type: string;
  resource_id: string;
  region: string | null;
  remediation: string | null;
  raw_payload: string;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

function rowToFinding(row: FindingRow): UnifiedFinding {
  return {
    id: row.id,
    externalId: row.external_id,
    source: row.source as SourceProvider,
    integrationId: row.integration_id,
    title: row.title,
    description: row.description,
    severity: row.severity as Severity,
    severityScore: row.severity_score,
    status: row.status as FindingStatus,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    region: row.region,
    remediation: row.remediation,
    rawPayload: JSON.parse(row.raw_payload),
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getFindings(params: FindingsQueryParams): PaginatedResponse<UnifiedFinding> {
  const db = getDatabase();
  const { page, pageSize } = parsePagination({
    page: params.page?.toString(),
    pageSize: params.pageSize?.toString(),
  });
  const { limit, offset } = paginationToSql({ page, pageSize });

  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.severity?.length) {
    conditions.push(`severity IN (${params.severity.map(() => '?').join(',')})`);
    values.push(...params.severity);
  }
  if (params.source?.length) {
    conditions.push(`source IN (${params.source.map(() => '?').join(',')})`);
    values.push(...params.source);
  }
  if (params.status?.length) {
    conditions.push(`status IN (${params.status.map(() => '?').join(',')})`);
    values.push(...params.status);
  }
  if (params.search) {
    conditions.push(`(title LIKE ? OR description LIKE ? OR resource_id LIKE ?)`);
    const search = `%${params.search}%`;
    values.push(search, search, search);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortColumn = mapSortColumn(params.sortBy || 'lastSeenAt');
  const sortOrder = params.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM findings ${whereClause}`).get(...values) as { total: number };
  const total = countRow.total;

  const rows = db
    .prepare(`SELECT * FROM findings ${whereClause} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`)
    .all(...values, limit, offset) as FindingRow[];

  return {
    data: rows.map(rowToFinding),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export function getFindingById(id: string): UnifiedFinding | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM findings WHERE id = ?').get(id) as FindingRow | undefined;
  return row ? rowToFinding(row) : null;
}

export function upsertFindings(findings: Omit<UnifiedFinding, 'id' | 'createdAt' | 'updatedAt'>[]): { new: number; updated: number } {
  const db = getDatabase();
  let newCount = 0;
  let updatedCount = 0;

  const upsert = db.prepare(`
    INSERT INTO findings (id, external_id, source, integration_id, title, description, severity, severity_score, status, resource_type, resource_id, region, remediation, raw_payload, first_seen_at, last_seen_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(source, external_id) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      severity = excluded.severity,
      severity_score = excluded.severity_score,
      status = excluded.status,
      resource_type = excluded.resource_type,
      resource_id = excluded.resource_id,
      region = excluded.region,
      remediation = excluded.remediation,
      raw_payload = excluded.raw_payload,
      last_seen_at = excluded.last_seen_at,
      updated_at = datetime('now')
  `);

  const existsCheck = db.prepare('SELECT id FROM findings WHERE source = ? AND external_id = ?');

  const transaction = db.transaction(() => {
    for (const finding of findings) {
      const existing = existsCheck.get(finding.source, finding.externalId) as { id: string } | undefined;
      const id = existing?.id || uuid();

      upsert.run(
        id,
        finding.externalId,
        finding.source,
        finding.integrationId,
        finding.title,
        finding.description,
        finding.severity,
        finding.severityScore,
        finding.status,
        finding.resourceType,
        finding.resourceId,
        finding.region,
        finding.remediation,
        JSON.stringify(finding.rawPayload),
        finding.firstSeenAt,
        finding.lastSeenAt
      );

      if (existing) {
        updatedCount++;
      } else {
        newCount++;
      }
    }
  });

  transaction();
  logger.info(`Upserted findings: ${newCount} new, ${updatedCount} updated`);
  return { new: newCount, updated: updatedCount };
}

function mapSortColumn(field: string): string {
  const map: Record<string, string> = {
    lastSeenAt: 'last_seen_at',
    firstSeenAt: 'first_seen_at',
    severity: 'severity_score',
    title: 'title',
    source: 'source',
    status: 'status',
    createdAt: 'created_at',
  };
  return map[field] || 'last_seen_at';
}
