import type { Request, Response } from 'express';
import { voteService } from './vote.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const voteOnPost = asyncHandler(async (req: Request, res: Response) => {
  const result = await voteService.voteOnPost(req.params.id as string, req.body, req.user!.userId);
  res.json({ success: true, data: result });
});

export const removePostVote = asyncHandler(async (req: Request, res: Response) => {
  const result = await voteService.removePostVote(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: result });
});

export const voteOnComment = asyncHandler(async (req: Request, res: Response) => {
  const result = await voteService.voteOnComment(req.params.id as string, req.body, req.user!.userId);
  res.json({ success: true, data: result });
});

export const removeCommentVote = asyncHandler(async (req: Request, res: Response) => {
  const result = await voteService.removeCommentVote(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: result });
});

export const getUserVoteOnPost = asyncHandler(async (req: Request, res: Response) => {
  const result = await voteService.getUserVoteOnPost(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: result });
});

export const batchGetVotes = asyncHandler(async (req: Request, res: Response) => {
  const result = await voteService.batchGetVotes(req.body, req.user!.userId);
  res.json({ success: true, data: result });
});
