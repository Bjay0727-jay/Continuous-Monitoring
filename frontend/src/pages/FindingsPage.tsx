import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Severity, SourceProvider, FindingsQueryParams, PROVIDER_DISPLAY_NAMES } from '@forgecomply/shared';
import { useFindings } from '../hooks/useFindings';

export function FindingsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useState<FindingsQueryParams>({
    page: 1,
    pageSize: 25,
    sortBy: 'lastSeenAt',
    sortOrder: 'desc',
  });

  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const queryParams: FindingsQueryParams = {
    ...params,
    severity: severityFilter ? [severityFilter as Severity] : undefined,
    source: sourceFilter ? [sourceFilter as SourceProvider] : undefined,
    search: searchTerm || undefined,
  };

  const { data, isLoading } = useFindings(queryParams);

  const handleSort = (field: string) => {
    setParams((prev) => ({
      ...prev,
      sortBy: field as FindingsQueryParams['sortBy'],
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const severityBadge = (severity: string) => (
    <span className={`badge badge-${severity.toLowerCase()}`}>{severity}</span>
  );

  return (
    <div>
      <div className="page-header">
        <h1>Findings</h1>
        <p>Security findings from all integrated providers</p>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            className="form-input"
            style={{ maxWidth: 300 }}
            placeholder="Search findings..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setParams((p) => ({ ...p, page: 1 }));
            }}
          />
          <select
            className="form-select"
            style={{ maxWidth: 160 }}
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setParams((p) => ({ ...p, page: 1 }));
            }}
          >
            <option value="">All Severities</option>
            {Object.values(Severity).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ maxWidth: 200 }}
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setParams((p) => ({ ...p, page: 1 }));
            }}
          >
            <option value="">All Providers</option>
            {Object.entries(PROVIDER_DISPLAY_NAMES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : !data || data.data.length === 0 ? (
          <div className="empty-state">
            <p>No findings match your criteria.</p>
          </div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('severity')}>Severity</th>
                  <th onClick={() => handleSort('title')}>Title</th>
                  <th onClick={() => handleSort('source')}>Provider</th>
                  <th>Resource</th>
                  <th onClick={() => handleSort('status')}>Status</th>
                  <th onClick={() => handleSort('lastSeenAt')}>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((finding) => (
                  <tr
                    key={finding.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/findings/${finding.id}`)}
                  >
                    <td>{severityBadge(finding.severity)}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {finding.title}
                    </td>
                    <td>{PROVIDER_DISPLAY_NAMES[finding.source]}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {finding.resourceId}
                    </td>
                    <td>
                      <span className={`badge badge-${finding.status === 'ACTIVE' ? 'high' : finding.status === 'RESOLVED' ? 'info' : 'medium'}`}>
                        {finding.status}
                      </span>
                    </td>
                    <td>{new Date(finding.lastSeenAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <span className="pagination-info">
                Showing {(data.page - 1) * data.pageSize + 1}–{Math.min(data.page * data.pageSize, data.total)} of {data.total}
              </span>
              <div className="pagination-controls">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={data.page <= 1}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                >
                  Previous
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
