import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

/**
 * Validates that the specified route params are valid MongoDB ObjectIds.
 * Usage: validateObjectId('id') or validateObjectId('postId', 'id')
 */
export function validateObjectId(...params: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const param of params) {
      const value = req.params[param] as string | undefined;
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw ApiError.badRequest(`Invalid ${param}`);
      }
    }
    next();
  };
}
