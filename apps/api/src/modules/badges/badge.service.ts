import { User } from '../users/user.model.js';
import { Post } from '../posts/post.model.js';
import { Comment } from '../comments/comment.model.js';
import { Community } from '../communities/community.model.js';
import { BADGES, BADGE_MAP } from './badge.constants.js';
import type { BadgeDefinition } from './badge.constants.js';

export class BadgeService {
  async checkAndAward(userId: string) {
    const user = await User.findById(userId);
    if (!user) return;

    const currentBadges = new Set(user.badges || []);
    const newBadges: string[] = [];

    // Count posts
    const postCount = await Post.countDocuments({ author: userId, isDeleted: false });
    if (postCount >= 1 && !currentBadges.has('first_post')) newBadges.push('first_post');
    if (postCount >= 10 && !currentBadges.has('prolific_poster')) newBadges.push('prolific_poster');

    // Count comments
    const commentCount = await Comment.countDocuments({ author: userId, isDeleted: false });
    if (commentCount >= 50 && !currentBadges.has('commentator')) newBadges.push('commentator');

    // Karma checks
    if (user.karma >= 100 && !currentBadges.has('karma_rookie')) newBadges.push('karma_rookie');
    if (user.karma >= 1000 && !currentBadges.has('karma_pro')) newBadges.push('karma_pro');
    if (user.karma >= 5000 && !currentBadges.has('karma_legend')) newBadges.push('karma_legend');

    // Community creator
    const createdCommunity = await Community.findOne({ creator: userId });
    if (createdCommunity && !currentBadges.has('community_creator')) newBadges.push('community_creator');

    // Helpful — aggregate upvotes on comments
    if (!currentBadges.has('helpful')) {
      const commentUpvotes = await Comment.aggregate([
        { $match: { author: user._id, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$upvoteCount' } } },
      ]);
      if (commentUpvotes[0]?.total >= 100) newBadges.push('helpful');
    }

    if (newBadges.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { badges: { $each: newBadges } },
      });
    }

    return newBadges;
  }

  getUserBadges(badgeIds: string[]): BadgeDefinition[] {
    return badgeIds
      .map((id) => BADGE_MAP.get(id))
      .filter((b): b is BadgeDefinition => !!b);
  }

  getAllBadges(): BadgeDefinition[] {
    return BADGES;
  }
}

export const badgeService = new BadgeService();
