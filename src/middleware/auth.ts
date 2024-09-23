import { Request, Response, NextFunction } from 'express';
import { dbClient } from '../dbcode/dbSetup';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No bearer token provided' });
  }
  const bearerToken = authHeader.split(' ')[1];
  try {
    const isValid = await dbClient.isValidBearerTokenDB(bearerToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid bearer token' });
    }
    next();
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
