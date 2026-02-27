import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { TrendingPage } from './pages/TrendingPage';
import { SearchPage } from './pages/SearchPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CommunityPage } from './pages/CommunityPage';
import { CreateCommunityPage } from './pages/CreateCommunityPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { PostPage } from './pages/PostPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'trending', element: <TrendingPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'c/:communityName', element: <CommunityPage /> },
      {
        path: 'c/:communityName/submit',
        element: <ProtectedRoute><CreatePostPage /></ProtectedRoute>,
      },
      { path: 'c/:communityName/posts/:postId', element: <PostPage /> },
      {
        path: 'create-community',
        element: <ProtectedRoute><CreateCommunityPage /></ProtectedRoute>,
      },
      { path: 'u/:username', element: <UserProfilePage /> },
      {
        path: 'settings',
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
