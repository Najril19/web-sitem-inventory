import { initializeDatabase } from './schema';
import path from 'path';

const dbPath = path.join(__dirname, '../../database.sqlite');
initializeDatabase(dbPath);
console.log('Database initialization complete!');
