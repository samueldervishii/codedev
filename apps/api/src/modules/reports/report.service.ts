import { Report } from './report.model.js';
import { Post } from '../posts/post.model.js';
import { Comment } from '../comments/comment.model.js';
import { Community } from '../communities/community.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import type { Request } from 'express';

export class ReportService {
  async reportPost(postId: string, reason: string, userId: string) {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw ApiError.notFound('Post not found');

    const existing = await Report.findOne({
      reporter: userId,
      target: postId,
      targetType: 'post',
      status: 'pending',
    });
    if (existing) throw ApiError.badRequest('You have already reported this post');

    return Report.create({
      reporter: userId,
      targetType: 'post',
      target: postId,
      reason,
      community: post.community,
      communityName: post.communityName,
    });
  }

  async reportComment(commentId: string, reason: string, userId: string) {
    const comment = await Comment.findOne({ _id: commentId, isDeleted: false });
    if (!comment) throw ApiError.notFound('Comment not found');

    const post = await Post.findById(comment.post);
    if (!post) throw ApiError.notFound('Post not found');

    const existing = await Report.findOne({
      reporter: userId,
      target: commentId,
      targetType: 'comment',
      status: 'pending',
    });
    if (existing) throw ApiError.badRequest('You have already reported this comment');

    return Report.create({
      reporter: userId,
      targetType: 'comment',
      target: commentId,
      reason,
      community: post.community,
      communityName: post.communityName,
    });
  }

  async listByCommunity(communityName: string, userId: string, req: Request) {
    const community = await Community.findOne({ name: communityName });
    if (!community) throw ApiError.notFound('Community not found');

    const isMod = community.moderators.some((m) => m.toString() === userId);
    if (!isMod) throw ApiError.forbidden('Only moderators can view reports');

    const { page, limit, skip } = getPagination(req);
    const status = (req.query.status as string) || 'pending';

    const filter: any = { community: community._id, status };

    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Report.countDocuments(filter),
    ]);

    return { data: reports, pagination: buildPaginationResponse(total, page, limit) };
  }

  async resolve(id: string, userId: string, action: 'remove' | 'dismiss') {
    const report = await Report.findById(id);
    if (!report) throw ApiError.notFound('Report not found');

    const community = await Community.findById(report.community);
    if (!community) throw ApiError.notFound('Community not found');

    const isMod = community.moderators.some((m) => m.toString() === userId);
    if (!isMod) throw ApiError.forbidden('Only moderators can resolve reports');

    if (action === 'remove') {
      if (report.targetType === 'post') {
        await Post.findByIdAndUpdate(report.target, { $set: { isDeleted: true } });
        await Community.findByIdAndUpdate(report.community, { $inc: { postCount: -1 } });
      } else {
        await Comment.findOneAndUpdate(
          { _id: report.target, isDeleted: false },
          { $set: { isDeleted: true, body: '[removed by moderator]' } },
        );
      }
      report.status = 'resolved';
    } else {
      report.status = 'dismissed';
    }

    report.resolvedBy = userId as any;
    await report.save();
    return report;
  }
}

export const reportService = new ReportService();
