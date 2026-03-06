import { Notification } from './notification.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import type { Request, Response } from 'express';

// SSE client registry
const sseClients = new Map<string, Set<Response>>();

export function addSseClient(userId: string, res: Response) {
  if (!sseClients.has(userId)) sseClients.set(userId, new Set());
  sseClients.get(userId)!.add(res);
  res.on('close', () => {
    sseClients.get(userId)?.delete(res);
    if (sseClients.get(userId)?.size === 0) sseClients.delete(userId);
  });
}

function pushToUser(userId: string, event: string, data: any) {
  const clients = sseClients.get(userId);
  if (!clients) return;
  for (const res of clients) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}

export class NotificationService {
  async create(data: {
    user: string;
    type: 'comment_reply' | 'post_comment' | 'upvote' | 'mention' | 'community_join' | 'new_post';
    message: string;
    link: string;
    actor: string;
    actorUsername: string;
    relatedPost?: string;
    relatedComment?: string;
  }) {
    // Don't notify yourself
    if (data.user === data.actor) return null;

    const notification = await Notification.create(data);

    // Push to connected SSE clients
    const unreadCount = await this.getUnreadCount(data.user);
    pushToUser(data.user, 'notification', { notification, unreadCount });

    return notification;
  }

  async getUserNotifications(userId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);

    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: userId }),
    ]);

    return {
      data: notifications,
      pagination: buildPaginationResponse(total, page, limit),
    };
  }

  async getUnreadCount(userId: string) {
    return Notification.countDocuments({ user: userId, read: false });
  }

  async markRead(id: string, userId: string) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true },
    );
    if (!notification) throw ApiError.notFound('Notification not found');
    return notification;
  }

  async markAllRead(userId: string) {
    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } },
    );
  }
}

export const notificationService = new NotificationService();
