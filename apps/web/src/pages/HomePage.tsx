import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Code2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PostCard } from '../components/post/PostCard';
import { PostSortBar } from '../components/post/PostSortBar';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useHomeFeed } from '../hooks/usePosts';
import { useAuthStore } from '../stores/authStore';

export function HomePage() {
  const [sort, setSort] = useState('hot');
  const { isAuthenticated } = useAuthStore();
  const feed = useHomeFeed({ sort });

  return (
    <>
      <Helmet>
        <title>DevHub - Home</title>
      </Helmet>

      {isAuthenticated && <PostSortBar sort={sort} onSortChange={setSort} />}

      {isAuthenticated ? (
        <>
          {feed.isLoading && <LoadingSpinner />}
          {feed.data?.data && feed.data.data.length > 0 ? (
            <div className="space-y-3">
              {feed.data.data.map((post: any) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            !feed.isLoading && <EmptyFeed />
          )}
        </>
      ) : (
        <WelcomePage />
      )}
    </>
  );
}

function WelcomePage() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-900/50">
        <Code2 className="h-10 w-10 text-brand-400" />
      </div>
      <h1 className="mb-3 text-3xl font-bold text-white">Welcome to DevHub</h1>
      <p className="mb-8 max-w-md text-gray-400">
        The developer community. Share code, discuss ideas, and connect with
        developers from around the world.
      </p>
      <div className="flex gap-3">
        <Link
          to="/register"
          className="cursor-pointer rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
        >
          Sign Up
        </Link>
        <Link
          to="/explore"
          className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-700 px-6 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
        >
          <Users className="h-4 w-4" />
          Explore Communities
        </Link>
      </div>
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-800 bg-gray-900 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-900/50">
        <Code2 className="h-8 w-8 text-brand-400" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-white">Your feed is empty</h2>
      <p className="mb-6 max-w-md text-sm text-gray-400">
        Join some communities to see posts in your home feed. Explore developer communities for
        JavaScript, Python, Rust, and more.
      </p>
      <Link
        to="/explore"
        className="flex cursor-pointer items-center gap-2 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
      >
        <Users className="h-4 w-4" />
        Explore Communities
      </Link>
    </div>
  );
}
