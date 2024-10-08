import { Request, Response } from 'express';
import dbClient from '../dbcode/dbClient';

export function ping(req: Request, res: Response) {
  res.send('Pong!');
}

export function safePing(req: Request, res: Response) {
  res.send('Safe Pong!');
}

export function getCurrentToken(req: Request, res: Response) {
  const token = dbClient.getCurrentBearerTokenDB();
  if (token) {
    res.json({ token });
  } else {
    res.status(404).json({ error: 'No Bearer Token set' });
  }
}

export function setNewBearerToken(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const result = dbClient.setBearerTokenDB(token);

  if (result) {
    res.status(201).json({ message: 'Bearer Token set successfully' });
  } else {
    res.status(409).json({ error: 'Bearer Token has already been set' });
  }
}

export function changeBearerToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  const { newToken } = req.body;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!newToken) {
    return res.status(400).json({ error: 'New token is required' });
  }

  const currentToken = authHeader.split(' ')[1];

  if (!dbClient.isValidBearerTokenDB(currentToken)) {
    return res.status(401).json({ error: 'Invalid Bearer Token' });
  }

  const result = dbClient.changeBearerTokenDB(currentToken, newToken);

  if (result) {
    res.json({ message: 'Bearer Token changed successfully' });
  } else {
    res.status(500).json({ error: 'Failed to change Bearer Token' });
  }
}
