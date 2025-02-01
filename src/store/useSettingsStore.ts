import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ThemeMode } from '@/types/theme-mode'

interface SettingsState {
  theme: ThemeMode
  language: string
  setTheme: (theme: ThemeMode) => void
  setLanguage: (lang: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'en',
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-storage',
    }
  )
) 