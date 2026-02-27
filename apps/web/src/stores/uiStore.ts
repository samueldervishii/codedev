import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebar-open') : null;
const defaultOpen = stored !== null ? stored === 'true' : true;

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: defaultOpen,
  toggleSidebar: () =>
    set((s) => {
      const next = !s.sidebarOpen;
      localStorage.setItem('sidebar-open', String(next));
      return { sidebarOpen: next };
    }),
  setSidebarOpen: (open) => {
    localStorage.setItem('sidebar-open', String(open));
    set({ sidebarOpen: open });
  },
}));
