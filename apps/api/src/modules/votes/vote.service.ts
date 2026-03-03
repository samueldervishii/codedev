import mongoose from 'mongoose';
import { Vote } from './vote.model.js';
import { Post } from '../posts/post.model.js';
import { Comment } from '../comments/comment.model.js';
import { User } from '../users/user.model.js';
import { notificationService } from '../notifications/notification.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { calculateHotScore } from '../../utils/ranking.js';
import type { VoteInput, BatchVoteInput } from '@devhub/shared';

export class VoteService {
  async voteOnPost(postId: string, input: VoteInput, userId: string) {
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) throw ApiError.notFound('Post not found');

    return this.handleVote('post', postId, post.author.toString(), input.value, userId);
  }

  async removePostVote(postId: string, userId: string) {
    return this.handleRemoveVote('post', postId, userId);
  }

  async voteOnComment(commentId: string, input: VoteInput, userId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw ApiError.notFound('Comment not found');

    return this.handleVote('comment', commentId, comment.author.toString(), input.value, userId);
  }

  async removeCommentVote(commentId: string, userId: string) {
    return this.handleRemoveVote('comment', commentId, userId);
  }

  async getUserVoteOnPost(postId: string, userId: string) {
    const vote = await Vote.findOne({ user: userId, targetType: 'post', target: postId });
    return vote ? { value: vote.value } : { value: 0 };
  }

  async batchGetVotes(input: BatchVoteInput, userId: string) {
    const validIds = input.targetIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) return { votes: {} };

    const votes = await Vote.find({
      user: userId,
      targetType: input.targetType,
      target: { $in: validIds },
    });

    const voteMap: Record<string, 1 | -1> = {};
    for (const vote of votes) {
      voteMap[vote.target.toString()] = vote.value;
    }

    return { votes: voteMap };
  }

  private async updateTargetScore(
    targetType: 'post' | 'comment',
    targetId: string,
    inc: { upvoteCount: number; downvoteCount: number; score: number },
  ) {
    if (targetType === 'post') {
      await Post.findByIdAndUpdate(targetId, { $inc: inc });
    } else {
      await Comment.findByIdAndUpdate(targetId, { $inc: inc });
    }
  }

  private async getTargetAuthor(
    targetType: 'post' | 'comment',
    targetId: string,
  ): Promise<string | null> {
    if (targetType === 'post') {
      const doc = await Post.findById(targetId);
      return doc?.author.toString() ?? null;
    } else {
      const doc = await Comment.findById(targetId);
      return doc?.author.toString() ?? null;
    }
  }

  private async handleVote(
    targetType: 'post' | 'comment',
    targetId: string,
    authorId: string,
    value: 1 | -1,
    userId: string,
  ) {
    // Prevent self-voting
    if (authorId === userId) {
      throw ApiError.badRequest('Cannot vote on your own content');
    }

    const existingVote = await Vote.findOne({
      user: userId,
      targetType,
      target: targetId,
    });

    const karmaField = targetType === 'post' ? 'postKarma' : 'commentKarma';

    if (!existingVote) {
      // New vote — use try/catch to handle unique index race condition
      try {
        await Vote.create({ user: userId, targetType, target: targetId, value });
      } catch (err: any) {
        if (err.code === 11000) {
          throw ApiError.conflict('Vote already exists');
        }
        throw err;
      }

      await this.updateTargetScore(targetType, targetId, {
        upvoteCount: value === 1 ? 1 : 0,
        downvoteCount: value === -1 ? 1 : 0,
        score: value,
      });

      await User.findByIdAndUpdate(authorId, {
        $inc: { [karmaField]: value, karma: value },
      });

      // Notify on upvote only (not downvote)
      if (value === 1) {
        const voter = await User.findById(userId);
        if (voter) {
          if (targetType === 'post') {
            const post = await Post.findById(targetId);
            if (post) {
              notificationService.create({
                user: authorId,
                type: 'upvote',
                message: `u/${voter.username} upvoted your post "${post.title.slice(0, 60)}"`,
                link: `/c/${post.communityName}/posts/${targetId}`,
                actor: userId,
                actorUsername: voter.username,
                relatedPost: targetId,
              }).catch(() => {});
            }
          } else {
            const comment = await Comment.findById(targetId);
            if (comment) {
              notificationService.create({
                user: authorId,
                type: 'upvote',
                message: `u/${voter.username} upvoted your comment`,
                link: `/c/_/posts/${comment.post.toString()}`,
                actor: userId,
                actorUsername: voter.username,
                relatedComment: targetId,
              }).catch(() => {});
            }
          }
        }
      }
    } else if (existingVote.value === value) {
      // Same vote — toggle off (remove)
      await Vote.deleteOne({ _id: existingVote._id });

      await this.updateTargetScore(targetType, targetId, {
        upvoteCount: value === 1 ? -1 : 0,
        downvoteCount: value === -1 ? -1 : 0,
        score: -value,
      });

      await User.findByIdAndUpdate(authorId, {
        $inc: { [karmaField]: -value, karma: -value },
      });
    } else {
      // Opposite vote — flip (atomic to avoid race)
      const flipped = await Vote.findOneAndUpdate(
        { _id: existingVote._id, value: existingVote.value },
        { $set: { value } },
        { new: true },
      );
      if (!flipped) throw ApiError.conflict('Vote was modified concurrently');

      await this.updateTargetScore(targetType, targetId, {
        upvoteCount: value === 1 ? 1 : -1,
        downvoteCount: value === -1 ? 1 : -1,
        score: value * 2,
      });

      await User.findByIdAndUpdate(authorId, {
        $inc: { [karmaField]: value * 2, karma: value * 2 },
      });
    }

    // Recalculate hot score for posts
    if (targetType === 'post') {
      const updatedPost = await Post.findById(targetId);
      if (updatedPost) {
        updatedPost.hotScore = calculateHotScore(updatedPost.score, updatedPost.createdAt);
        await updatedPost.save();
      }
    }

    return { success: true };
  }

  private async handleRemoveVote(
    targetType: 'post' | 'comment',
    targetId: string,
    userId: string,
  ) {
    const vote = await Vote.findOne({ user: userId, targetType, target: targetId });
    if (!vote) throw ApiError.notFound('No vote to remove');

    const karmaField = targetType === 'post' ? 'postKarma' : 'commentKarma';

    await Vote.deleteOne({ _id: vote._id });

    await this.updateTargetScore(targetType, targetId, {
      upvoteCount: vote.value === 1 ? -1 : 0,
      downvoteCount: vote.value === -1 ? -1 : 0,
      score: -vote.value,
    });

    // Update author karma
    const authorId = await this.getTargetAuthor(targetType, targetId);
    if (authorId) {
      await User.findByIdAndUpdate(authorId, {
        $inc: { [karmaField]: -vote.value, karma: -vote.value },
      });
    }

    // Recalculate hot score for posts
    if (targetType === 'post') {
      const updatedPost = await Post.findById(targetId);
      if (updatedPost) {
        updatedPost.hotScore = calculateHotScore(updatedPost.score, updatedPost.createdAt);
        await updatedPost.save();
      }
    }

    return { success: true };
  }
}

export const voteService = new VoteService();
