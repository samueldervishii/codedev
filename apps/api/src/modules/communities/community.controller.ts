import type { Request, Response } from 'express';
import { communityService } from './community.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const trending = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const communities = await communityService.getTrending(limit);
  res.json({ success: true, data: communities });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const community = await communityService.create(req.body, req.user!.userId);
  res.status(201).json({ success: true, data: community });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await communityService.list(req);
  res.json({ success: true, ...result });
});

export const getByName = asyncHandler(async (req: Request, res: Response) => {
  const community = await communityService.getByName(req.params.name as string);
  res.json({ success: true, data: community });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const community = await communityService.update(req.params.name as string, req.body, req.user!.userId);
  res.json({ success: true, data: community });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await communityService.delete(req.params.name as string, req.user!.userId);
  res.json({ success: true, data: null, message: 'Community deleted' });
});

export const join = asyncHandler(async (req: Request, res: Response) => {
  const result = await communityService.join(req.params.name as string, req.user!.userId);
  res.json({ success: true, data: result });
});

export const leave = asyncHandler(async (req: Request, res: Response) => {
  const result = await communityService.leave(req.params.name as string, req.user!.userId);
  res.json({ success: true, data: result });
});

export const banUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await communityService.banUser(req.params.name as string, req.body.username, req.user!.userId);
  res.json({ success: true, data: result });
});

export const unbanUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await communityService.unbanUser(req.params.name as string, req.body.username, req.user!.userId);
  res.json({ success: true, data: result });
});

export const addModerator = asyncHandler(async (req: Request, res: Response) => {
  const result = await communityService.addModerator(req.params.name as string, req.body.username, req.user!.userId);
  res.json({ success: true, data: result });
});

export const removeModerator = asyncHandler(async (req: Request, res: Response) => {
  const result = await communityService.removeModerator(req.params.name as string, req.body.username, req.user!.userId);
  res.json({ success: true, data: result });
});
