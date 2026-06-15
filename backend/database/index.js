import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '../data');
const databaseFile = join(dataDir, 'database.json');

const INITIAL_DATABASE = {
  produtos: [],
  movimentacoes: [],
};

export function getDatabasePath() {
  return databaseFile;
}

export function initializeDatabase() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(databaseFile)) {
    writeFileSync(databaseFile, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf8');
  }
}
