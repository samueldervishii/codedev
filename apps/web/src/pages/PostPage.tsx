import { Helmet } from 'react-helmet-async';
import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Share2, Code2, ExternalLink, FileText, Trash2, Bookmark, Bot, Send, Loader2, ChevronDown, ChevronUp, Pin, Lock, Repeat2 } from 'lucide-react';
import { usePost, useDeletePost, useTogglePin, useToggleLock } from '../hooks/usePosts';
import { useCommunity } from '../hooks/useCommunities';
import toast from 'react-hot-toast';
import { useComments, useCreateComment } from '../hooks/useComments';
import { useVotePost, useVoteComment } from '../hooks/useVotes';
import { useAuthStore } from '../stores/authStore';
import { useBatchBookmarks, useToggleBookmark } from '../hooks/useBookmarks';
import { streamChat } from '../api/chat.api';
import { VoteButtons } from '../components/vote/VoteButtons';
import { TimeAgo } from '../components/shared/TimeAgo';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { formatNumber } from '../lib/utils';
import { CommentThread } from '../components/comment/CommentThread';
import { CommentForm } from '../components/comment/CommentForm';
import { CodeBlock } from '../components/post/CodeBlock';
import { MarkdownPreview } from '../components/shared/MarkdownPreview';
import type { Post, Comment as CommentType, ChatMessage } from '@devhub/shared';

export function PostPage() {
  const { communityName, postId } = useParams<{ communityName: string; postId: string }>();
  const post = usePost(postId!);
  const comments = useComments(postId!);
  const votePost = useVotePost();
  const createComment = useCreateComment(postId!);
  const deletePost = useDeletePost();
  const togglePin = useTogglePin();
  const toggleLock = useToggleLock();
  const communityQuery = useCommunity(communityName!);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const toggleBookmark = useToggleBookmark();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiStreamedContent, setAiStreamedContent] = useState('');
  const aiResponseRef = useRef<HTMLDivElement>(null);
  const postId_ = post.data?._id;
  const batchBookmarks = useBatchBookmarks(postId_ ? [postId_] : []);
  const isBookmarked = postId_ ? (batchBookmarks.data?.bookmarks?.[postId_] ?? false) : false;

  if (post.isLoading) return <><Helmet><title>Loading... - DevHub</title></Helmet><LoadingSpinner /></>;
  if (!post.data) {
    return (
      <>
        <Helmet><title>Post not found - DevHub</title></Helmet>
        <div className="flex flex-col items-center py-20 text-center">
          <h1 className="mb-2 text-2xl font-bold text-white">Post not found</h1>
          <Link to={`/c/${communityName}`} className="text-brand-400 hover:underline">
            Back to c/{communityName}
          </Link>
        </div>
      </>
    );
  }

  const p: Post = post.data;
  const isAuthor = user?._id === p.author;
  const isMod = communityQuery.data?.moderators?.includes(user?._id ?? '') ?? false;

  const typeIcon = {
    text: <FileText className="h-3.5 w-3.5" />,
    link: <ExternalLink className="h-3.5 w-3.5" />,
    code: <Code2 className="h-3.5 w-3.5" />,
  };

  const commentTree = comments.data ? buildCommentTree(comments.data) : [];

  // Build post context for AI
  const buildPostContext = (): string => {
    let context = `Post Title: ${p.title}\nType: ${p.type}\nCommunity: c/${p.communityName}\nAuthor: u/${p.authorUsername}`;
    if (p.type === 'text' && p.body) context += `\n\nPost Body:\n${p.body}`;
    if (p.type === 'link' && p.url) context += `\nURL: ${p.url}`;
    if (p.type === 'code' && p.codeSnippet) {
      context += `\n\nCode (${p.codeSnippet.language}${p.codeSnippet.fileName ? `, ${p.codeSnippet.fileName}` : ''}):\n\`\`\`${p.codeSnippet.language}\n${p.codeSnippet.code}\n\`\`\``;
    }
    return context;
  };

  const handleAiSend = async (text?: string) => {
    const question = (text || aiInput).trim();
    if (!question || aiStreaming) return;

    const contextMsg: ChatMessage = {
      role: 'user',
      content: `I'm looking at this post on DevHub and have a question about it.\n\n---\n${buildPostContext()}\n---\n\nMy question: ${aiMessages.length === 0 ? question : ''}`,
    };

    const userMsg: ChatMessage = { role: 'user', content: question };

    // For the first message, include the post context
    // For follow-ups, just send the question naturally
    const newMessages: ChatMessage[] = aiMessages.length === 0
      ? [{ role: 'user', content: contextMsg.content.replace('My question: ', `My question: ${question}`) }]
      : [...aiMessages, userMsg];

    setAiMessages((prev) => [...prev, userMsg]);
    setAiInput('');
    setAiStreaming(true);
    setAiStreamedContent('');

    try {
      let fullContent = '';
      for await (const chunk of streamChat(newMessages)) {
        fullContent += chunk;
        setAiStreamedContent(fullContent);
      }
      setAiMessages((prev) => [...prev, { role: 'assistant', content: fullContent }]);
      setAiStreamedContent('');
    } catch {
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setAiStreaming(false);
    }
  };

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
        {/* Pinned / Locked / Crosspost indicators */}
        {(p.isPinned || p.isLocked || p.crosspostFrom) && (
          <div className="flex items-center gap-3 border-b border-gray-800 px-4 py-2 text-xs">
            {p.isPinned && (
              <span className="flex items-center gap-1 font-medium text-green-400">
                <Pin className="h-3 w-3" /> Pinned
              </span>
            )}
            {p.isLocked && (
              <span className="flex items-center gap-1 font-medium text-yellow-400">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
            {p.crosspostFrom && (
              <Link to={`/c/${p.crosspostFrom.communityName}`} className="flex items-center gap-1 text-gray-400 hover:text-gray-300">
                <Repeat2 className="h-3 w-3" /> Crossposted from c/{p.crosspostFrom.communityName}
              </Link>
            )}
          </div>
        )}

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
                className="cursor-pointer font-semibold text-gray-200 hover:underline"
              >
                c/{p.communityName}
              </Link>
              <span className="text-gray-600">&middot;</span>
              <span>
                Posted by{' '}
                <Link to={`/u/${p.authorUsername}`} className="cursor-pointer hover:underline">
                  u/{p.authorUsername}
                </Link>
              </span>
              <span className="text-gray-600">&middot;</span>
              <TimeAgo date={p.createdAt} />
            </div>

            {/* Title + Flair */}
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{p.title}</h1>
              {p.flair && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: p.flair.color }}
                >
                  {p.flair.name}
                </span>
              )}
            </div>

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
              {isMod && (
                <>
                  <button
                    onClick={() => togglePin.mutate(p._id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-gray-800"
                  >
                    <Pin className="h-4 w-4" />
                    {p.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => toggleLock.mutate(p._id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-yellow-400 transition-colors hover:bg-gray-800"
                  >
                    <Lock className="h-4 w-4" />
                    {p.isLocked ? 'Unlock' : 'Lock'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ask AI about this post */}
      {isAuthenticated && (
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900">
          <button
            onClick={() => setShowAi(!showAi)}
            className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 transition-colors hover:text-white"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-800">
                <Bot className="h-3.5 w-3.5 text-brand-300" />
              </div>
              Ask AI about this post
            </div>
            {showAi ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showAi && (
            <div className="border-t border-gray-800 px-4 pb-4">
              {/* AI Messages */}
              {aiMessages.length > 0 && (
                <div className="mt-3 space-y-3">
                  {aiMessages.map((msg, i) => (
                    <div key={i}>
                      {msg.role === 'user' ? (
                        <div className="mb-1">
                          <p className="text-xs font-medium text-gray-500">You</p>
                          <p className="text-sm text-white">{msg.content}</p>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-gray-800 p-3">
                          <div className="mb-1.5 flex items-center gap-1.5">
                            <Bot className="h-3 w-3 text-brand-300" />
                            <span className="text-[10px] font-medium text-gray-500">DevHub AI</span>
                          </div>
                          <MarkdownPreview content={msg.content} className="prose-xs" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Streaming */}
                  {aiStreaming && (
                    <div ref={aiResponseRef} className="rounded-lg bg-gray-800 p-3">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <Bot className="h-3 w-3 text-brand-300" />
                        <span className="text-[10px] font-medium text-gray-500">DevHub AI</span>
                      </div>
                      {aiStreamedContent ? (
                        <MarkdownPreview content={aiStreamedContent} className="prose-xs" />
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Thinking...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Input */}
              <div className="relative mt-3">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAiSend();
                    }
                  }}
                  placeholder={aiMessages.length === 0 ? 'Ask a question about this post...' : 'Ask a follow-up...'}
                  disabled={aiStreaming}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-10 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors hover:border-gray-600 focus:border-brand-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleAiSend()}
                  disabled={!aiInput.trim() || aiStreaming}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comment form */}
      {p.isLocked ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-yellow-800/30 bg-yellow-900/10 p-4 text-sm text-yellow-400">
          <Lock className="h-4 w-4 shrink-0" />
          This post is locked. New comments are not allowed.
        </div>
      ) : isAuthenticated ? (
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
