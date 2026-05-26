import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

const DB_FILE = join(process.cwd(), 'data', 'configs.db');

let db: Database.Database;

export function getDatabase() {
  if (!db) {
    // ایجاد دایرکتوری اگر وجود نداشته باشد
    const dataDir = join(process.cwd(), 'data');
    mkdirSync(dataDir, { recursive: true });
    
    db = new Database(DB_FILE);
    initializeDatabase();
  }
  return db;
}

export interface Config {
  id?: number;
  ping: number;
  config: string;
  channel: string;
  protocol: string;
  tested_at: string;
}

function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS configs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ping REAL NOT NULL,
      config TEXT NOT NULL,
      channel TEXT NOT NULL,
      protocol TEXT NOT NULL,
      tested_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createTableQuery);
}

export function clearAndInsertConfigs(configs: Config[]) {
  const database = getDatabase();
  const deleteQuery = database.prepare('DELETE FROM configs');
  const insertQuery = database.prepare(
    'INSERT INTO configs (ping, config, channel, protocol, tested_at) VALUES (?, ?, ?, ?, ?)'
  );

  const transaction = database.transaction(() => {
    deleteQuery.run();
    for (const config of configs) {
      insertQuery.run(config.ping, config.config, config.channel, config.protocol, config.tested_at);
    }
  });

  transaction();
}

export function getAllConfigs(): Config[] {
  const database = getDatabase();
  const query = database.prepare('SELECT id, ping, config, channel, protocol, tested_at FROM configs');
  return query.all() as Config[];
}
