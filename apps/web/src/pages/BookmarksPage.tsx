import { Helmet } from 'react-helmet-async';
import { Bookmark } from 'lucide-react';
import { PostCard } from '../components/post/PostCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { LoadMoreButton } from '../components/shared/LoadMoreButton';
import { useUserBookmarks } from '../hooks/useBookmarks';

export function BookmarksPage() {
  const bookmarks = useUserBookmarks();
  const posts = bookmarks.data?.pages.flatMap((p: any) => p.data) ?? [];

  return (
    <>
      <Helmet>
        <title>Saved Posts - DevHub</title>
      </Helmet>

      <div className="mb-4 flex items-center gap-2">
        <Bookmark className="h-5 w-5 text-brand-400" />
        <h1 className="text-xl font-bold text-white">Saved Posts</h1>
      </div>

      {bookmarks.isLoading && <LoadingSpinner />}

      {posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post: any) => (
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
          <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
            <Bookmark className="mb-4 h-10 w-10 text-gray-600" />
            <h2 className="mb-2 text-lg font-bold text-white">No saved posts yet</h2>
            <p className="text-sm text-gray-400">Posts you save will appear here.</p>
          </div>
        )
      )}
    </>
  );
}
