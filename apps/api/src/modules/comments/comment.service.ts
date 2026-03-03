import { Comment } from './comment.model.js';
import { Post } from '../posts/post.model.js';
import { User } from '../users/user.model.js';
import { notificationService } from '../notifications/notification.service.js';
import { badgeService } from '../badges/badge.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import { LIMITS } from '@devhub/shared';
import type { Request } from 'express';
import type { CreateCommentInput, UpdateCommentInput } from '@devhub/shared';

export class CommentService {
  async search(req: Request) {
    const query = req.query.q as string;
    if (!query) return { data: [], pagination: buildPaginationResponse(0, 1, 20) };

    const { page, limit, skip } = getPagination(req);
    const filter: any = { $text: { $search: query }, isDeleted: false };

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .sort({ score: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments(filter),
    ]);

    return { data: comments, pagination: buildPaginationResponse(total, page, limit) };
  }

  async create(postId: string, input: CreateCommentInput, userId: string) {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw ApiError.notFound('Post not found');

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    let depth = 0;
    if (input.parentId) {
      const parentComment = await Comment.findById(input.parentId);
      if (!parentComment) throw ApiError.notFound('Parent comment not found');
      if (parentComment.post.toString() !== postId) {
        throw ApiError.badRequest('Parent comment does not belong to this post');
      }
      if (parentComment.depth >= LIMITS.COMMENT_MAX_DEPTH) {
        throw ApiError.badRequest('Maximum comment nesting depth reached');
      }
      depth = parentComment.depth + 1;
    }

    const comment = await Comment.create({
      body: input.body,
      author: userId,
      post: postId,
      parent: input.parentId || null,
      depth,
      authorUsername: user.username,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    // Notify post author about new comment
    const postLink = `/c/${post.communityName}/posts/${postId}`;
    if (!input.parentId) {
      notificationService.create({
        user: post.author.toString(),
        type: 'post_comment',
        message: `u/${user.username} commented on your post "${post.title.slice(0, 60)}"`,
        link: postLink,
        actor: userId,
        actorUsername: user.username,
        relatedPost: postId,
        relatedComment: comment._id.toString(),
      }).catch(() => {});
    } else {
      // Notify parent comment author about reply
      const parentComment = await Comment.findById(input.parentId);
      if (parentComment) {
        notificationService.create({
          user: parentComment.author.toString(),
          type: 'comment_reply',
          message: `u/${user.username} replied to your comment`,
          link: postLink,
          actor: userId,
          actorUsername: user.username,
          relatedPost: postId,
          relatedComment: comment._id.toString(),
        }).catch(() => {});
      }
    }

    // Check for new badges
    badgeService.checkAndAward(userId).catch(() => {});

    return comment;
  }

  async listByPost(postId: string, sort: string = 'best', page: number = 1, limit: number = 100) {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw ApiError.notFound('Post not found');

    // Cap limit to prevent abuse
    const safeLimit = Math.min(Math.max(1, limit), 200);
    const safePage = Math.max(1, page);
    const skip = (safePage - 1) * safeLimit;

    const sortMap: Record<string, any> = {
      best: { score: -1, createdAt: -1 },
      new: { createdAt: -1 },
      top: { score: -1 },
    };

    const [comments, total] = await Promise.all([
      Comment.find({ post: postId })
        .sort(sortMap[sort] || sortMap.best)
        .skip(skip)
        .limit(safeLimit),
      Comment.countDocuments({ post: postId }),
    ]);

    return { comments, total, page: safePage, limit: safeLimit };
  }

  async update(id: string, input: UpdateCommentInput, userId: string) {
    const comment = await Comment.findById(id);
    if (!comment) throw ApiError.notFound('Comment not found');
    if (comment.author.toString() !== userId) throw ApiError.forbidden('Not the author');

    comment.body = input.body;
    await comment.save();
    return comment;
  }

  async delete(id: string, userId: string) {
    // Atomic: only soft-delete if author matches and not already deleted
    const comment = await Comment.findOneAndUpdate(
      { _id: id, author: userId, isDeleted: false },
      { $set: { isDeleted: true, body: '[deleted]' } },
    );

    if (!comment) {
      // Distinguish between not found, not author, or already deleted
      const existing = await Comment.findById(id);
      if (!existing) throw ApiError.notFound('Comment not found');
      if (existing.author.toString() !== userId) throw ApiError.forbidden('Not authorized to delete this comment');
      return; // Already deleted
    }

    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
  }

  async getUserComments(username: string, page: number, limit: number) {
    const user = await User.findOne({ username });
    if (!user) throw ApiError.notFound('User not found');

    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      Comment.find({ author: user._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({ author: user._id, isDeleted: false }),
    ]);

    return { comments, total };
  }
}

export const commentService = new CommentService();
