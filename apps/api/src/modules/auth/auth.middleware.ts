import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../../utils/jwt.js';
import { ApiError } from '../../utils/ApiError.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access token required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }
}

/** Optional auth — attaches user if token present, doesn't fail if missing */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    } catch {
      // Invalid token — just continue without user
    }
  }

  next();
}
