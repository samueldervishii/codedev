import mongoose from 'mongoose';
import { Bookmark } from './bookmark.model.js';
import { Post } from '../posts/post.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import type { Request } from 'express';

export class BookmarkService {
  async addBookmark(postId: string, userId: string) {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw ApiError.notFound('Post not found');

    const existing = await Bookmark.findOne({ user: userId, post: postId });
    if (existing) throw ApiError.conflict('Already bookmarked');

    await Bookmark.create({ user: userId, post: postId });
    return { bookmarked: true };
  }

  async removeBookmark(postId: string, userId: string) {
    const result = await Bookmark.deleteOne({ user: userId, post: postId });
    if (result.deletedCount === 0) throw ApiError.notFound('Bookmark not found');
    return { bookmarked: false };
  }

  async getUserBookmarks(userId: string, req: Request) {
    const { page, limit, skip } = getPagination(req);
    const filter = { user: userId };

    const [bookmarks, total] = await Promise.all([
      Bookmark.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'post',
          match: { isDeleted: false },
          populate: [
            { path: 'author', select: 'username' },
            { path: 'community', select: 'name' },
          ],
        }),
      Bookmark.countDocuments(filter),
    ]);

    const posts = bookmarks
      .filter((b) => b.post !== null)
      .map((b) => b.post);

    return {
      data: posts,
      pagination: buildPaginationResponse(total, page, limit),
    };
  }

  async batchGetBookmarks(postIds: string[], userId: string) {
    const validIds = postIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) return { bookmarks: {} };

    const bookmarks = await Bookmark.find({
      user: userId,
      post: { $in: validIds },
    });

    const bookmarkMap: Record<string, boolean> = {};
    for (const b of bookmarks) {
      bookmarkMap[b.post.toString()] = true;
    }

    return { bookmarks: bookmarkMap };
  }
}

export const bookmarkService = new BookmarkService();
