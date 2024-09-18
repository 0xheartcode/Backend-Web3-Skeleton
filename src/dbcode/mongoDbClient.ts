// src/dbcode/mongoDbClient.ts

import { MongoClient, Db } from 'mongodb';
import { IDbClient } from '../types/dbInterfaces';

class MongoDbClient implements IDbClient {
  private client: MongoClient;
  private db: Db | null = null;

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db('yourDatabaseName');
    console.log('Connected to MongoDB');
  }

  async setBearerTokenDB(token: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    const collection = this.db.collection('bearer_tokens');
    const existingToken = await collection.findOne({});
    if (existingToken) return false;
    await collection.insertOne({ token });
    return true;
  }

  async isValidBearerTokenDB(token: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    const collection = this.db.collection('bearer_tokens');
    const result = await collection.findOne({ token });
    return !!result;
  }

  async getCurrentBearerTokenDB(): Promise<string | null> {
    if (!this.db) throw new Error('Database not connected');
    const collection = this.db.collection('bearer_tokens');
    const result = await collection.findOne({});
    return result ? result.token : null;
  }

  async changeBearerTokenDB(currentToken: string, newToken: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not connected');
    const collection = this.db.collection('bearer_tokens');
    const result = await collection.updateOne({ token: currentToken }, { $set: { token: newToken } });
    return result.modifiedCount > 0;
  }
}

export default MongoDbClient;
