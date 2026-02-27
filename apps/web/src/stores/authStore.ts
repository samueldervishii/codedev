import { create } from 'zustand';
import type { User } from '@devhub/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isRestoring: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setRestoring: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isRestoring: true, // Start as true — we assume we need to check
  setAuth: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true, isRestoring: false }),
  clearAuth: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isRestoring: false }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  setRestoring: (isRestoring) => set({ isRestoring }),
}));
