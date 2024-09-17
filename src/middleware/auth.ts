import { Request, Response, NextFunction } from 'express';
import dbClient from '../dbcode/dbClient';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No bearer token provided' });
  }

  const bearerToken = authHeader.split(' ')[1];
  if (!dbClient.isValidBearerTokenDB(bearerToken)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid bearer token' });
  }

  next();
}
