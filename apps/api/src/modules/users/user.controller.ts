import type { Request, Response } from 'express';
import { userService } from './user.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.search(req);
  res.json({ success: true, ...result });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.params.username as string);
  res.json({ success: true, data: user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.user!.userId, req.body);
  res.json({ success: true, data: user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  await userService.changePassword(req.user!.userId, req.body);
  res.json({ success: true, data: null, message: 'Password changed successfully' });
});
