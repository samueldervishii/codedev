import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';
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
import { AboutPage } from './pages/AboutPage';
import { HelpPage } from './pages/HelpPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { AskPage } from './pages/AskPage';
import { NotificationsPage } from './pages/NotificationsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: <ExplorePage /> },
      { path: 'trending', element: <TrendingPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'login', element: <GuestRoute><LoginPage /></GuestRoute> },
      { path: 'register', element: <GuestRoute><RegisterPage /></GuestRoute> },
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
      {
        path: 'notifications',
        element: <ProtectedRoute><NotificationsPage /></ProtectedRoute>,
      },
      {
        path: 'bookmarks',
        element: <ProtectedRoute><BookmarksPage /></ProtectedRoute>,
      },
      {
        path: 'ask',
        element: <ProtectedRoute><AskPage /></ProtectedRoute>,
      },
      {
        path: 'ask/:conversationId',
        element: <ProtectedRoute><AskPage /></ProtectedRoute>,
      },
      { path: 'about', element: <AboutPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'accessibility', element: <AccessibilityPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
