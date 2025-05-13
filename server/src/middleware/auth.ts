import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Add user ID to Express Request type
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = (decoded as any).userId;
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};