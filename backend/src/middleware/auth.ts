import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-secret';

    const decoded = jwt.verify(token, jwtSecret) as {
      id: number;
      username: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid' });
  }
};
