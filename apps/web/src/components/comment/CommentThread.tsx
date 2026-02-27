import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Trash2 } from 'lucide-react';
import { VoteButtons } from '../vote/VoteButtons';
import { TimeAgo } from '../shared/TimeAgo';
import { CommentForm } from './CommentForm';
import { useCreateComment, useDeleteComment } from '../../hooks/useComments';
import { useVoteComment } from '../../hooks/useVotes';
import { useAuthStore } from '../../stores/authStore';
import { formatNumber } from '../../lib/utils';
import type { Comment } from '@devhub/shared';

interface CommentNode extends Comment {
  children: CommentNode[];
}

interface CommentThreadProps {
  comment: CommentNode;
  postId: string;
  depth?: number;
}

const MAX_VISIBLE_DEPTH = 6;

export function CommentThread({ comment, postId, depth = 0 }: CommentThreadProps) {
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const createComment = useCreateComment(postId);
  const deleteComment = useDeleteComment(postId);
  const voteComment = useVoteComment(postId);

  const isAuthor = user?._id === comment.author;

  const handleReply = (body: string) => {
    createComment.mutate(
      { body, parentId: comment._id },
      { onSuccess: () => setShowReply(false) },
    );
  };

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-gray-800 pl-4' : ''}>
      <div className="py-2">
        {/* Header */}
        <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="cursor-pointer font-mono text-gray-600 hover:text-gray-400"
          >
            {collapsed ? '[+]' : '[-]'}
          </button>
          <Link
            to={`/u/${comment.authorUsername}`}
            className="font-semibold text-gray-200 hover:underline"
          >
            {comment.authorUsername}
          </Link>
          <span className="text-gray-600">&middot;</span>
          <span>
            {formatNumber(comment.score)} {comment.score === 1 ? 'point' : 'points'}
          </span>
          <span className="text-gray-600">&middot;</span>
          <TimeAgo date={comment.createdAt} />
        </div>

        {!collapsed && (
          <>
            {/* Body */}
            {comment.isDeleted ? (
              <p className="mb-2 text-sm italic text-gray-600">[deleted]</p>
            ) : (
              <p className="mb-2 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
                {comment.body}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1">
              <VoteButtons
                score={comment.score}
                horizontal
                onVote={(value) => voteComment.mutate({ commentId: comment._id, value })}
              />
              {isAuthenticated && !comment.isDeleted && (
                <button
                  onClick={() => setShowReply(!showReply)}
                  className="flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Reply
                </button>
              )}
              {isAuthor && !comment.isDeleted && (
                <button
                  onClick={() => {
                    if (confirm('Delete this comment?')) deleteComment.mutate(comment._id);
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-gray-800"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReply && (
              <div className="mt-2">
                <CommentForm
                  onSubmit={handleReply}
                  isPending={createComment.isPending}
                  placeholder={`Reply to ${comment.authorUsername}...`}
                  autoFocus
                  onCancel={() => setShowReply(false)}
                />
              </div>
            )}

            {/* Children */}
            {comment.children.length > 0 && depth < MAX_VISIBLE_DEPTH && (
              <div className="mt-1">
                {comment.children.map((child) => (
                  <CommentThread
                    key={child._id}
                    comment={child}
                    postId={postId}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}

            {comment.children.length > 0 && depth >= MAX_VISIBLE_DEPTH && (
              <p className="mt-2 text-xs text-brand-400">
                Continue this thread &rarr;
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
