import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT_FOLDERS = 10;

interface RecentFoldersState {
  recentFolders: string[];
  addRecentFolder: (path: string) => void;
  removeRecentFolder: (path: string) => void;
  clearRecentFolders: () => void;
}

export const useRecentFoldersStore = create<RecentFoldersState>()(
  persist(
    (set) => ({
      recentFolders: [],
      
      addRecentFolder: (path: string) => set((state) => {
        const newRecentFolders = [
          path,
          ...state.recentFolders.filter((p) => p !== path)
        ].slice(0, MAX_RECENT_FOLDERS);
        
        return { recentFolders: newRecentFolders };
      }),

      removeRecentFolder: (path: string) => set((state) => ({
        recentFolders: state.recentFolders.filter((p) => p !== path)
      })),

      clearRecentFolders: () => set({ recentFolders: [] })
    }),
    {
      name: 'recent-folders-storage'
    }
  )
); 