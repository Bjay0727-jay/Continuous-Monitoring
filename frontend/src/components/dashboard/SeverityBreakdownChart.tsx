import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Severity, SEVERITY_COLORS } from '@forgecomply/shared';

interface Props {
  data: Record<Severity, number>;
}

const LABELS: Record<Severity, string> = {
  [Severity.CRITICAL]: 'Critical',
  [Severity.HIGH]: 'High',
  [Severity.MEDIUM]: 'Medium',
  [Severity.LOW]: 'Low',
  [Severity.INFO]: 'Info',
};

export function SeverityBreakdownChart({ data }: Props) {
  const chartData = Object.entries(data)
    .map(([severity, count]) => ({
      name: LABELS[severity as Severity],
      value: count,
      color: SEVERITY_COLORS[severity as Severity],
    }))
    .filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Severity Breakdown</div>
        <div className="empty-state">No active findings</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Severity Breakdown</div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
