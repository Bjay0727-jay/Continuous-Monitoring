import { v4 as uuid } from 'uuid';
import { IntegrationConfig, IntegrationCreateInput, IntegrationUpdateInput } from '@forgecomply/shared';
import { getDatabase } from '../db/connection';
import { encrypt, decrypt } from '../utils/crypto';
import { logger } from '../utils/logger';

interface IntegrationRow {
  id: string;
  provider: string;
  name: string;
  credentials: string;
  poll_interval_minutes: number;
  enabled: number;
  last_poll_at: string | null;
  last_poll_status: string | null;
  last_poll_error: string | null;
  created_at: string;
  updated_at: string;
}

function rowToIntegration(row: IntegrationRow, maskCredentials = true): IntegrationConfig {
  let credentials: Record<string, string>;
  try {
    credentials = JSON.parse(decrypt(row.credentials));
  } catch {
    credentials = JSON.parse(row.credentials);
  }

  if (maskCredentials) {
    credentials = Object.fromEntries(
      Object.entries(credentials).map(([key, value]) => [
        key,
        typeof value === 'string' && value.length > 4
          ? '****' + value.slice(-4)
          : '****',
      ])
    );
  }

  return {
    id: row.id,
    provider: row.provider as IntegrationConfig['provider'],
    name: row.name,
    credentials,
    pollIntervalMinutes: row.poll_interval_minutes,
    enabled: row.enabled === 1,
    lastPollAt: row.last_poll_at,
    lastPollStatus: row.last_poll_status as IntegrationConfig['lastPollStatus'],
    lastPollError: row.last_poll_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getAllIntegrations(): IntegrationConfig[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM integrations ORDER BY created_at DESC').all() as IntegrationRow[];
  return rows.map((r) => rowToIntegration(r));
}

export function getIntegrationById(id: string, maskCredentials = true): IntegrationConfig | null {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM integrations WHERE id = ?').get(id) as IntegrationRow | undefined;
  return row ? rowToIntegration(row, maskCredentials) : null;
}

export function getEnabledIntegrations(): IntegrationConfig[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM integrations WHERE enabled = 1').all() as IntegrationRow[];
  return rows.map((r) => rowToIntegration(r, false));
}

export function createIntegration(input: IntegrationCreateInput): IntegrationConfig {
  const db = getDatabase();
  const id = uuid();
  const encryptedCreds = encrypt(JSON.stringify(input.credentials));

  db.prepare(`
    INSERT INTO integrations (id, provider, name, credentials, poll_interval_minutes, enabled)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, input.provider, input.name, encryptedCreds, input.pollIntervalMinutes || 15, input.enabled !== false ? 1 : 0);

  logger.info(`Created integration: ${input.name} (${input.provider})`);
  return getIntegrationById(id)!;
}

export function updateIntegration(id: string, input: IntegrationUpdateInput): IntegrationConfig | null {
  const db = getDatabase();
  const existing = db.prepare('SELECT * FROM integrations WHERE id = ?').get(id) as IntegrationRow | undefined;
  if (!existing) return null;

  const updates: string[] = ['updated_at = datetime(\'now\')'];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.credentials !== undefined) {
    updates.push('credentials = ?');
    values.push(encrypt(JSON.stringify(input.credentials)));
  }
  if (input.pollIntervalMinutes !== undefined) {
    updates.push('poll_interval_minutes = ?');
    values.push(input.pollIntervalMinutes);
  }
  if (input.enabled !== undefined) {
    updates.push('enabled = ?');
    values.push(input.enabled ? 1 : 0);
  }

  values.push(id);
  db.prepare(`UPDATE integrations SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  logger.info(`Updated integration: ${id}`);
  return getIntegrationById(id);
}

export function deleteIntegration(id: string): boolean {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM integrations WHERE id = ?').run(id);
  return result.changes > 0;
}

export function updatePollStatus(id: string, status: 'SUCCESS' | 'PARTIAL' | 'FAILED', error?: string): void {
  const db = getDatabase();
  db.prepare(`
    UPDATE integrations SET last_poll_at = datetime('now'), last_poll_status = ?, last_poll_error = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(status, error || null, id);
}
