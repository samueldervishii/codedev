import { Community } from './community.model.js';
import { User } from '../users/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, buildPaginationResponse } from '../../utils/pagination.js';
import type { Request } from 'express';
import type { CreateCommunityInput, UpdateCommunityInput } from '@devhub/shared';

export class CommunityService {
  async create(input: CreateCommunityInput, userId: string) {
    const existing = await Community.findOne({ name: input.name });
    if (existing) throw ApiError.conflict('Community name already taken');

    const community = await Community.create({
      ...input,
      creator: userId,
      moderators: [userId],
      memberCount: 1,
    });

    // Auto-join creator
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedCommunities: community._id },
    });

    return community;
  }

  async list(req: Request) {
    const { page, limit, skip } = getPagination(req);
    const search = req.query.search as string;
    const tag = req.query.tag as string;

    const filter: any = {};
    if (search) {
      filter.$text = { $search: search };
    }
    if (tag) {
      filter.tags = tag;
    }

    const [communities, total] = await Promise.all([
      Community.find(filter).sort({ memberCount: -1 }).skip(skip).limit(limit),
      Community.countDocuments(filter),
    ]);

    return {
      data: communities,
      pagination: buildPaginationResponse(total, page, limit),
    };
  }

  async getByName(name: string) {
    const community = await Community.findOne({ name });
    if (!community) throw ApiError.notFound('Community not found');
    return community;
  }

  async update(name: string, input: UpdateCommunityInput, userId: string) {
    const community = await Community.findOne({ name });
    if (!community) throw ApiError.notFound('Community not found');

    const isModerator = community.moderators.some((m) => m.toString() === userId);
    if (!isModerator) throw ApiError.forbidden('Only moderators can update the community');

    Object.assign(community, input);
    await community.save();
    return community;
  }

  async delete(name: string, userId: string) {
    const community = await Community.findOne({ name });
    if (!community) throw ApiError.notFound('Community not found');

    if (community.creator.toString() !== userId) {
      throw ApiError.forbidden('Only the creator can delete the community');
    }

    // Remove from all users' joinedCommunities
    await User.updateMany(
      { joinedCommunities: community._id },
      { $pull: { joinedCommunities: community._id } },
    );

    await Community.deleteOne({ _id: community._id });
  }

  async join(name: string, userId: string) {
    const community = await Community.findOne({ name });
    if (!community) throw ApiError.notFound('Community not found');

    // Atomic: only adds if not already a member
    const updated = await User.findOneAndUpdate(
      { _id: userId, joinedCommunities: { $ne: community._id } },
      { $addToSet: { joinedCommunities: community._id } },
      { new: true },
    );
    if (!updated) throw ApiError.badRequest('Already a member');

    await Community.findByIdAndUpdate(community._id, { $inc: { memberCount: 1 } });

    return { joined: true };
  }

  async leave(name: string, userId: string) {
    const community = await Community.findOne({ name });
    if (!community) throw ApiError.notFound('Community not found');

    if (community.creator.toString() === userId) {
      throw ApiError.badRequest('Creator cannot leave their own community');
    }

    // Atomic: only removes if currently a member
    const before = await User.findOneAndUpdate(
      { _id: userId, joinedCommunities: community._id },
      { $pull: { joinedCommunities: community._id } },
    );
    if (!before) throw ApiError.badRequest('Not a member');

    await Community.findByIdAndUpdate(community._id, { $inc: { memberCount: -1 } });

    return { joined: false };
  }
}

export const communityService = new CommunityService();
