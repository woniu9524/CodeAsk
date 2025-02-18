import { create } from 'zustand'
import { readTextFile, writeTextFile } from '@/helpers/file_helpers';
import { join } from '@/utils/path';
import { usePluginExecutionStore } from '@/store/usePluginExecutionStore';

// 项目插件数据接口，定义了项目插件的详细结构
interface ProjectPluginData {
  pluginName: string;        // 插件名称
  modelId: string;           // 模型ID
  systemPrompt: string;      // 系统提示词
  userPrompt: string;        // 用户提示词
  rules: {                   // 插件规则
    fileExtensions: string[];  // 支持的文件扩展名
    showProcessed: boolean;    // 是否显示处理过程
    showUpdated: boolean;      // 是否显示更新
  };
  files: Array<{              // 处理的文件列表
    filename: string;          // 文件名
    fileHash: string;          // 文件哈希值
    result: string;            // 处理结果
    status: "success" | "error"; // 处理状态
  }>;
}

// 插件接口，定义了插件的基本属性
export interface Plugin {
  id: string                 // 唯一标识符
  name: string               // 插件名称
  modelId: string            // 模型ID
  systemPrompt: string       // 系统提示词
  userPrompt: string         // 用户提示词
  enabled: boolean           // 是否启用
  isProjectPlugin?: boolean  // 是否为项目插件
}

// 插件状态接口，定义了插件存储的状态和可用方法
interface PluginState {
  plugins: Plugin[]                                                  // 插件列表
  addPlugin: (plugin: Omit<Plugin, 'id' | 'enabled'>) => void        // 添加插件
  updatePlugin: (id: string, plugin: Partial<Plugin>) => void        // 更新插件
  deletePlugin: (id: string) => void                                 // 删除插件
  togglePlugin: (id: string) => void                                 // 切换插件状态
  addProjectPlugin: (plugin: Plugin) => void                         // 添加项目插件
  loadProjectPlugins: (folderPath: string) => Promise<void>          // 加载项目插件
}

// 创建插件存储，使用 Zustand 状态管理
export const usePluginStore = create<PluginState>((set, get) => {
  // 初始化时从本地存储加载插件数据
  window.storeAPI.get('plugins', 'plugins').then((plugins) => {
    set({ plugins: plugins || [] });
  });

  return {
    // 初始化空的插件列表
    plugins: [],

    // 添加新的非项目插件
    addPlugin: async (plugin) => {
      // 生成新插件，添加唯一ID和默认状态
      const newPlugin = {
        ...plugin,
        id: crypto.randomUUID(),
        enabled: true,
        isProjectPlugin: false  // 默认为非项目插件
      };
      set((state) => {
        // 将新插件添加到现有插件列表
        const newPlugins = [...state.plugins, newPlugin];
        // 保存到本地存储
        window.storeAPI.set('plugins', 'plugins', newPlugins);
        return { plugins: newPlugins };
      });
    },

    // 添加项目插件（仅在内存中）
    addProjectPlugin: async (plugin) => {
      set((state) => {
        // 检查是否已存在相同ID的插件，避免重复添加
        const existingPlugin = state.plugins.find(p => p.id === plugin.id);
        if (existingPlugin) return { plugins: state.plugins };

        // 只在内存中添加项目插件，不保存到存储中
        const newPlugins = [...state.plugins, { ...plugin, enabled: true, isProjectPlugin: true }];
        return { plugins: newPlugins };
      });
    },

    // 从项目文件夹加载项目插件
    loadProjectPlugins: async (folderPath: string) => {
      try {
        // 构建 .codeaskdata 文件路径
        const dataFilePath = join(folderPath, '.codeaskdata');
        // 读取文件内容
        const content = await readTextFile(dataFilePath);
        const data = JSON.parse(content);

        if (data.plugins) {
          // 遍历所有项目插件
          Object.entries<ProjectPluginData>(data.plugins).forEach(([pluginId, pluginData]) => {
            // 转换项目插件数据为 Plugin 接口
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

    // 更新指定ID的插件
    updatePlugin: async (id, plugin) => {
      set((state) => {
        // 更新匹配ID的插件信息
        const newPlugins = state.plugins.map((p) =>
          p.id === id ? { ...p, ...plugin } : p
        );
        // 只保存非项目插件到本地存储
        const pluginsToSave = newPlugins.filter(p => !p.isProjectPlugin);
        window.storeAPI.set('plugins', 'plugins', pluginsToSave);
        return { plugins: newPlugins };
      });
    },

    // 删除指定ID的插件
    deletePlugin: async (id) => {
      set((state) => {
        // 过滤掉指定ID的插件
        const newPlugins = state.plugins.filter((p) => p.id !== id);
        // 只保存非项目插件到本地存储
        const pluginsToSave = newPlugins.filter(p => !p.isProjectPlugin);
        window.storeAPI.set('plugins', 'plugins', pluginsToSave);

        // 删除 .codeaskdata 中的插件数据
        const { dataFilePath, executions } = usePluginExecutionStore.getState();
        if (dataFilePath) {
          const newExecutions = { ...executions };
          delete newExecutions[id];
          writeTextFile(
            dataFilePath,
            JSON.stringify({ plugins: newExecutions }, null, 2)
          ).catch(error => {
            console.error('删除插件数据失败:', error);
          });
        }

        return { plugins: newPlugins };
      });
    },

    // 切换指定ID插件的启用状态
    togglePlugin: async (id) => {
      set((state) => {
        // 切换匹配ID插件的启用状态
        const newPlugins = state.plugins.map((p) =>
          p.id === id ? { ...p, enabled: !p.enabled } : p
        );
        // 只保存非项目插件到本地存储
        const pluginsToSave = newPlugins.filter(p => !p.isProjectPlugin);
        window.storeAPI.set('plugins', 'plugins', pluginsToSave);
        return { plugins: newPlugins };
      });
    }
  };
});
