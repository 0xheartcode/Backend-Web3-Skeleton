import debug from 'debug';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initializeTokens } from '../dbcode/dbSetup';
import { ITokenResult, IDbClient } from '../types/dbInterfaces';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = debug('app:database');
const dbPath = path.resolve(__dirname, '../../utils/db/database.db');
// Check if the database file exists
const dbExists = fs.existsSync(dbPath);

const db = new Database(dbPath, { verbose: log });

//
// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS bearer_token (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT(255) NOT NULL UNIQUE
  );
  
`);

// Initialize tokens only if the database file didn't exist before
if (!dbExists) {
  console.log('New database created. Initializing tokens...');
  initializeTokens();
}


const dbClient: IDbClient = {
  // Function to set the bearer token
  setBearerTokenDB(token: string): boolean {
    const stmt = db.prepare('SELECT * FROM bearer_token');
    const existingToken = stmt.get();
    if (existingToken) {
      return false; 
    }
    const insertStmt = db.prepare('INSERT INTO bearer_token (token) VALUES (?)');
    insertStmt.run(token);
    return true; 
  },

  // Function to check if the bearer token is valid
  isValidBearerTokenDB(token: string): boolean {
    const stmt = db.prepare('SELECT * FROM bearer_token WHERE token = ?');
    const result = stmt.get(token);
    return !!result;
  },

  // Function to get the current bearer token
  getCurrentBearerTokenDB(): string | null {
    const stmt = db.prepare('SELECT token FROM bearer_token LIMIT 1');
    const result = stmt.get() as ITokenResult | undefined;
    return result ? result.token : null;
  },

  changeBearerTokenDB(currentToken: string, newToken: string): boolean {
    const stmt = db.prepare('UPDATE bearer_token SET token = ? WHERE token = ?');
    const result = stmt.run(newToken, currentToken);
    return result.changes > 0;
  }
};

export default dbClient;
