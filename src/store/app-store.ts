import { create } from 'zustand';

export type FeaturePage = 'chat' | 'summarize' | 'mcq' | 'mindmap' | 'code-explainer' | 'url-fetch' | 'flashcards' | 'study-planner' | 'dashboard' | 'settings';

interface AppState {
  activeFeature: FeaturePage;
  setActiveFeature: (feature: FeaturePage) => void;
  language: string;
  setLanguage: (lang: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeFeature: 'chat',
  setActiveFeature: (feature) => set({ activeFeature: feature }),
  language: typeof window !== 'undefined' ? (localStorage.getItem('mentora-language') || 'en') : 'en',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') localStorage.setItem('mentora-language', lang);
    set({ language: lang });
  },
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
