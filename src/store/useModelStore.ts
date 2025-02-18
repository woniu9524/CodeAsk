import { create } from 'zustand'

// 模型配置接口，定义了模型的各种属性
export interface ModelConfig {
  id: string           // 模型唯一标识符
  name: string         // 模型名称
  apiKey: string       // API密钥
  baseUrl: string      // 基础URL
  temperature: number  // 模型温度（创造性参数）
  maxContextTokens: number  // 最大上下文标记数
  maxOutputTokens: number   // 最大输出标记数
  enabled: boolean     // 模型是否启用
  concurrency: number  // 并发数
}

// 模型状态接口，定义了模型存储的状态和操作方法
interface ModelState {
  models: ModelConfig[]                                  // 模型配置数组
  addModel: (model: Omit<ModelConfig, 'id'>) => void     // 添加模型方法
  updateModel: (id: string, model: Partial<ModelConfig>) => void  // 更新模型方法
  deleteModel: (id: string) => void                      // 删除模型方法
  toggleModel: (id: string) => void                      // 切换模型启用状态方法
}

// 声明 window.storeAPI 的类型，解决 TypeScript 类型错误
declare global {
  interface Window {
    storeAPI: {
      get: (namespace: string, key: string) => Promise<ModelConfig[] | null>;
      set: (namespace: string, key: string, value: ModelConfig[]) => Promise<void>;
    }
  }
}

// 创建模型存储，使用 Zustand 状态管理库
export const useModelStore = create<ModelState>((set) => {
  // 初始化时从本地存储加载模型数据
  window.storeAPI.get('models', 'models').then((models) => {
    // 如果没有数据，则设置为空数组
    set({ models: models || [] });
  });

  return {
    // 初始化空模型数组
    models: [],
    
    // 添加新模型的方法
    addModel: async (model) => {
      // 为新模型生成唯一 ID
      const newModel = { ...model, id: crypto.randomUUID() };
      
      set((state) => {
        // 将新模型添加到现有模型列表
        const newModels = [...state.models, newModel];
        
        // 将更新后的模型列表保存到本地存储
        window.storeAPI.set('models', 'models', newModels);
        
        // 返回更新后的状态
        return { models: newModels };
      });
    },

    // 更新指定模型的方法
    updateModel: async (id, model) => {
      set((state) => {
        // 根据 ID 找到并更新对应的模型
        const newModels = state.models.map((m) =>
          m.id === id ? { ...m, ...model } : m
        );
        
        // 将更新后的模型列表保存到本地存储
        window.storeAPI.set('models', 'models', newModels);
        
        // 返回更新后的状态
        return { models: newModels };
      });
    },

    // 删除指定模型的方法
    deleteModel: async (id) => {
      set((state) => {
        // 过滤掉指定 ID 的模型
        const newModels = state.models.filter((m) => m.id !== id);
        
        // 将更新后的模型列表保存到本地存储
        window.storeAPI.set('models', 'models', newModels);
        
        // 返回更新后的状态
        return { models: newModels };
      });
    },

    // 切换模型启用状态的方法
    toggleModel: async (id) => {
      set((state) => {
        // 切换指定模型的启用状态
        const newModels = state.models.map((m) =>
          m.id === id ? { ...m, enabled: !m.enabled } : m
        );
        
        // 将更新后的模型列表保存到本地存储
        window.storeAPI.set('models', 'models', newModels);
        
        // 返回更新后的状态
        return { models: newModels };
      });
    }
  };
}); 