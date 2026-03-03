import type { Request, Response } from 'express';
import { reportService } from './report.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const reportPost = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.reportPost(req.params.id as string, req.body.reason, req.user!.userId);
  res.status(201).json({ success: true, data: report });
});

export const reportComment = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.reportComment(req.params.id as string, req.body.reason, req.user!.userId);
  res.status(201).json({ success: true, data: report });
});

export const listByCommunity = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.listByCommunity(req.params.name as string, req.user!.userId, req);
  res.json({ success: true, ...result });
});

export const resolve = asyncHandler(async (req: Request, res: Response) => {
  const report = await reportService.resolve(req.params.id as string, req.user!.userId, req.body.action);
  res.json({ success: true, data: report });
});
