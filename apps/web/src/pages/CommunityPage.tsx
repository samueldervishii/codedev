import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Calendar, Shield, Pencil, Globe, X, Settings as SettingsIcon } from 'lucide-react';
import { useCommunity, useJoinCommunity, useLeaveCommunity, useUpdateCommunity } from '../hooks/useCommunities';
import { useCommunityPosts } from '../hooks/usePosts';
import { useAuthStore } from '../stores/authStore';
import { useBatchBookmarks } from '../hooks/useBookmarks';
import { PostCard } from '../components/post/PostCard';
import { PostSortBar } from '../components/post/PostSortBar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import { TimeAgo } from '../components/shared/TimeAgo';
import { formatNumber } from '../lib/utils';
import type { Post } from '@devhub/shared';

export function CommunityPage() {
  const { communityName } = useParams<{ communityName: string }>();
  const [sort, setSort] = useState('hot');
  const [showSettings, setShowSettings] = useState(false);
  const communityQuery = useCommunity(communityName!);
  const posts = useCommunityPosts(communityName!, { sort });
  const { user, isAuthenticated } = useAuthStore();
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();

  const community = communityQuery.data;
  const isMember = community ? user?.joinedCommunities?.some((c) => c._id === community._id) : false;
  const isCreator = community?.creator === user?._id;
  const allPosts = posts.data?.pages.flatMap((p) => p.data) ?? [];
  const postIds = allPosts.map((p: Post) => p._id);
  const batchBookmarks = useBatchBookmarks(postIds);
  const bookmarkMap = batchBookmarks.data?.bookmarks ?? {};

  if (!community && !communityQuery.isLoading) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <h1 className="mb-2 text-2xl font-bold text-white">Community not found</h1>
        <p className="text-gray-400">c/{communityName} doesn't exist.</p>
      </div>
    );
  }

  if (communityQuery.isLoading) return <LoadingSpinner />;

  return (
    <>
      <Helmet>
        <title>{community ? `c/${community.name}` : 'Community'} - DevHub</title>
      </Helmet>

      {/* Community header */}
      {community && (
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900">
          {/* Banner */}
          <div className="h-24 rounded-t-xl bg-gradient-to-r from-brand-900 to-brand-700" />

          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-900 bg-brand-800 text-2xl font-bold text-brand-300">
                  {community.name[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">c/{community.name}</h1>
                  {community.displayName && community.displayName !== community.name && (
                    <p className="text-sm text-gray-400">{community.displayName}</p>
                  )}
                </div>
              </div>

              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  {isCreator && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-600 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Settings</span>
                    </button>
                  )}
                  {isMember ? (
                    <button
                      onClick={() => leaveCommunity.mutate(community.name)}
                      disabled={leaveCommunity.isPending}
                      className="cursor-pointer rounded-full border border-gray-600 px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
                    >
                      Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => joinCommunity.mutate(community.name)}
                      disabled={joinCommunity.isPending}
                      className="cursor-pointer rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
                    >
                      Join
                    </button>
                  )}
                </div>
              )}
            </div>

            {community.description && (
              <p className="mt-3 text-sm text-gray-400">{community.description}</p>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {formatNumber(community.memberCount)} members
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Created <TimeAgo date={community.createdAt} />
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                Public
              </span>
              {isCreator && (
                <span className="flex items-center gap-1 text-brand-400">
                  <Shield className="h-3.5 w-3.5" />
                  Creator
                </span>
              )}
            </div>

            {/* Community stats */}
            <div className="mt-4 flex gap-6 border-t border-gray-800 pt-4">
              <div>
                <p className="text-lg font-bold text-white">{formatNumber(community.memberCount)}</p>
                <p className="text-xs text-gray-500">Members</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{formatNumber(community.postCount ?? 0)}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
            </div>

            {/* Rules */}
            {community.rules && community.rules.length > 0 && (
              <div className="mt-4 border-t border-gray-800 pt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Community Rules</h3>
                <ol className="space-y-1.5">
                  {community.rules.map((rule: { title: string; description?: string }, i: number) => (
                    <li key={i} className="text-sm">
                      <span className="font-medium text-gray-300">{i + 1}. {rule.title}</span>
                      {rule.description && (
                        <p className="mt-0.5 text-xs text-gray-500">{rule.description}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tags */}
            {community.tags && community.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-gray-800 pt-4">
                {community.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create post prompt */}
      {isAuthenticated && community && (
        <Link
          to={`/c/${community.name}/submit`}
          className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3 transition-colors hover:border-gray-700"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-gray-400">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-500">
            Create a post...
          </div>
          <Pencil className="h-5 w-5 text-gray-500" />
        </Link>
      )}

      {/* Posts */}
      <PostSortBar sort={sort} onSortChange={setSort} />

      {posts.isLoading && <LoadingSpinner />}

      {allPosts.length > 0 ? (
        <div className="space-y-3">
          {allPosts.map((post: Post) => (
            <PostCard key={post._id} post={post} isBookmarked={bookmarkMap[post._id]} />
          ))}
          {posts.hasNextPage && (
            <LoadMoreButton onClick={() => posts.fetchNextPage()} isLoading={posts.isFetchingNextPage} />
          )}
        </div>
      ) : (
        !posts.isLoading && (
          <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
            <h2 className="mb-2 text-lg font-bold text-white">No posts yet</h2>
            <p className="text-sm text-gray-400">Be the first to post in this community!</p>
          </div>
        )
      )}

      {/* Community Settings Modal */}
      {showSettings && community && (
        <CommunitySettingsModal
          community={community}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}

interface CommunitySettingsModalProps {
  community: any;
  onClose: () => void;
}

function CommunitySettingsModal({ community, onClose }: CommunitySettingsModalProps) {
  const updateCommunity = useUpdateCommunity(community.name);
  const [displayName, setDisplayName] = useState(community.displayName || '');
  const [description, setDescription] = useState(community.description || '');
  const [tagsStr, setTagsStr] = useState((community.tags || []).join(', '));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsStr
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean);
    updateCommunity.mutate(
      { displayName: displayName || undefined, description, tags },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Community Settings</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-5 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={100}
              placeholder={community.name}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell people what this community is about"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-xs text-gray-600">{description.length}/500</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-400">Tags</label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="javascript, react, typescript"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-xs text-gray-600">Comma-separated, max 10 tags</p>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-full border border-gray-600 px-5 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateCommunity.isPending}
              className="cursor-pointer rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateCommunity.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
