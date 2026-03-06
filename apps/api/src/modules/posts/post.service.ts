import { Post } from './post.model.js';
import { Community } from '../communities/community.model.js';
import { User } from '../users/user.model.js';
import { Comment } from '../comments/comment.model.js';
import { Vote } from '../votes/vote.model.js';
import { badgeService } from '../badges/badge.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { Bookmark } from '../bookmarks/bookmark.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import { calculateHotScore } from '../../utils/ranking.js';
import type { Request } from 'express';
import type { CreatePostInput, SortType, TimePeriod } from '@devhub/shared';

export class PostService {
  async create(communityName: string, input: CreatePostInput, userId: string) {
    const community = await Community.findOne({ name: communityName });
    if (!community) throw ApiError.notFound('Community not found');

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const isMember = user.joinedCommunities.some(
      (c) => c.toString() === community._id.toString(),
    );
    if (!isMember) throw ApiError.forbidden('You must join the community to post');

    const now = new Date();
    const hotScore = calculateHotScore(0, now);

    const post = await Post.create({
      ...input,
      author: userId,
      community: community._id,
      authorUsername: user.username,
      communityName: community.name,
      hotScore,
    });

    await Community.findByIdAndUpdate(community._id, { $inc: { postCount: 1 } });

    // Notify community creator about new post
    notificationService.create({
      user: community.creator.toString(),
      type: 'new_post',
      message: `${user.username} posted "${post.title}" in c/${community.name}`,
      link: `/c/${community.name}/posts/${post._id}`,
      actor: userId,
      actorUsername: user.username,
      relatedPost: post._id.toString(),
    });

    // Check for new badges
    badgeService.checkAndAward(userId).catch(() => {});

    return post;
  }

  async listByCommunity(communityName: string, req: Request) {
    const community = await Community.findOne({ name: communityName });
    if (!community) throw ApiError.notFound('Community not found');

    const { page, limit, skip } = getPagination(req);
    const sort = (req.query.sort as SortType) || 'hot';
    const time = req.query.time as TimePeriod;

    const filter: any = { community: community._id, isDeleted: false };

    if (sort === 'top' && time && time !== 'all') {
      const now = new Date();
      const timeMap: Record<string, number> = {
        day: 1,
        week: 7,
        month: 30,
        year: 365,
      };
      const days = timeMap[time] || 365;
      filter.createdAt = { $gte: new Date(now.getTime() - days * 86400000) };
    }

    const sortMap: Record<string, any> = {
      hot: { hotScore: -1 },
      new: { createdAt: -1 },
      top: { score: -1 },
    };

    const [posts, total] = await Promise.all([
      Post.find(filter).sort(sortMap[sort] || sortMap.hot).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    return {
      data: posts,
      pagination: buildPaginationResponse(total, page, limit),
    };
  }

  async getById(id: string) {
    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) throw ApiError.notFound('Post not found');
    return post;
  }

  async crosspost(originalPostId: string, targetCommunityName: string, userId: string) {
    const original = await Post.findOne({ _id: originalPostId, isDeleted: false });
    if (!original) throw ApiError.notFound('Original post not found');

    const targetCommunity = await Community.findOne({ name: targetCommunityName });
    if (!targetCommunity) throw ApiError.notFound('Target community not found');

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const isMember = user.joinedCommunities.some(
      (c) => c.toString() === targetCommunity._id.toString(),
    );
    if (!isMember) throw ApiError.forbidden('You must join the community to crosspost');

    if (original.community.toString() === targetCommunity._id.toString()) {
      throw ApiError.badRequest('Cannot crosspost to the same community');
    }

    const now = new Date();
    const hotScore = calculateHotScore(0, now);

    const crosspost = await Post.create({
      title: original.title,
      type: original.type,
      body: original.body,
      url: original.url,
      codeSnippet: original.codeSnippet,
      flair: original.flair,
      author: userId,
      community: targetCommunity._id,
      authorUsername: user.username,
      communityName: targetCommunity.name,
      hotScore,
      crosspostFrom: {
        postId: original._id,
        communityName: original.communityName,
      },
    });

    await Community.findByIdAndUpdate(targetCommunity._id, { $inc: { postCount: 1 } });

    return crosspost;
  }

  async togglePin(postId: string, userId: string) {
    const post = await Post.findById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    const community = await Community.findById(post.community);
    const isMod = community?.moderators.some((m) => m.toString() === userId);
    if (!isMod) throw ApiError.forbidden('Only moderators can pin posts');

    post.isPinned = !post.isPinned;
    await post.save();
    return post;
  }

  async toggleLock(postId: string, userId: string) {
    const post = await Post.findById(postId);
    if (!post) throw ApiError.notFound('Post not found');

    const community = await Community.findById(post.community);
    const isMod = community?.moderators.some((m) => m.toString() === userId);
    if (!isMod) throw ApiError.forbidden('Only moderators can lock posts');

    post.isLocked = !post.isLocked;
    await post.save();
    return post;
  }

  async update(id: string, body: string, userId: string) {
    const post = await Post.findById(id);
    if (!post) throw ApiError.notFound('Post not found');
    if (post.author.toString() !== userId) throw ApiError.forbidden('Not the author');
    if (post.type !== 'text') throw ApiError.badRequest('Only text posts can be edited');

    post.body = body;
    await post.save();
    return post;
  }

  async delete(id: string, userId: string) {
    const post = await Post.findById(id);
    if (!post) throw ApiError.notFound('Post not found');

    // Check if author or moderator
    const isAuthor = post.author.toString() === userId;
    if (!isAuthor) {
      const community = await Community.findById(post.community);
      const isMod = community?.moderators.some((m) => m.toString() === userId);
      if (!isMod) throw ApiError.forbidden('Not authorized to delete this post');
    }

    // Soft-delete atomically — only decrement count if we actually mark it deleted
    const updated = await Post.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!updated) return; // Already deleted

    await Community.findByIdAndUpdate(post.community, { $inc: { postCount: -1 } });

    // Cascade: soft-delete comments, remove votes and bookmarks
    await Promise.all([
      Comment.updateMany({ post: id, isDeleted: false }, { $set: { isDeleted: true, body: '[deleted]' } }),
      Vote.deleteMany({ target: id, targetType: 'post' }),
      Bookmark.deleteMany({ post: id }),
    ]);
  }

  async getHomeFeed(userId: string, req: Request) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const { page, limit, skip } = getPagination(req);
    const sort = (req.query.sort as SortType) || 'hot';

    const filter: any = {
      community: { $in: user.joinedCommunities },
      isDeleted: false,
    };

    const sortMap: Record<string, any> = {
      hot: { hotScore: -1 },
      new: { createdAt: -1 },
      top: { score: -1 },
    };

    const [posts, total] = await Promise.all([
      Post.find(filter).sort(sortMap[sort] || sortMap.hot).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    return {
      data: posts,
      pagination: buildPaginationResponse(total, page, limit),
    };
  }

  async listAll(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const sort = (req.query.sort as SortType) || 'hot';
    const search = req.query.search as string;
    const time = req.query.time as TimePeriod;

    const filter: any = { isDeleted: false };

    if (search) {
      filter.$text = { $search: search };
    }

    if (sort === 'top' && time && time !== 'all') {
      const now = new Date();
      const timeMap: Record<string, number> = {
        day: 1,
        week: 7,
        month: 30,
        year: 365,
      };
      const days = timeMap[time] || 365;
      filter.createdAt = { $gte: new Date(now.getTime() - days * 86400000) };
    }

    const sortMap: Record<string, any> = {
      hot: { hotScore: -1 },
      new: { createdAt: -1 },
      top: { score: -1 },
    };

    const [posts, total] = await Promise.all([
      Post.find(filter).sort(sortMap[sort] || sortMap.hot).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    return {
      data: posts,
      pagination: buildPaginationResponse(total, page, limit),
    };
  }

  async getUserPosts(username: string, req: Request) {
    const user = await User.findOne({ username });
    if (!user) throw ApiError.notFound('User not found');

    const { page, limit, skip } = getPagination(req);

    const filter = { author: user._id, isDeleted: false };
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    return {
      data: posts,
      pagination: buildPaginationResponse(total, page, limit),
    };
  }
}

export const postService = new PostService();
