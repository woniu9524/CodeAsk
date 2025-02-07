import { create } from 'zustand'

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

export const usePluginStore = create<PluginState>((set) => {
  // 初始化时从存储加载数据
  window.storeAPI.get('plugins', 'plugins').then((plugins) => {
    set({ plugins: plugins || [] });
  });

  return {
    plugins: [],
    
    addPlugin: async (plugin) => {
      const newPlugin = { 
        ...plugin, 
        id: crypto.randomUUID(), 
        enabled: true 
      };
      set((state) => {
        const newPlugins = [...state.plugins, newPlugin];
        window.storeAPI.set('plugins', 'plugins', newPlugins);
        return { plugins: newPlugins };
      });
    },

    updatePlugin: async (id, plugin) => {
      set((state) => {
        const newPlugins = state.plugins.map((p) =>
          p.id === id ? { ...p, ...plugin } : p
        );
        window.storeAPI.set('plugins', 'plugins', newPlugins);
        return { plugins: newPlugins };
      });
    },

    deletePlugin: async (id) => {
      set((state) => {
        const newPlugins = state.plugins.filter((p) => p.id !== id);
        window.storeAPI.set('plugins', 'plugins', newPlugins);
        return { plugins: newPlugins };
      });
    },

    togglePlugin: async (id) => {
      set((state) => {
        const newPlugins = state.plugins.map((p) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p
        );
        window.storeAPI.set('plugins', 'plugins', newPlugins);
        return { plugins: newPlugins };
      });
    }
  };
}); 