import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ModelConfig {
  id: string
  name: string
  apiKey: string
  baseUrl: string
  temperature: number
  maxContextTokens: number
  maxOutputTokens: number
  enabled: boolean
}

interface ModelState {
  models: ModelConfig[]
  addModel: (model: Omit<ModelConfig, 'id'>) => void
  updateModel: (id: string, model: Partial<ModelConfig>) => void
  deleteModel: (id: string) => void
  toggleModel: (id: string) => void
}

export const useModelStore = create<ModelState>()(
  persist(
    (set) => ({
      models: [],
      addModel: (model) =>
        set((state) => ({
          models: [
            ...state.models,
            { ...model, id: crypto.randomUUID() }
          ],
        })),
      updateModel: (id, model) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === id ? { ...m, ...model } : m
          ),
        })),
      deleteModel: (id) =>
        set((state) => ({
          models: state.models.filter((m) => m.id !== id),
        })),
      toggleModel: (id) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === id ? { ...m, enabled: !m.enabled } : m
          ),
        })),
    }),
    {
      name: 'model-storage',
    }
  )
) 