import type { Request } from 'express';
import { LIMITS } from '@devhub/shared';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export function getPagination(req: Request): PaginationOptions {
  const page = Math.min(1000, Math.max(1, parseInt(req.query.page as string) || 1));
  const limit = Math.min(
    LIMITS.PAGE_SIZE_MAX,
    Math.max(1, parseInt(req.query.limit as string) || LIMITS.PAGE_SIZE_DEFAULT),
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationResponse(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
