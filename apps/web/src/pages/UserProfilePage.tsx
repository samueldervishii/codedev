import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Trophy, MessageSquare, FileText, Bookmark } from 'lucide-react';
import { usersApi } from '../api/users.api';
import { postsApi } from '../api/posts.api';
import { commentsApi } from '../api/comments.api';
import { PostCard } from '../components/post/PostCard';
import { useBatchBookmarks, useUserBookmarks } from '../hooks/useBookmarks';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import { TimeAgo } from '../components/shared/TimeAgo';
import { formatNumber } from '../lib/utils';
import { cn } from '../lib/utils';
import type { Post, Comment as CommentType } from '@devhub/shared';

type ProfileTab = 'posts' | 'comments' | 'saved';

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [tab, setTab] = useState<ProfileTab>('posts');
  const currentUser = useAuthStore((s) => s.user);
  const isOwnProfile = currentUser?.username === username;

  const profile = useQuery({
    queryKey: ['users', username],
    queryFn: () => usersApi.getProfile(username!),
    select: (res) => res.data.data,
    enabled: !!username,
  });

  const posts = useQuery({
    queryKey: ['users', username, 'posts'],
    queryFn: () => postsApi.getUserPosts(username!),
    select: (res) => res.data.data,
    enabled: !!username && tab === 'posts',
  });

  const comments = useQuery({
    queryKey: ['users', username, 'comments'],
    queryFn: () => commentsApi.getUserComments(username!),
    select: (res) => res.data.data,
    enabled: !!username && tab === 'comments',
  });

  const bookmarks = useUserBookmarks();
  const savedPosts = tab === 'saved' ? (bookmarks.data?.pages.flatMap((p: any) => p.data) ?? []) : [];

  const userPostIds = (posts.data || []).map((p: Post) => p._id);
  const batchBookmarks = useBatchBookmarks(userPostIds);
  const bookmarkMap = batchBookmarks.data?.bookmarks ?? {};

  if (profile.isLoading) return <LoadingSpinner />;

  if (!profile.data) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">User not found</h1>
        <p className="text-gray-400">u/{username} doesn't exist.</p>
      </div>
    );
  }

  const u = profile.data;
  const tabs: ProfileTab[] = isOwnProfile ? ['posts', 'comments', 'saved'] : ['posts', 'comments'];

  return (
    <>
      <Helmet>
        <title>u/{u.username} - DevHub</title>
      </Helmet>

      {/* Profile header */}
      <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900">
        <div className="h-20 rounded-t-xl bg-gradient-to-r from-brand-900 to-brand-700" />
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-gray-900 bg-brand-800 text-3xl font-bold text-brand-300">
              {u.username[0].toUpperCase()}
            </div>
            <div className="mt-1">
              <h1 className="text-xl font-bold text-white">
                {u.displayName || u.username}
              </h1>
              <p className="text-sm text-gray-400">u/{u.username}</p>
            </div>
          </div>

          {u.bio && <p className="mt-3 text-sm text-gray-400">{u.bio}</p>}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Trophy className="h-3.5 w-3.5" />
              {formatNumber(u.karma)} karma
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {formatNumber(u.postKarma)} post karma
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {formatNumber(u.commentKarma)} comment karma
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Joined <TimeAgo date={u.createdAt} />
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 border-b border-gray-800">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors',
              tab === t
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-gray-400 hover:text-gray-300',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'posts' && (
        <>
          {posts.isLoading && <LoadingSpinner />}
          {posts.data && posts.data.length > 0 ? (
            <div className="space-y-3">
              {posts.data.map((post: Post) => (
                <PostCard key={post._id} post={post} isBookmarked={bookmarkMap[post._id]} />
              ))}
            </div>
          ) : (
            !posts.isLoading && (
              <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-sm text-gray-500">
                No posts yet
              </div>
            )
          )}
        </>
      )}

      {tab === 'comments' && (
        <>
          {comments.isLoading && <LoadingSpinner />}
          {comments.data && comments.data.length > 0 ? (
            <div className="space-y-3">
              {comments.data.map((comment: CommentType) => (
                <UserCommentCard key={comment._id} comment={comment} />
              ))}
            </div>
          ) : (
            !comments.isLoading && (
              <div className="rounded-xl border border-gray-800 bg-gray-900 py-12 text-center text-sm text-gray-500">
                No comments yet
              </div>
            )
          )}
        </>
      )}

      {tab === 'saved' && isOwnProfile && (
        <>
          {bookmarks.isLoading && <LoadingSpinner />}
          {savedPosts.length > 0 ? (
            <div className="space-y-3">
              {savedPosts.map((post: any) => (
                <PostCard key={post._id} post={post} isBookmarked />
              ))}
              {bookmarks.hasNextPage && (
                <LoadMoreButton
                  onClick={() => bookmarks.fetchNextPage()}
                  isLoading={bookmarks.isFetchingNextPage}
                />
              )}
            </div>
          ) : (
            !bookmarks.isLoading && (
              <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-12 text-center">
                <Bookmark className="mb-3 h-8 w-8 text-gray-600" />
                <p className="mb-1 text-sm font-medium text-white">No saved posts yet</p>
                <p className="text-xs text-gray-500">Posts you save will appear here.</p>
              </div>
            )
          )}
        </>
      )}
    </>
  );
}

function UserCommentCard({ comment }: { comment: CommentType }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-400">
        <Link
          to={`/u/${comment.authorUsername}`}
          className="cursor-pointer font-semibold text-gray-200 hover:underline"
        >
          u/{comment.authorUsername}
        </Link>
        <span className="text-gray-600">&middot;</span>
        <span>
          {formatNumber(comment.score)} {comment.score === 1 ? 'point' : 'points'}
        </span>
        <span className="text-gray-600">&middot;</span>
        <TimeAgo date={comment.createdAt} />
      </div>
      <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}
