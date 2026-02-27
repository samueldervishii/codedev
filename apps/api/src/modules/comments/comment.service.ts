import { Comment } from './comment.model.js';
import { Post } from '../posts/post.model.js';
import { User } from '../users/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { LIMITS } from '@devhub/shared';
import type { CreateCommentInput, UpdateCommentInput } from '@devhub/shared';

export class CommentService {
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

    return comment;
  }

  async listByPost(postId: string, sort: string = 'best') {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw ApiError.notFound('Post not found');

    const sortMap: Record<string, any> = {
      best: { score: -1, createdAt: -1 },
      new: { createdAt: -1 },
      top: { score: -1 },
    };

    const comments = await Comment.find({ post: postId }).sort(
      sortMap[sort] || sortMap.best,
    );

    return comments;
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
    const comment = await Comment.findById(id);
    if (!comment) throw ApiError.notFound('Comment not found');

    const isAuthor = comment.author.toString() === userId;
    if (!isAuthor) {
      throw ApiError.forbidden('Not authorized to delete this comment');
    }

    comment.isDeleted = true;
    comment.body = '[deleted]';
    await comment.save();

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
