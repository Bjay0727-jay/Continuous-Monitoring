CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('AWS_SECURITY_HUB', 'AZURE_DEFENDER', 'GITHUB_DEPENDABOT')),
  name TEXT NOT NULL,
  credentials TEXT NOT NULL DEFAULT '{}',
  poll_interval_minutes INTEGER NOT NULL DEFAULT 15,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_poll_at TEXT,
  last_poll_status TEXT CHECK (last_poll_status IN ('SUCCESS', 'PARTIAL', 'FAILED')),
  last_poll_error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS findings (
  id TEXT PRIMARY KEY,
  external_id TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('AWS_SECURITY_HUB', 'AZURE_DEFENDER', 'GITHUB_DEPENDABOT')),
  integration_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
  severity_score REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'SUPPRESSED')),
  resource_type TEXT NOT NULL DEFAULT '',
  resource_id TEXT NOT NULL DEFAULT '',
  region TEXT,
  remediation TEXT,
  raw_payload TEXT NOT NULL DEFAULT '{}',
  first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(source, external_id),
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
CREATE INDEX IF NOT EXISTS idx_findings_source ON findings(source);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_last_seen ON findings(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_findings_integration ON findings(integration_id);

CREATE TABLE IF NOT EXISTS poll_history (
  id TEXT PRIMARY KEY,
  integration_id TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  findings_count INTEGER NOT NULL DEFAULT 0,
  new_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED')),
  error_message TEXT,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);
