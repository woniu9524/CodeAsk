import { create } from 'zustand'
import { readTextFile } from '@/helpers/file_helpers';
import { join } from '@/utils/path';

interface ProjectPluginData {
  pluginName: string;
  modelId: string;
  systemPrompt: string;
  userPrompt: string;
  rules: {
    fileExtensions: string[];
    showProcessed: boolean;
    showUpdated: boolean;
  };
  files: Array<{
    filename: string;
    fileHash: string;
    result: string;
    status: "success" | "error";
  }>;
}

export interface Plugin {
  id: string
  name: string
  modelId: string
  systemPrompt: string
  userPrompt: string
  enabled: boolean
  isProjectPlugin?: boolean  // 标识是否为项目插件
}

interface PluginState {
  plugins: Plugin[]
  addPlugin: (plugin: Omit<Plugin, 'id' | 'enabled'>) => void
  updatePlugin: (id: string, plugin: Partial<Plugin>) => void
  deletePlugin: (id: string) => void
  togglePlugin: (id: string) => void
  addProjectPlugin: (plugin: Plugin) => void  // 新增添加项目插件的方法
  loadProjectPlugins: (folderPath: string) => Promise<void>  // 新增加载项目插件方法
}

export const usePluginStore = create<PluginState>((set, get) => {
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
        enabled: true,
        isProjectPlugin: false  // 默认为非项目插件
      };
      set((state) => {
        const newPlugins = [...state.plugins, newPlugin];
        window.storeAPI.set('plugins', 'plugins', newPlugins);
        return { plugins: newPlugins };
      });
    },

    addProjectPlugin: async (plugin) => {
      set((state) => {
        // 检查是否已存在相同ID的插件
        const existingPlugin = state.plugins.find(p => p.id === plugin.id);
        if (existingPlugin) return { plugins: state.plugins };

        // 只在内存中添加项目插件，不保存到存储中
        const newPlugins = [...state.plugins, { ...plugin, enabled: true, isProjectPlugin: true }];
        return { plugins: newPlugins };
      });
    },

    loadProjectPlugins: async (folderPath: string) => {
      try {
        const dataFilePath = join(folderPath, '.codeaskdata');
        const content = await readTextFile(dataFilePath);
        const data = JSON.parse(content);

        if (data.plugins) {
          // 遍历所有项目插件
          Object.entries<ProjectPluginData>(data.plugins).forEach(([pluginId, pluginData]) => {
            const projectPlugin: Plugin = {
              id: pluginId,
              name: pluginData.pluginName,
              modelId: pluginData.modelId,
              systemPrompt: pluginData.systemPrompt,
              userPrompt: pluginData.userPrompt,
              enabled: true,
              isProjectPlugin: true
            };
            // 使用 addProjectPlugin 方法添加项目插件
            get().addProjectPlugin(projectPlugin);
          });
        }
      } catch (error) {
        console.error('加载项目插件失败:', error);
      }
    },

    updatePlugin: async (id, plugin) => {
      set((state) => {
        const newPlugins = state.plugins.map((p) =>
          p.id === id ? { ...p, ...plugin } : p
        );
        // 只保存非项目插件
        const pluginsToSave = newPlugins.filter(p => !p.isProjectPlugin);
        window.storeAPI.set('plugins', 'plugins', pluginsToSave);
        return { plugins: newPlugins };
      });
    },

    deletePlugin: async (id) => {
      set((state) => {
        const newPlugins = state.plugins.filter((p) => p.id !== id);
        // 只保存非项目插件
        const pluginsToSave = newPlugins.filter(p => !p.isProjectPlugin);
        window.storeAPI.set('plugins', 'plugins', pluginsToSave);
        return { plugins: newPlugins };
      });
    },

    togglePlugin: async (id) => {
      set((state) => {
        const newPlugins = state.plugins.map((p) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p
        );
        // 只保存非项目插件
        const pluginsToSave = newPlugins.filter(p => !p.isProjectPlugin);
        window.storeAPI.set('plugins', 'plugins', pluginsToSave);
        return { plugins: newPlugins };
      });
    }
  };
});
