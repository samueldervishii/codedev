import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebar-open') : null;
const defaultOpen = stored !== null ? stored === 'true' : true;

const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
const defaultTheme: Theme = storedTheme === 'light' ? 'light' : 'dark';

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

// Apply default theme on load
if (typeof window !== 'undefined') {
  applyTheme(defaultTheme);
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: defaultOpen,
  theme: defaultTheme,
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
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return { theme: next };
    }),
}));
