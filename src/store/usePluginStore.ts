import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Plugin {
  id: string
  name: string
  modelId: string
  systemPrompt: string
  userPrompt: string
  enabled: boolean
}

interface PluginState {
  plugins: Plugin[]
  addPlugin: (plugin: Omit<Plugin, 'id' | 'enabled'>) => void
  updatePlugin: (id: string, plugin: Partial<Plugin>) => void
  deletePlugin: (id: string) => void
  togglePlugin: (id: string) => void
}

export const usePluginStore = create<PluginState>()(
  persist(
    (set) => ({
      plugins: [],
      addPlugin: (plugin) =>
        set((state) => ({
          plugins: [
            ...state.plugins,
            { ...plugin, id: crypto.randomUUID(), enabled: true }
          ],
        })),
      updatePlugin: (id, plugin) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, ...plugin } : p
          ),
        })),
      deletePlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.filter((p) => p.id !== id),
        })),
      togglePlugin: (id) =>
        set((state) => ({
          plugins: state.plugins.map((p) =>
            p.id === id ? { ...p, enabled: !p.enabled } : p
          ),
        })),
    }),
    {
      name: 'plugin-storage',
    }
  )
) 