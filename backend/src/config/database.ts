import Database from 'better-sqlite3';
import path from 'path';
import { initializeDatabase } from '../database/schema';

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    db = initializeDatabase(dbPath);
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
  }
}
