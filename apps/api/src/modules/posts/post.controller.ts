import type { Request, Response } from 'express';
import { postService } from './post.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.create(req.params.name as string, req.body, req.user!.userId);
  res.status(201).json({ success: true, data: post });
});

export const listByCommunity = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.listByCommunity(req.params.name as string, req);
  res.json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.getById(req.params.id as string);
  res.json({ success: true, data: post });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.update(req.params.id as string, req.body.body, req.user!.userId);
  res.json({ success: true, data: post });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await postService.delete(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: null, message: 'Post deleted' });
});

export const getHomeFeed = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.getHomeFeed(req.user!.userId, req);
  res.json({ success: true, ...result });
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.listAll(req);
  res.json({ success: true, ...result });
});

export const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
  const result = await postService.getUserPosts(req.params.username as string, req);
  res.json({ success: true, ...result });
});

export const crosspost = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.crosspost(req.params.id as string, req.body.communityName, req.user!.userId);
  res.status(201).json({ success: true, data: post });
});

export const togglePin = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.togglePin(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: post });
});

export const toggleLock = asyncHandler(async (req: Request, res: Response) => {
  const post = await postService.toggleLock(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: post });
});
