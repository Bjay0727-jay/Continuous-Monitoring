import { useState } from 'react';
import { SourceProvider, PROVIDER_DISPLAY_NAMES, IntegrationConfig } from '@forgecomply/shared';
import {
  useIntegrations,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useTriggerPoll,
} from '../hooks/useIntegrations';

const PROVIDER_FIELDS: Record<SourceProvider, { key: string; label: string; type: string }[]> = {
  [SourceProvider.AWS_SECURITY_HUB]: [
    { key: 'accessKeyId', label: 'Access Key ID', type: 'text' },
    { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
    { key: 'region', label: 'Region', type: 'text' },
  ],
  [SourceProvider.AZURE_DEFENDER]: [
    { key: 'tenantId', label: 'Tenant ID', type: 'text' },
    { key: 'clientId', label: 'Client ID', type: 'text' },
    { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    { key: 'subscriptionId', label: 'Subscription ID', type: 'text' },
  ],
  [SourceProvider.GITHUB_DEPENDABOT]: [
    { key: 'token', label: 'Personal Access Token', type: 'password' },
    { key: 'repository', label: 'Repository (owner/repo)', type: 'text' },
  ],
};

export function IntegrationsPage() {
  const { data: integrations, isLoading } = useIntegrations();
  const createMutation = useCreateIntegration();
  const updateMutation = useUpdateIntegration();
  const deleteMutation = useDeleteIntegration();
  const pollMutation = useTriggerPoll();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formProvider, setFormProvider] = useState<SourceProvider>(SourceProvider.AWS_SECURITY_HUB);
  const [formName, setFormName] = useState('');
  const [formCreds, setFormCreds] = useState<Record<string, string>>({});
  const [formInterval, setFormInterval] = useState(15);
  const [formEnabled, setFormEnabled] = useState(true);

  const openCreate = () => {
    setEditingId(null);
    setFormProvider(SourceProvider.AWS_SECURITY_HUB);
    setFormName('');
    setFormCreds({});
    setFormInterval(15);
    setFormEnabled(true);
    setShowModal(true);
  };

  const openEdit = (int: IntegrationConfig) => {
    setEditingId(int.id);
    setFormProvider(int.provider);
    setFormName(int.name);
    setFormCreds({});
    setFormInterval(int.pollIntervalMinutes);
    setFormEnabled(int.enabled);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        input: {
          name: formName,
          ...(Object.keys(formCreds).length > 0 ? { credentials: formCreds } : {}),
          pollIntervalMinutes: formInterval,
          enabled: formEnabled,
        },
      });
    } else {
      createMutation.mutate({
        provider: formProvider,
        name: formName,
        credentials: formCreds,
        pollIntervalMinutes: formInterval,
        enabled: formEnabled,
      });
    }
    setShowModal(false);
  };

  const statusColor = (int: IntegrationConfig) => {
    if (!int.enabled) return 'disabled';
    if (int.lastPollStatus === 'SUCCESS') return 'healthy';
    if (int.lastPollStatus === 'PARTIAL') return 'degraded';
    if (int.lastPollStatus === 'FAILED') return 'failed';
    return 'disabled';
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Integrations</h1>
          <p>Configure and manage your security monitoring sources</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Integration
        </button>
      </div>

      {isLoading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : !integrations || integrations.length === 0 ? (
        <div className="card empty-state">
          <p>No integrations configured yet.</p>
          <p style={{ marginTop: 8 }}>Add your first integration to start pulling security findings.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>
            + Add Integration
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {integrations.map((int) => (
            <div key={int.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span className={`status-dot ${statusColor(int)}`} />
                <div>
                  <div style={{ fontWeight: 600 }}>{int.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {PROVIDER_DISPLAY_NAMES[int.provider]}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                <div>Poll interval: every {int.pollIntervalMinutes} min</div>
                <div>Status: {int.enabled ? (int.lastPollStatus || 'Pending') : 'Disabled'}</div>
                {int.lastPollAt && <div>Last poll: {new Date(int.lastPollAt).toLocaleString()}</div>}
                {int.lastPollError && (
                  <div style={{ color: 'var(--severity-critical)', marginTop: 4 }}>
                    Error: {int.lastPollError}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(int)}>Edit</button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => pollMutation.mutate(int.id)}
                  disabled={!int.enabled}
                >
                  Poll Now
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => { if (confirm('Delete this integration?')) deleteMutation.mutate(int.id); }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Edit Integration' : 'Add Integration'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>X</button>
            </div>

            {!editingId && (
              <div className="form-group">
                <label className="form-label">Provider</label>
                <select
                  className="form-select"
                  value={formProvider}
                  onChange={(e) => {
                    setFormProvider(e.target.value as SourceProvider);
                    setFormCreds({});
                  }}
                >
                  {Object.entries(PROVIDER_DISPLAY_NAMES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Production AWS Account"
              />
            </div>

            {PROVIDER_FIELDS[formProvider].map((field) => (
              <div className="form-group" key={field.key}>
                <label className="form-label">{field.label}</label>
                <input
                  className="form-input"
                  type={field.type}
                  value={formCreds[field.key] || ''}
                  onChange={(e) => setFormCreds({ ...formCreds, [field.key]: e.target.value })}
                  placeholder={editingId ? '(leave blank to keep existing)' : ''}
                />
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Poll Interval (minutes)</label>
              <input
                className="form-input"
                type="number"
                min={1}
                max={1440}
                value={formInterval}
                onChange={(e) => setFormInterval(parseInt(e.target.value, 10))}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formEnabled}
                  onChange={(e) => setFormEnabled(e.target.checked)}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>Enabled</span>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!formName}>
                {editingId ? 'Save Changes' : 'Create Integration'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
