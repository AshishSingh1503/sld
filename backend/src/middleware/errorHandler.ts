import { Request, Response, NextFunction } from 'express';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(error.errors).map((err: any) => err.message)
    });
  }

  if (error.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate field value',
      field: Object.keys(error.keyValue)[0]
    });
  }

  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  res.status(error.statusCode || 500).json({
    error: error.message || 'Internal server error'
  });
};