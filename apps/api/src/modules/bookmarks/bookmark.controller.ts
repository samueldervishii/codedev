import type { Request, Response } from 'express';
import { bookmarkService } from './bookmark.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const addBookmark = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookmarkService.addBookmark(req.params.id as string, req.user!.userId);
  res.status(201).json({ success: true, data: result });
});

export const removeBookmark = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookmarkService.removeBookmark(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: result });
});

export const getUserBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookmarkService.getUserBookmarks(req.user!.userId, req);
  res.json({ success: true, ...result });
});

export const batchGetBookmarks = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookmarkService.batchGetBookmarks(req.body.postIds, req.user!.userId);
  res.json({ success: true, data: result });
});
