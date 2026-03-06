import type { Request, Response } from 'express';
import { notificationService, addSseClient } from './notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { verifyAccessToken } from '../../utils/jwt.js';

export const stream = (req: Request, res: Response) => {
  // Auth via query param since EventSource can't send headers
  const token = req.query.token as string;
  if (!token) { res.status(401).json({ message: 'Token required' }); return; }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  addSseClient(payload.userId, res);

  // Keep-alive every 30s
  const keepAlive = setInterval(() => res.write(': ping\n\n'), 30000);
  res.on('close', () => clearInterval(keepAlive));
};

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
