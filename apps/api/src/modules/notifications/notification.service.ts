import { Notification } from './notification.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import type { Request } from 'express';

export class NotificationService {
  async create(data: {
    user: string;
    type: 'comment_reply' | 'post_comment' | 'upvote' | 'mention';
    message: string;
    link: string;
    actor: string;
    actorUsername: string;
    relatedPost?: string;
    relatedComment?: string;
  }) {
    // Don't notify yourself
    if (data.user === data.actor) return null;

    return Notification.create(data);
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
