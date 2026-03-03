import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, Compass, TrendingUp, Plus, Newspaper, Menu, Users,
  HelpCircle, Info, Shield, FileText, Accessibility, Flame,
  ChevronDown, Bookmark, X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/trending', label: 'Trending', icon: Flame },
];

function SidebarContent({ expanded, onNavigate }: { expanded: boolean; onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [communitiesOpen, setCommunitiesOpen] = useState(false);

  const communities = user?.joinedCommunities ?? [];

  const linkClass = (active?: boolean) =>
    cn(
      'flex cursor-pointer items-center rounded-lg transition-colors',
      expanded ? 'gap-3 px-3 py-2 text-sm' : 'justify-center p-2.5',
      active
        ? 'bg-gray-800 text-white'
        : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200',
    );

  const handleLinkClick = () => {
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden p-2">
      {/* Main navigation */}
      <nav className="space-y-0.5">
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} title={item.label} className={linkClass(pathname === item.to)} onClick={handleLinkClick}>
            <item.icon className="h-5 w-5 shrink-0" />
            {expanded && item.label}
          </Link>
        ))}
        {isAuthenticated && (
          <Link to="/bookmarks" title="Saved" className={linkClass(pathname === '/bookmarks')} onClick={handleLinkClick}>
            <Bookmark className="h-5 w-5 shrink-0" />
            {expanded && 'Saved'}
          </Link>
        )}
      </nav>

      <hr className="my-2 border-gray-800" />

      {/* Communities — collapsible dropdown */}
      <div>
        {expanded ? (
          <button
            onClick={() => setCommunitiesOpen(!communitiesOpen)}
            className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-400"
          >
            Communities
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', communitiesOpen && 'rotate-180')} />
          </button>
        ) : null}

        {/* Create — always visible */}
        <div className="space-y-0.5">
          <Link to="/create-community" title="Create a community" className={linkClass()} onClick={handleLinkClick}>
            <Plus className="h-5 w-5 shrink-0" />
            {expanded && 'Create a community'}
          </Link>
        </div>

        {/* Community list — only when dropdown is open */}
        {expanded && communitiesOpen && (
          <div className="mt-0.5 space-y-0.5">
            {isAuthenticated && communities.length > 0 ? (
              communities.map((community) => (
                <Link
                  key={community._id}
                  to={`/c/${community.name}`}
                  title={`c/${community.name}`}
                  className={linkClass(pathname === `/c/${community.name}`)}
                  onClick={handleLinkClick}
                >
                  {community.iconUrl ? (
                    <img src={community.iconUrl} alt="" className="h-5 w-5 shrink-0 rounded-full" />
                  ) : (
                    <Users className="h-5 w-5 shrink-0" />
                  )}
                  <span className="truncate">c/{community.name}</span>
                </Link>
              ))
            ) : isAuthenticated ? (
              <p className="px-3 py-2 text-xs text-gray-600">Join communities to see them here</p>
            ) : (
              <p className="px-3 py-2 text-xs text-gray-600">Log in to see your communities</p>
            )}
          </div>
        )}
      </div>

      <hr className="my-2 border-gray-800" />

      {/* Resources */}
      <div>
        {expanded && (
          <div className="px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Resources</span>
          </div>
        )}
        <nav className="space-y-0.5">
          <Link to="/explore" title="All Communities" className={linkClass()} onClick={handleLinkClick}>
            <Newspaper className="h-5 w-5 shrink-0" />
            {expanded && 'All Communities'}
          </Link>
          <Link to="/trending" title="Trending" className={linkClass()} onClick={handleLinkClick}>
            <TrendingUp className="h-5 w-5 shrink-0" />
            {expanded && 'Trending'}
          </Link>
          <Link to="/about" title="About DevHub" className={linkClass()} onClick={handleLinkClick}>
            <Info className="h-5 w-5 shrink-0" />
            {expanded && 'About DevHub'}
          </Link>
          <Link to="/help" title="Help" className={linkClass()} onClick={handleLinkClick}>
            <HelpCircle className="h-5 w-5 shrink-0" />
            {expanded && 'Help'}
          </Link>
        </nav>
      </div>

      <hr className="my-2 border-gray-800" />

      {/* Policies */}
      <div>
        {expanded && (
          <div className="px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Policies</span>
          </div>
        )}
        <nav className="space-y-0.5">
          <Link to="/privacy" title="Privacy Policy" className={linkClass()} onClick={handleLinkClick}>
            <Shield className="h-5 w-5 shrink-0" />
            {expanded && 'Privacy Policy'}
          </Link>
          <Link to="/terms" title="User Agreement" className={linkClass()} onClick={handleLinkClick}>
            <FileText className="h-5 w-5 shrink-0" />
            {expanded && 'User Agreement'}
          </Link>
          <Link to="/accessibility" title="Accessibility" className={linkClass()} onClick={handleLinkClick}>
            <Accessibility className="h-5 w-5 shrink-0" />
            {expanded && 'Accessibility'}
          </Link>
        </nav>
      </div>

      {/* Copyright */}
      {expanded && (
        <div className="mt-auto px-3 pb-2 pt-4">
          <p className="text-[10px] text-gray-600">DevHub, Inc. &copy; {new Date().getFullYear()}. All rights reserved.</p>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen: open, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const { pathname } = useLocation();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname, setMobileSidebarOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed top-[49px] left-0 z-40 hidden shrink-0 border-r border-gray-800 bg-gray-950 transition-[width] duration-300 ease-in-out lg:block',
          open ? 'w-[270px]' : 'w-[52px]',
        )}
        style={{ height: 'calc(100vh - 49px)' }}
      >
        {/* Desktop hamburger toggle */}
        <div className="p-2 pb-0">
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex cursor-pointer items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-900 hover:text-gray-200',
              open ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
            )}
            title={open ? 'Close sidebar' : 'Open sidebar'}
          >
            <Menu className="h-5 w-5 shrink-0" />
            {open && <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Menu</span>}
          </button>
        </div>
        <SidebarContent expanded={open} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Slide-in panel */}
          <aside
            className="relative h-full w-[280px] border-r border-gray-800 bg-gray-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile sidebar header */}
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent expanded onNavigate={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
