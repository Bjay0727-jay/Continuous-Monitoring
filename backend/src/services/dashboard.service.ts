import { DashboardSummary, Severity, SourceProvider, IntegrationHealthStatus } from '@forgecomply/shared';
import { getDatabase } from '../db/connection';

export function getDashboardSummary(): DashboardSummary {
  const db = getDatabase();

  const totalRow = db.prepare('SELECT COUNT(*) as count FROM findings').get() as { count: number };
  const activeRow = db.prepare("SELECT COUNT(*) as count FROM findings WHERE status = 'ACTIVE'").get() as { count: number };

  const resolvedRow = db.prepare(`
    SELECT COUNT(*) as count FROM findings
    WHERE status = 'RESOLVED' AND updated_at >= datetime('now', '-1 day')
  `).get() as { count: number };

  const newRow = db.prepare(`
    SELECT COUNT(*) as count FROM findings
    WHERE created_at >= datetime('now', '-1 day')
  `).get() as { count: number };

  const severityRows = db.prepare(`
    SELECT severity, COUNT(*) as count FROM findings WHERE status = 'ACTIVE' GROUP BY severity
  `).all() as { severity: string; count: number }[];

  const severityBreakdown = {
    [Severity.CRITICAL]: 0,
    [Severity.HIGH]: 0,
    [Severity.MEDIUM]: 0,
    [Severity.LOW]: 0,
    [Severity.INFO]: 0,
  };
  for (const row of severityRows) {
    severityBreakdown[row.severity as Severity] = row.count;
  }

  const providerRows = db.prepare(`
    SELECT source, COUNT(*) as count FROM findings WHERE status = 'ACTIVE' GROUP BY source
  `).all() as { source: string; count: number }[];

  const providerBreakdown = {
    [SourceProvider.AWS_SECURITY_HUB]: 0,
    [SourceProvider.AZURE_DEFENDER]: 0,
    [SourceProvider.GITHUB_DEPENDABOT]: 0,
  };
  for (const row of providerRows) {
    providerBreakdown[row.source as SourceProvider] = row.count;
  }

  const trendRows = db.prepare(`
    SELECT DATE(first_seen_at) as date, COUNT(*) as count
    FROM findings
    WHERE first_seen_at >= datetime('now', '-30 days')
    GROUP BY DATE(first_seen_at)
    ORDER BY date
  `).all() as { date: string; count: number }[];

  const integrationRows = db.prepare(`
    SELECT i.id, i.name, i.provider, i.enabled, i.last_poll_at, i.last_poll_status,
           COUNT(f.id) as findings_count
    FROM integrations i
    LEFT JOIN findings f ON f.integration_id = i.id AND f.status = 'ACTIVE'
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `).all() as {
    id: string; name: string; provider: string; enabled: number;
    last_poll_at: string | null; last_poll_status: string | null; findings_count: number;
  }[];

  const integrations: IntegrationHealthStatus[] = integrationRows.map((row) => ({
    id: row.id,
    name: row.name,
    provider: row.provider as SourceProvider,
    enabled: row.enabled === 1,
    status: !row.enabled
      ? 'disabled' as const
      : row.last_poll_status === 'SUCCESS'
        ? 'healthy' as const
        : row.last_poll_status === 'PARTIAL'
          ? 'degraded' as const
          : row.last_poll_status === 'FAILED'
            ? 'failed' as const
            : 'disabled' as const,
    lastPollAt: row.last_poll_at,
    findingsCount: row.findings_count,
  }));

  return {
    totalFindings: totalRow.count,
    activeFindings: activeRow.count,
    resolvedLast24h: resolvedRow.count,
    newLast24h: newRow.count,
    severityBreakdown,
    providerBreakdown,
    trend: trendRows,
    integrations,
  };
}
