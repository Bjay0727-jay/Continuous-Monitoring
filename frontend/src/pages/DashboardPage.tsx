import { useDashboard } from '../hooks/useDashboard';
import { StatCards } from '../components/dashboard/StatCards';
import { SeverityBreakdownChart } from '../components/dashboard/SeverityBreakdownChart';
import { FindingsTrendChart } from '../components/dashboard/FindingsTrendChart';
import { ProviderStatusCards } from '../components/dashboard/ProviderStatusCards';

export function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>ForgeComply 360 Continuous Monitoring Overview</p>
        </div>
        <div className="loading"><div className="spinner" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>
        <div className="card" style={{ color: 'var(--severity-critical)' }}>
          Failed to load dashboard: {error.message}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>ForgeComply 360 Continuous Monitoring Overview</p>
      </div>

      <StatCards
        totalFindings={data.totalFindings}
        activeFindings={data.activeFindings}
        newLast24h={data.newLast24h}
        resolvedLast24h={data.resolvedLast24h}
      />

      <div className="grid-2" style={{ marginTop: 24 }}>
        <SeverityBreakdownChart data={data.severityBreakdown} />
        <FindingsTrendChart data={data.trend} />
      </div>

      <div style={{ marginTop: 24 }}>
        <ProviderStatusCards integrations={data.integrations} />
      </div>
    </div>
  );
}
