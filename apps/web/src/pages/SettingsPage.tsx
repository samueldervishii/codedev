import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { User, Lock, Shield, Palette, Sun, Moon, X, Info } from 'lucide-react';
import { usersApi } from '../api/users.api';
import { useAuthStore } from '../stores/authStore';
import { useUiStore, type Theme } from '../stores/uiStore';
import { cn, formatNumber } from '../lib/utils';
import toast from 'react-hot-toast';
import { LIMITS } from '@devhub/shared';

type Tab = 'account' | 'profile' | 'password' | 'appearance';

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('account');

  const tabs = [
    { value: 'account' as Tab, label: 'Account', icon: User },
    { value: 'profile' as Tab, label: 'Profile', icon: Shield },
    { value: 'password' as Tab, label: 'Password', icon: Lock },
    { value: 'appearance' as Tab, label: 'Appearance', icon: Palette },
  ];

  return (
    <>
      <Helmet>
        <title>Settings - DevHub</title>
      </Helmet>

      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Settings</h1>

        {/* Tab navigation */}
        <div className="mb-6 flex gap-1 rounded-lg border border-gray-800 bg-gray-900 p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                tab === t.value
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200',
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'account' && <AccountTab />}
        {tab === 'profile' && <ProfileTab />}
        {tab === 'password' && <PasswordTab />}
        {tab === 'appearance' && <AppearanceTab />}
      </div>
    </>
  );
}

function AccountTab() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-white">Account Details</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Username</label>
          <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-300">
            {user?.username}
          </div>
          <p className="mt-1 text-xs text-gray-600">Username cannot be changed</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Email</label>
          <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-300">
            {user?.email}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Karma</label>
          <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-300">
            {formatNumber(user?.karma ?? 0)} total &middot; {formatNumber(user?.postKarma ?? 0)} post &middot; {formatNumber(user?.commentKarma ?? 0)} comment
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Member since</label>
          <div className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-300">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [showAvatarBanner, setShowAvatarBanner] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const avatarChanged = avatarUrl !== (user?.avatarUrl || '');
      const res = await usersApi.updateProfile({ displayName, bio, avatarUrl: avatarUrl || undefined });
      updateUser(res.data.data);
      toast.success('Profile updated');
      if (avatarChanged && avatarUrl) {
        setShowAvatarBanner(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* GitHub-style avatar update banner */}
      {showAvatarBanner && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-700/50 bg-brand-900/30 px-4 py-3">
          <Info className="h-5 w-5 shrink-0 text-brand-400" />
          <p className="flex-1 text-sm text-brand-300">
            Your avatar has been updated. It may take a moment to appear everywhere across the site.
          </p>
          <button
            onClick={() => setShowAvatarBanner(false)}
            className="cursor-pointer rounded-full p-1 text-brand-400 transition-colors hover:bg-brand-800/50 hover:text-brand-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white">Edit Profile</h2>

        <div className="space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-16 w-16 rounded-full border-2 border-gray-700 object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-700 bg-brand-800 text-2xl font-bold text-brand-300">
                {user?.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white">{user?.displayName || user?.username}</p>
              <p className="text-xs text-gray-500">u/{user?.username}</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={LIMITS.DISPLAY_NAME_MAX}
              placeholder="Your display name"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-xs text-gray-600">{displayName.length}/{LIMITS.DISPLAY_NAME_MAX}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={LIMITS.BIO_MAX}
              rows={4}
              placeholder="Tell us about yourself"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
            />
            <p className="mt-1 text-xs text-gray-600">{bio.length}/{LIMITS.BIO_MAX}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Avatar URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useUiStore();

  const options: { value: Theme; label: string; icon: typeof Sun; description: string }[] = [
    { value: 'dark', label: 'Dark', icon: Moon, description: 'Dark background with light text' },
    { value: 'light', label: 'Light', icon: Sun, description: 'Light background with dark text' },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-white">Appearance</h2>

      <div>
        <label className="mb-3 block text-sm font-medium text-gray-400">Theme</label>
        <div className="grid grid-cols-2 gap-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors',
                theme === opt.value
                  ? 'border-brand-500 bg-brand-900/20'
                  : 'border-gray-700 hover:border-gray-600',
              )}
            >
              <opt.icon className={cn('h-8 w-8', theme === opt.value ? 'text-brand-400' : 'text-gray-400')} />
              <span className={cn('text-sm font-medium', theme === opt.value ? 'text-white' : 'text-gray-300')}>
                {opt.label}
              </span>
              <span className="text-xs text-gray-500">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < LIMITS.PASSWORD_MIN) {
      toast.error(`Password must be at least ${LIMITS.PASSWORD_MIN} characters`);
      return;
    }

    setSaving(true);
    try {
      await usersApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-white">Change Password</h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={LIMITS.PASSWORD_MIN}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
          />
          <p className="mt-1 text-xs text-gray-600">Minimum {LIMITS.PASSWORD_MIN} characters</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-400">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="cursor-pointer rounded-full bg-brand-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Changing...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
}
