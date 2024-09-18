// src/types/dbInterfaces.ts

export interface ITokenResult {
  token: string;
}

export interface IDbClient {
  setBearerTokenDB(token: string): Promise<boolean>;
  isValidBearerTokenDB(token: string): Promise<boolean>;
  getCurrentBearerTokenDB(): Promise<string | null>;
  changeBearerTokenDB(currentToken: string, newToken: string): Promise<boolean>;
}
