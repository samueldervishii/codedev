import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Code2, Plus, LogOut, User, ChevronDown, Search, X, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
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
        {/* Logo — left */}
        <Link to="/" className="flex shrink-0 cursor-pointer items-center gap-2 text-lg font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <span className="hidden text-white sm:block">
            dev<span className="text-brand-400">hub</span>
          </span>
        </Link>

        {/* Search — true center */}
        <form onSubmit={handleSearch} className="mx-auto w-full max-w-[580px]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find anything"
              className="w-full rounded-full border border-gray-700 bg-gray-900 py-2 pl-10 pr-9 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors hover:border-gray-600 focus:border-brand-500 focus:bg-gray-950"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          {isAuthenticated ? (
            <>
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
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-gray-800"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden max-w-[100px] truncate text-gray-300 md:block">
                    {user?.username}
                  </span>
                  <ChevronDown className="h-3 w-3 text-gray-500" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl">
                    <div className="border-b border-gray-700 px-4 py-2">
                      <p className="text-sm font-medium text-white">{user?.username}</p>
                      <p className="text-xs text-gray-400">{user?.karma ?? 0} karma</p>
                    </div>
                    <button
                      onClick={() => { navigate(`/u/${user?.username}`); setShowDropdown(false); }}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <div className="border-t border-gray-700" />
                    <button
                      onClick={() => { logout.mutate(); setShowDropdown(false); }}
                      className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </button>
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
