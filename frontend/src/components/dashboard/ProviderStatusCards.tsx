import { IntegrationHealthStatus, PROVIDER_DISPLAY_NAMES } from '@forgecomply/shared';

interface Props {
  integrations: IntegrationHealthStatus[];
}

export function ProviderStatusCards({ integrations }: Props) {
  if (integrations.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Integration Status</div>
        <div className="empty-state">
          No integrations configured. Add one in the Integrations page.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Integration Status</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {integrations.map((int) => (
          <div
            key={int.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className={`status-dot ${int.status}`} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{int.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {PROVIDER_DISPLAY_NAMES[int.provider]}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{int.findingsCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {int.lastPollAt
                  ? `Last poll: ${new Date(int.lastPollAt).toLocaleTimeString()}`
                  : 'Never polled'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
