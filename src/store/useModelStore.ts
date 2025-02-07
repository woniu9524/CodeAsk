import { create } from 'zustand'

export interface ModelConfig {
  id: string
  name: string
  apiKey: string
  baseUrl: string
  temperature: number
  maxContextTokens: number
  maxOutputTokens: number
  enabled: boolean
  concurrency: number
}

interface ModelState {
  models: ModelConfig[]
  addModel: (model: Omit<ModelConfig, 'id'>) => void
  updateModel: (id: string, model: Partial<ModelConfig>) => void
  deleteModel: (id: string) => void
  toggleModel: (id: string) => void
}

export const useModelStore = create<ModelState>((set) => {
  // 初始化时从存储加载数据
  window.storeAPI.get('models', 'models').then((models) => {
    set({ models: models || [] });
  });

  return {
    models: [],
    
    addModel: async (model) => {
      const newModel = { ...model, id: crypto.randomUUID() };
      set((state) => {
        const newModels = [...state.models, newModel];
        window.storeAPI.set('models', 'models', newModels);
        return { models: newModels };
      });
    },

    updateModel: async (id, model) => {
      set((state) => {
        const newModels = state.models.map((m) =>
          m.id === id ? { ...m, ...model } : m
        );
        window.storeAPI.set('models', 'models', newModels);
        return { models: newModels };
      });
    },

    deleteModel: async (id) => {
      set((state) => {
        const newModels = state.models.filter((m) => m.id !== id);
        window.storeAPI.set('models', 'models', newModels);
        return { models: newModels };
      });
    },

    toggleModel: async (id) => {
      set((state) => {
        const newModels = state.models.map((m) =>
          m.id === id ? { ...m, enabled: !m.enabled } : m
        );
        window.storeAPI.set('models', 'models', newModels);
        return { models: newModels };
      });
    }
  };
}); 