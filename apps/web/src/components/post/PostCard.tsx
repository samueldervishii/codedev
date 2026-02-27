import { useNavigate } from 'react-router-dom';
import { MessageSquare, Share2, Code2, ExternalLink, FileText } from 'lucide-react';
import { VoteButtons } from '../vote/VoteButtons';
import { TimeAgo } from '../shared/TimeAgo';
import { formatNumber } from '../../lib/utils';
import { useVotePost } from '../../hooks/useVotes';
import type { Post } from '@devhub/shared';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const votePost = useVotePost();
  const navigate = useNavigate();

  const typeIcon = {
    text: <FileText className="h-3.5 w-3.5" />,
    link: <ExternalLink className="h-3.5 w-3.5" />,
    code: <Code2 className="h-3.5 w-3.5" />,
  };

  const goToPost = () => navigate(`/c/${post.communityName}/posts/${post._id}`);

  return (
    <div
      onClick={goToPost}
      className="cursor-pointer rounded-xl border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700"
    >
      <div className="flex gap-3 p-3">
        {/* Vote buttons (vertical) */}
        <div className="hidden sm:block">
          <VoteButtons
            score={post.score}
            onVote={(value) => votePost.mutate({ postId: post._id, value })}
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Meta line */}
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-800 text-[10px] font-bold text-brand-300">
              {post.communityName?.[0]?.toUpperCase()}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/c/${post.communityName}`); }}
              className="cursor-pointer font-semibold text-gray-200 hover:underline"
            >
              c/{post.communityName}
            </button>
            <span className="text-gray-600">&middot;</span>
            <span>
              Posted by{' '}
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/u/${post.authorUsername}`); }}
                className="cursor-pointer hover:underline"
              >
                u/{post.authorUsername}
              </button>
            </span>
            <span className="text-gray-600">&middot;</span>
            <TimeAgo date={post.createdAt} />
          </div>

          {/* Title */}
          <h3 className="mb-1.5 text-lg font-medium leading-snug text-white">
            {post.title}
          </h3>

          {/* Post type badge */}
          <div className="mb-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              {typeIcon[post.type]}
              {post.type}
            </span>
          </div>

          {/* Preview */}
          {post.type === 'text' && post.body && (
            <p className="mb-2 line-clamp-3 text-sm leading-relaxed text-gray-400">
              {post.body}
            </p>
          )}

          {post.type === 'link' && post.url && (
            <p className="mb-2 truncate text-sm text-brand-400">{post.url}</p>
          )}

          {post.type === 'code' && post.codeSnippet && (
            <div className="mb-2 overflow-hidden rounded-lg border border-gray-700 bg-gray-950">
              <div className="flex items-center gap-2 border-b border-gray-700 px-3 py-1.5">
                <Code2 className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs text-gray-400">
                  {post.codeSnippet.fileName || post.codeSnippet.language}
                </span>
              </div>
              <pre className="line-clamp-4 overflow-hidden p-3 text-xs text-gray-300">
                <code>{post.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-1">
            {/* Mobile vote buttons */}
            <div className="sm:hidden">
              <VoteButtons
                score={post.score}
                horizontal
                onVote={(value) => votePost.mutate({ postId: post._id, value })}
              />
            </div>

            <button
              onClick={(e) => e.stopPropagation()}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800"
            >
              <MessageSquare className="h-4 w-4" />
              {formatNumber(post.commentCount)} Comments
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
