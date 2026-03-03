import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Plus, LogOut, User, X, Settings, Sun, Moon, Bot, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { useLogout } from '../../hooks/useAuth';
import { formatNumber } from '../../lib/utils';
import { useState, useRef, useEffect } from 'react';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme, toggleMobileSidebar } = useUiStore();
  const logout = useLogout();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Clear search when navigating away from search page
  useEffect(() => {
    if (!pathname.startsWith('/search')) {
      setSearchQuery('');
    }
  }, [pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
      <div className="mx-auto grid h-12 grid-cols-[auto_1fr_auto] items-center gap-4 px-4">
        {/* Mobile hamburger + Logo — left */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={toggleMobileSidebar}
            className="flex cursor-pointer items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200 lg:hidden"
            title="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        <Link to="/" className="flex shrink-0 cursor-pointer items-center gap-2 text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="hidden text-white sm:block">
            dev<span className="text-brand-400">hub</span>
          </span>
        </Link>
        </div>

        {/* Search — true center */}
        <form onSubmit={handleSearch} className="mx-auto w-full max-w-[580px]">
          <div className="relative flex items-center">
            {/* Site icon inside search bar */}
            <div className="pointer-events-none absolute left-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600">
              <Code2 className="h-3.5 w-3.5 text-white" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find anything"
              className="w-full rounded-full border border-gray-700 bg-gray-900 py-2 pl-11 pr-[4.5rem] text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors hover:border-gray-600 focus:border-brand-500 focus:bg-gray-950"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-16 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {/* Ask AI button inside search bar — navigates to /ask page */}
            {isAuthenticated && (
              <Link
                to="/ask"
                className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <Bot className="h-3.5 w-3.5" />
                Ask
              </Link>
            )}
          </div>
        </form>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex cursor-pointer items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              <Link
                to="/explore"
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-700 px-3 py-1 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:block">Create</span>
              </Link>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex cursor-pointer items-center justify-center rounded-full p-1 transition-colors hover:bg-gray-800"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                      {user?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-gray-700 bg-gray-900 shadow-xl">
                    {/* Profile header */}
                    <div className="flex items-center gap-3 px-5 py-4">
                      {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
                          {user?.username?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          u/{user?.username} &middot; {formatNumber(user?.karma ?? 0)} karma
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-800" />

                    {/* Menu items */}
                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          navigate(`/u/${user?.username}`);
                          setShowDropdown(false);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                      >
                        <User className="h-5 w-5 text-gray-400" />
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowDropdown(false);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                      >
                        <Settings className="h-5 w-5 text-gray-400" />
                        Settings
                      </button>
                    </div>

                    <div className="border-t border-gray-800" />

                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          logout.mutate();
                          setShowDropdown(false);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                      >
                        <LogOut className="h-5 w-5 text-gray-400" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-white"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="cursor-pointer rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-500"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
