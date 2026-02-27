import { Link, useLocation } from 'react-router-dom';
import {
  Home, Compass, TrendingUp, Plus, Newspaper, Menu, Users,
  HelpCircle, Info, Shield, FileText, Accessibility, Flame,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/trending', label: 'Trending', icon: Flame },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const { sidebarOpen: open, toggleSidebar } = useUiStore();

  const linkClass = (active?: boolean) =>
    cn(
      'flex cursor-pointer items-center rounded-lg transition-colors',
      open ? 'gap-3 px-3 py-2 text-sm' : 'justify-center p-2.5',
      active
        ? 'bg-gray-800 text-white'
        : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200',
    );

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-gray-800 transition-[width] duration-300 ease-in-out lg:block',
        open ? 'w-[270px]' : 'w-[52px]',
      )}
      style={{ height: 'calc(100vh - 49px)' }}
    >
      <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden p-2">
        {/* Hamburger toggle */}
        <div className="mb-1">
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

        {/* Main navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} title={item.label} className={linkClass(pathname === item.to)}>
              <item.icon className="h-5 w-5 shrink-0" />
              {open && item.label}
            </Link>
          ))}
        </nav>

        <hr className="my-2 border-gray-800" />

        {/* Communities */}
        <div>
          {open && (
            <div className="px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Communities</span>
            </div>
          )}

          <div className="space-y-0.5">
            <Link to="/create-community" title="Create a community" className={linkClass()}>
              <Plus className="h-5 w-5 shrink-0" />
              {open && 'Create a community'}
            </Link>

            {isAuthenticated && user?.joinedCommunities && user.joinedCommunities.length > 0 && (
              <>
                {user.joinedCommunities.map((community) => (
                  <Link
                    key={community._id}
                    to={`/c/${community.name}`}
                    title={`c/${community.name}`}
                    className={linkClass(pathname === `/c/${community.name}`)}
                  >
                    {community.iconUrl ? (
                      <img src={community.iconUrl} alt="" className="h-5 w-5 shrink-0 rounded-full" />
                    ) : (
                      <Users className="h-5 w-5 shrink-0" />
                    )}
                    {open && <span className="truncate">c/{community.name}</span>}
                  </Link>
                ))}
              </>
            )}

            {open && isAuthenticated && (!user?.joinedCommunities || user.joinedCommunities.length === 0) && (
              <p className="px-3 py-2 text-xs text-gray-600">Join communities to see them here</p>
            )}
            {open && !isAuthenticated && (
              <p className="px-3 py-2 text-xs text-gray-600">Log in to see your communities</p>
            )}
          </div>
        </div>

        <hr className="my-2 border-gray-800" />

        {/* Resources */}
        <div>
          {open && (
            <div className="px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Resources</span>
            </div>
          )}
          <nav className="space-y-0.5">
            <Link to="/explore" title="All Communities" className={linkClass()}>
              <Newspaper className="h-5 w-5 shrink-0" />
              {open && 'All Communities'}
            </Link>
            <Link to="/trending" title="Trending" className={linkClass()}>
              <TrendingUp className="h-5 w-5 shrink-0" />
              {open && 'Trending'}
            </Link>
            <Link to="/about" title="About DevHub" className={linkClass()}>
              <Info className="h-5 w-5 shrink-0" />
              {open && 'About DevHub'}
            </Link>
            <Link to="/help" title="Help" className={linkClass()}>
              <HelpCircle className="h-5 w-5 shrink-0" />
              {open && 'Help'}
            </Link>
          </nav>
        </div>

        <hr className="my-2 border-gray-800" />

        {/* Policies */}
        <div>
          {open && (
            <div className="px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Policies</span>
            </div>
          )}
          <nav className="space-y-0.5">
            <Link to="/privacy" title="Privacy Policy" className={linkClass()}>
              <Shield className="h-5 w-5 shrink-0" />
              {open && 'Privacy Policy'}
            </Link>
            <Link to="/terms" title="User Agreement" className={linkClass()}>
              <FileText className="h-5 w-5 shrink-0" />
              {open && 'User Agreement'}
            </Link>
            <Link to="/accessibility" title="Accessibility" className={linkClass()}>
              <Accessibility className="h-5 w-5 shrink-0" />
              {open && 'Accessibility'}
            </Link>
          </nav>
        </div>

        {/* Copyright */}
        {open && (
          <div className="mt-auto px-3 pb-2 pt-4">
            <p className="text-[10px] text-gray-600">DevHub, Inc. &copy; {new Date().getFullYear()}. All rights reserved.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
