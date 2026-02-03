import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

let db: SqlJsDatabase | null = null;
let dbPath: string;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Wrapper providing a better-sqlite3-compatible synchronous API on top of sql.js.
 * This lets all services work without code changes.
 */
export interface PreparedLike {
  run(...params: unknown[]): { changes: number };
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
}

export interface DatabaseLike {
  prepare(sql: string): PreparedLike;
  exec(sql: string): void;
  transaction<T>(fn: () => T): () => T;
  close(): void;
}

function saveToDisk(): void {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveToDiskSync();
    saveTimer = null;
  }, 500);
}

function saveToDiskSync(): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    logger.error('Failed to save database to disk', { error: (err as Error).message });
  }
}

function createDatabaseLike(sqlDb: SqlJsDatabase): DatabaseLike {
  return {
    prepare(sql: string): PreparedLike {
      return {
        run(...params: unknown[]): { changes: number } {
          sqlDb.run(sql, params as (string | number | null | Uint8Array)[]);
          const changesResult = sqlDb.exec('SELECT changes() as c');
          const changes = changesResult.length > 0 ? (changesResult[0].values[0][0] as number) : 0;
          saveToDisk();
          return { changes };
        },
        get(...params: unknown[]): Record<string, unknown> | undefined {
          const stmt = sqlDb.prepare(sql);
          stmt.bind(params as (string | number | null | Uint8Array)[]);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row as Record<string, unknown>;
          }
          stmt.free();
          return undefined;
        },
        all(...params: unknown[]): Record<string, unknown>[] {
          const stmt = sqlDb.prepare(sql);
          stmt.bind(params as (string | number | null | Uint8Array)[]);
          const results: Record<string, unknown>[] = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject() as Record<string, unknown>);
          }
          stmt.free();
          return results;
        },
      };
    },
    exec(sql: string): void {
      sqlDb.run(sql);
      saveToDisk();
    },
    transaction<T>(fn: () => T): () => T {
      return () => {
        sqlDb.run('BEGIN TRANSACTION');
        try {
          const result = fn();
          sqlDb.run('COMMIT');
          saveToDisk();
          return result;
        } catch (err) {
          sqlDb.run('ROLLBACK');
          throw err;
        }
      };
    },
    close(): void {
      saveToDiskSync();
      sqlDb.close();
    },
  };
}

let wrappedDb: DatabaseLike | null = null;

export async function initDatabase(): Promise<void> {
  if (wrappedDb) return;

  const SQL = await initSqlJs();

  dbPath = path.resolve(__dirname, '../../../data/forgecomply.db');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  const schemaPath = path.resolve(__dirname, './schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.run(schema);

  wrappedDb = createDatabaseLike(db);
  saveToDiskSync();
  logger.info('Database initialized', { path: dbPath });
}

export function getDatabase(): DatabaseLike {
  if (!wrappedDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return wrappedDb;
}

export function closeDatabase(): void {
  if (wrappedDb) {
    wrappedDb.close();
    wrappedDb = null;
    db = null;
    logger.info('Database connection closed');
  }
}
