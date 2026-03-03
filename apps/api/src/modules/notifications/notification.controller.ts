import type { Request, Response } from 'express';
import { notificationService } from './notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.getUserNotifications(req.user!.userId, req);
  res.json({ success: true, ...result });
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  res.json({ success: true, data: { count } });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markRead(req.params.id as string, req.user!.userId);
  res.json({ success: true, data: notification });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllRead(req.user!.userId);
  res.json({ success: true, data: null, message: 'All notifications marked as read' });
});
