// src/types/dbInterfaces.ts

export interface ITokenResult {
  token: string;
}

export interface IDbClient {
  setBearerTokenDB(token: string): boolean;
  isValidBearerTokenDB(token: string): boolean;
  getCurrentBearerTokenDB(): string | null;
  changeBearerTokenDB(currentToken: string, newToken: string): boolean;
}
