import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Share2, Code2, ExternalLink, FileText, Trash2, Bookmark } from 'lucide-react';
import { usePost, useDeletePost } from '../hooks/usePosts';
import toast from 'react-hot-toast';
import { useComments, useCreateComment } from '../hooks/useComments';
import { useVotePost, useVoteComment } from '../hooks/useVotes';
import { useAuthStore } from '../stores/authStore';
import { useBatchBookmarks, useToggleBookmark } from '../hooks/useBookmarks';
import { VoteButtons } from '../components/vote/VoteButtons';
import { TimeAgo } from '../components/shared/TimeAgo';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { formatNumber } from '../lib/utils';
import { CommentThread } from '../components/comment/CommentThread';
import { CommentForm } from '../components/comment/CommentForm';
import { CodeBlock } from '../components/post/CodeBlock';
import { MarkdownPreview } from '../components/shared/MarkdownPreview';
import type { Post, Comment as CommentType } from '@devhub/shared';

export function PostPage() {
  const { communityName, postId } = useParams<{ communityName: string; postId: string }>();
  const post = usePost(postId!);
  const comments = useComments(postId!);
  const votePost = useVotePost();
  const createComment = useCreateComment(postId!);
  const deletePost = useDeletePost();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toggleBookmark = useToggleBookmark();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const postId_ = post.data?._id;
  const batchBookmarks = useBatchBookmarks(postId_ ? [postId_] : []);
  const isBookmarked = postId_ ? (batchBookmarks.data?.bookmarks?.[postId_] ?? false) : false;

  if (post.isLoading) return <LoadingSpinner />;
  if (!post.data) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Post not found</h1>
        <Link to={`/c/${communityName}`} className="text-brand-400 hover:underline">
          Back to c/{communityName}
        </Link>
      </div>
    );
  }

  const p: Post = post.data;
  const isAuthor = user?._id === p.author;

  const typeIcon = {
    text: <FileText className="h-3.5 w-3.5" />,
    link: <ExternalLink className="h-3.5 w-3.5" />,
    code: <Code2 className="h-3.5 w-3.5" />,
  };

  const commentTree = comments.data ? buildCommentTree(comments.data) : [];

  return (
    <>
      <Helmet>
        <title>{p.title} - c/{p.communityName} - DevHub</title>
      </Helmet>

      {/* Back link */}
      <Link
        to={`/c/${p.communityName}`}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        c/{p.communityName}
      </Link>

      {/* Post */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="flex gap-3 p-4">
          {/* Vote buttons */}
          <div className="hidden sm:block">
            <VoteButtons
              score={p.score}
              onVote={(value) => votePost.mutate({ postId: p._id, value })}
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Meta */}
            <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-400">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-800 text-[10px] font-bold text-brand-300">
                {p.communityName?.[0]?.toUpperCase()}
              </div>
              <Link
                to={`/c/${p.communityName}`}
                className="font-semibold text-gray-200 hover:underline"
              >
                c/{p.communityName}
              </Link>
              <span className="text-gray-600">&middot;</span>
              <span>
                Posted by{' '}
                <Link to={`/u/${p.authorUsername}`} className="hover:underline">
                  u/{p.authorUsername}
                </Link>
              </span>
              <span className="text-gray-600">&middot;</span>
              <TimeAgo date={p.createdAt} />
            </div>

            {/* Title */}
            <h1 className="mb-2 text-xl font-bold text-white">{p.title}</h1>

            {/* Type badge */}
            <div className="mb-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {typeIcon[p.type]}
                {p.type}
              </span>
            </div>

            {/* Body */}
            {p.type === 'text' && p.body && (
              <div className="mb-4">
                <MarkdownPreview content={p.body} />
              </div>
            )}

            {p.type === 'link' && p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-brand-400 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                {p.url}
              </a>
            )}

            {p.type === 'code' && p.codeSnippet && (
              <div className="mb-4">
                <CodeBlock
                  code={p.codeSnippet.code}
                  language={p.codeSnippet.language}
                  fileName={p.codeSnippet.fileName}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 border-t border-gray-800 pt-3">
              <div className="sm:hidden">
                <VoteButtons
                  score={p.score}
                  horizontal
                  onVote={(value) => votePost.mutate({ postId: p._id, value })}
                />
              </div>
              <span className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400">
                <MessageSquare className="h-4 w-4" />
                {formatNumber(p.commentCount)} Comments
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                }}
                className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => toggleBookmark.mutate({ postId: p._id, isBookmarked })}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-800 ${isBookmarked ? 'text-brand-400' : 'text-gray-400'}`}
                >
                  <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>
              )}
              {isAuthor && (
                <>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-gray-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <ConfirmDialog
                    open={showDeleteDialog}
                    title="Delete post?"
                    description="This action cannot be undone. Your post and all its content will be permanently removed."
                    confirmLabel="Delete"
                    onCancel={() => setShowDeleteDialog(false)}
                    onConfirm={() => {
                      setShowDeleteDialog(false);
                      deletePost.mutate(p._id, {
                        onSuccess: () => navigate(`/c/${p.communityName}`),
                      });
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment form */}
      {isAuthenticated ? (
        <div className="mt-4">
          <CommentForm
            onSubmit={(body) => createComment.mutate({ body })}
            isPending={createComment.isPending}
            placeholder="What are your thoughts?"
          />
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900 p-4 text-center text-sm text-gray-400">
          <Link to="/login" className="font-medium text-brand-400 hover:underline">
            Log in
          </Link>{' '}
          to leave a comment
        </div>
      )}

      {/* Comments */}
      <div className="mt-4">
        {comments.isLoading && <LoadingSpinner />}
        {commentTree.length > 0 ? (
          <div className="space-y-0">
            {commentTree.map((comment) => (
              <CommentThread
                key={comment._id}
                comment={comment}
                postId={postId!}
              />
            ))}
          </div>
        ) : (
          !comments.isLoading && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-sm text-gray-500">
              No comments yet. Be the first!
            </div>
          )
        )}
      </div>
    </>
  );
}

// Build a comment tree from flat array
interface CommentNode extends CommentType {
  children: CommentNode[];
}

function buildCommentTree(comments: CommentType[]): CommentNode[] {
  const map = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  // Create nodes
  for (const c of comments) {
    map.set(c._id, { ...c, children: [] });
  }

  // Build tree
  for (const c of comments) {
    const node = map.get(c._id)!;
    if (c.parent && map.has(c.parent)) {
      map.get(c.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
