import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: { date: string; count: number }[];
}

export function FindingsTrendChart({ data }: Props) {
  return (
    <div className="card">
      <div className="card-title">Findings Trend (30 days)</div>
      {data.length === 0 ? (
        <div className="empty-state">No trend data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis fontSize={12} />
            <Tooltip
              labelFormatter={(v) => new Date(v as string).toLocaleDateString()}
              contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--fc-primary)"
              fill="var(--fc-primary)"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
