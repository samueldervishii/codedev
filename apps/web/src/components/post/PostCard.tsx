import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Share2, Code2, ExternalLink, FileText, ArrowBigUp, ArrowBigDown, Bookmark, Pin, Lock, Repeat2, Link2, Flag, MoreHorizontal } from 'lucide-react';
import { TimeAgo } from '../shared/TimeAgo';
import { MarkdownPreview } from '../shared/MarkdownPreview';
import { CrosspostModal } from './CrosspostModal';
import { cn, formatNumber } from '../../lib/utils';
import { useVotePost } from '../../hooks/useVotes';
import { useToggleBookmark } from '../../hooks/useBookmarks';
import { useReportPost } from '../../hooks/useModTools';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';
import type { Post } from '@devhub/shared';

interface PostCardProps {
  post: Post;
  isBookmarked?: boolean;
}

export function PostCard({ post, isBookmarked }: PostCardProps) {
  const votePost = useVotePost();
  const toggleBookmark = useToggleBookmark();
  const reportPost = useReportPost();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCrosspost, setShowCrosspost] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showShareMenu) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShareMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShareMenu]);

  const typeIcon = {
    text: <FileText className="h-3.5 w-3.5" />,
    link: <ExternalLink className="h-3.5 w-3.5" />,
    code: <Code2 className="h-3.5 w-3.5" />,
  };

  const goToPost = () => navigate(`/c/${post.communityName}/posts/${post._id}`);

  const handleVote = (e: React.MouseEvent, value: 1 | -1) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    votePost.mutate({ postId: post._id, value });
  };

  return (
    <div
      onClick={goToPost}
      className="cursor-pointer rounded-xl border border-gray-800 bg-gray-900 transition-colors hover:border-gray-700"
    >
      {/* Content */}
      <div className="p-3 pb-0">
        {/* Pinned / Locked / Crosspost indicators */}
        {(post.isPinned || post.isLocked || post.crosspostFrom) && (
          <div className="mb-1.5 flex items-center gap-2 text-xs">
            {post.isPinned && (
              <span className="flex items-center gap-1 text-green-400">
                <Pin className="h-3 w-3" />
                Pinned
              </span>
            )}
            {post.isLocked && (
              <span className="flex items-center gap-1 text-yellow-400">
                <Lock className="h-3 w-3" />
                Locked
              </span>
            )}
            {post.crosspostFrom && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/c/${post.crosspostFrom!.communityName}`); }}
                className="flex cursor-pointer items-center gap-1 text-gray-500 hover:text-gray-300"
              >
                <Repeat2 className="h-3 w-3" />
                Crossposted from c/{post.crosspostFrom.communityName}
              </button>
            )}
          </div>
        )}

        {/* Meta line */}
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-gray-400">
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

        {/* Title + Flair */}
        <div className="mb-1.5 flex items-center gap-2">
          <h3 className="text-base font-semibold leading-snug text-white">
            {post.title}
          </h3>
          {post.flair && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: post.flair.color }}
            >
              {post.flair.name}
            </span>
          )}
        </div>

        {/* Post type badge */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
            {typeIcon[post.type]}
            {post.type}
          </span>
        </div>

        {/* Preview */}
        {post.type === 'text' && post.body && (
          <div className="mb-2 line-clamp-3 text-sm leading-relaxed text-gray-400">
            <MarkdownPreview content={post.body} className="prose-p:text-gray-400 prose-headings:text-gray-300 prose-strong:text-gray-300 prose-li:text-gray-400" />
          </div>
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
      </div>

      {/* Action bar — Reddit style bottom row */}
      <div className="flex items-center gap-1 px-1.5 py-1">
        {/* Votes inline */}
        <div className="flex items-center gap-0.5 rounded-full bg-gray-800/50">
          <button
            onClick={(e) => handleVote(e, 1)}
            className={cn(
              'cursor-pointer rounded-l-full p-1.5 transition-colors hover:bg-gray-700',
              'text-gray-400 hover:text-upvote',
            )}
          >
            <ArrowBigUp className="h-5 w-5" />
          </button>
          <span className="min-w-[2ch] text-center text-xs font-bold text-gray-300">
            {formatNumber(post.score)}
          </span>
          <button
            onClick={(e) => handleVote(e, -1)}
            className={cn(
              'cursor-pointer rounded-r-full p-1.5 transition-colors hover:bg-gray-700',
              'text-gray-400 hover:text-downvote',
            )}
          >
            <ArrowBigDown className="h-5 w-5" />
          </button>
        </div>

        {/* Comments */}
        <button
          onClick={(e) => { e.stopPropagation(); goToPost(); }}
          className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800"
        >
          <MessageSquare className="h-4 w-4" />
          {formatNumber(post.commentCount)}
        </button>

        {/* Share dropdown */}
        <div className="relative" ref={shareRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          {showShareMenu && (
            <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const url = `${window.location.origin}/c/${post.communityName}/posts/${post._id}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Link copied to clipboard');
                  setShowShareMenu(false);
                }}
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
              >
                <Link2 className="h-4 w-4" />
                Copy Link
              </button>
              {isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareMenu(false);
                    setShowCrosspost(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                >
                  <Repeat2 className="h-4 w-4" />
                  Cross-post
                </button>
              )}
            </div>
          )}
        </div>
        {showCrosspost && (
          <CrosspostModal
            postId={post._id}
            currentCommunity={post.communityName}
            open={showCrosspost}
            onClose={() => setShowCrosspost(false)}
          />
        )}

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) { navigate('/login'); return; }
            toggleBookmark.mutate({ postId: post._id, isBookmarked: !!isBookmarked });
          }}
          className={cn(
            'flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-800',
            isBookmarked ? 'text-brand-400' : 'text-gray-400',
          )}
        >
          <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          {isBookmarked ? 'Saved' : 'Save'}
        </button>

        {/* Report */}
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const reason = prompt('Reason for reporting this post:');
              if (reason?.trim()) {
                reportPost.mutate({ postId: post._id, reason: reason.trim() });
              }
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800"
          >
            <Flag className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
