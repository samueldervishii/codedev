import type { Request, Response } from 'express';
import { commentService } from './comment.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const result = await commentService.search(req);
  res.json({ success: true, ...result });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.create(req.params.postId as string, req.body, req.user!.userId);
  res.status(201).json({ success: true, data: comment });
});

export const listByPost = asyncHandler(async (req: Request, res: Response) => {
  const sort = (req.query.sort as string) || 'best';
  const { page, limit } = getPagination(req);
  const result = await commentService.listByPost(req.params.postId as string, sort, page, limit);
  res.json({
    success: true,
    data: result.comments,
    pagination: buildPaginationResponse(result.total, result.page, result.limit),
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const comment = await commentService.update(req.params.id as string, req.body, req.user!.userId);
  res.json({ success: true, data: comment });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await commentService.delete(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: null, message: 'Comment deleted' });
});

export const getUserComments = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = getPagination(req);
  const { comments, total } = await commentService.getUserComments(
    req.params.username as string,
    page,
    limit,
  );
  res.json({
    success: true,
    data: comments,
    pagination: buildPaginationResponse(total, page, limit),
  });
});
