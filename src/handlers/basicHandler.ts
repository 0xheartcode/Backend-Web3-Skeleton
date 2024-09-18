import { Request, Response } from 'express';
import { dbClient } from '../dbcode/dbSetup';

export async function ping(req: Request, res: Response) {
  res.send('Pong!');
}

export async function safePing(req: Request, res: Response) {
  res.send('Safe Pong!');
}

export async function getCurrentToken(req: Request, res: Response) {
  try {
    const token = await dbClient.getCurrentBearerTokenDB();
    if (token) {
      res.json({ token });
    } else {
      res.status(404).json({ error: 'No Bearer Token set' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function setNewBearerToken(req: Request, res: Response) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const result = await dbClient.setBearerTokenDB(token);
    if (result) {
      res.status(201).json({ message: 'Bearer Token set successfully' });
    } else {
      res.status(409).json({ error: 'Bearer Token has already been set' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function changeBearerToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  const { newToken } = req.body;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!newToken) {
    return res.status(400).json({ error: 'New token is required' });
  }

  const currentToken = authHeader.split(' ')[1];

  try {
    const isValid = await dbClient.isValidBearerTokenDB(currentToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Bearer Token' });
    }

    const result = await dbClient.changeBearerTokenDB(currentToken, newToken);
    if (result) {
      res.json({ message: 'Bearer Token changed successfully' });
    } else {
      res.status(500).json({ error: 'Failed to change Bearer Token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
