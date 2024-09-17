// src/dbCode/dbSetup.ts
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import dbClient from '../dbcode/dbClient';

const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  //console.log('.env file found and loaded');
} else if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
  //console.log('.env.local file found and loaded');
} else {
  console.log('Neither .env nor .env.local file found.');
}

export function checkRequiredEnvVariables() {
  const requiredVariables: string[] = [
    // Add your required variables here
    // For example: 'DATABASE_URL', 'API_KEY', etc.
  ];

  for (const variable of requiredVariables) {
    if (!process.env[variable]) {
      console.error(`Error: Required environment variable ${variable} is not set.`);
      process.exit(1);
    }
  }

  console.log('All required environment variables are set.');
}

export function initializeTokens() {
  const bearerToken = process.env.INITIAL_BEARER_TOKEN;

  if (bearerToken) {
    if (dbClient.getCurrentBearerTokenDB() === null) {
      dbClient.setBearerTokenDB(bearerToken);
      console.log('Initial bearer token set from environment variable');
    }
  } else {
    console.log('No initial bearer token provided in environment variables');
  }
}

console.log('Database setup module loaded');
