// src/dbcode/dbSetup.ts

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import MongoDbClient from './mongoDbClient';

const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  console.log('Neither .env nor .env.local file found.');
}

export function checkRequiredEnvVariables() {
  const requiredVariables = ['MONGO_URI' ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      console.error(`Error: Required environment variable ${variable} is not set.`);
      process.exit(1);
    }
  }

  console.log('All required environment variables are set.');
}

let dbClient: MongoDbClient;

export async function initializeDatabase() {
  const mongoUri = process.env.MONGO_URI as string;

  dbClient = new MongoDbClient(mongoUri);
  await dbClient.connect();

  const bearerToken = process.env.INITIAL_BEARER_TOKEN;
  if (bearerToken) {
    const currentToken = await dbClient.getCurrentBearerTokenDB();
    if (currentToken === null) {
      await dbClient.setBearerTokenDB(bearerToken);
      console.log('Initial bearer token set from environment variable');
    }
  } else {
    console.log('No initial bearer token provided in environment variables');
  }
}

export { dbClient };

console.log('Database setup module loaded');
