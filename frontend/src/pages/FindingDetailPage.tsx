import { useParams, useNavigate } from 'react-router-dom';
import { PROVIDER_DISPLAY_NAMES } from '@forgecomply/shared';
import { useFinding } from '../hooks/useFindings';

export function FindingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: finding, isLoading, error } = useFinding(id || '');

  if (isLoading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  if (error || !finding) {
    return (
      <div>
        <button className="btn btn-secondary" onClick={() => navigate('/findings')}>Back to Findings</button>
        <div className="card" style={{ marginTop: 16, color: 'var(--severity-critical)' }}>
          Finding not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate('/findings')} style={{ marginBottom: 16 }}>
        Back to Findings
      </button>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span className={`badge badge-${finding.severity.toLowerCase()}`}>{finding.severity}</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{finding.title}</h2>
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Provider</div>
            <div>{PROVIDER_DISPLAY_NAMES[finding.source]}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
            <div>{finding.status}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Resource</div>
            <div style={{ wordBreak: 'break-all' }}>{finding.resourceId}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Resource Type</div>
            <div>{finding.resourceType}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Severity Score</div>
            <div>{finding.severityScore}/100</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Region</div>
            <div>{finding.region || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>First Seen</div>
            <div>{new Date(finding.firstSeenAt).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Last Seen</div>
            <div>{new Date(finding.lastSeenAt).toLocaleString()}</div>
          </div>
        </div>

        {finding.description && (
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{finding.description}</p>
          </div>
        )}

        {finding.remediation && (
          <div style={{ marginBottom: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>Remediation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{finding.remediation}</p>
          </div>
        )}

        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 8 }}>Raw Payload</h3>
          <pre style={{
            background: 'var(--sidebar-bg)',
            color: '#e2e8f0',
            padding: 16,
            borderRadius: 8,
            fontSize: '0.8125rem',
            overflow: 'auto',
            maxHeight: 400,
          }}>
            {JSON.stringify(finding.rawPayload, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
