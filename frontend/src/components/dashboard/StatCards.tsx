interface StatCardProps {
  label: string;
  value: number;
  color?: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--text-primary)', marginTop: 4 }}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}

interface Props {
  totalFindings: number;
  activeFindings: number;
  newLast24h: number;
  resolvedLast24h: number;
}

export function StatCards({ totalFindings, activeFindings, newLast24h, resolvedLast24h }: Props) {
  return (
    <div className="grid-4">
      <StatCard label="Total Findings" value={totalFindings} />
      <StatCard label="Active" value={activeFindings} color="var(--severity-high)" />
      <StatCard label="New (24h)" value={newLast24h} color="var(--severity-critical)" />
      <StatCard label="Resolved (24h)" value={resolvedLast24h} color="var(--status-healthy)" />
    </div>
  );
}
