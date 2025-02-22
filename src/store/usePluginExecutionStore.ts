import { create } from 'zustand';
import { readTextFile, writeTextFile } from '@/helpers/file_helpers';
import { join } from '@/utils/path';

// 插件执行文件的接口定义
export interface PluginExecutionFile {
  filename: string;  // 文件名
  fileHash: string;  // 文件哈希值，用于唯一标识文件
  result: string;    // 执行结果
  status: "success" | "error";  // 执行状态
}

// 插件执行规则接口定义
interface PluginExecutionRules {
  fileExtensions: string[];  // 支持的文件扩展名
  showProcessed: boolean;    // 是否显示已处理文件
  showUpdated: boolean;      // 是否显示已更新文件
}

// 插件执行记录接口定义
interface PluginExecution {
  pluginName: string;     // 插件名称
  modelId: string;        // 模型ID
  systemPrompt: string;   // 系统提示词
  userPrompt: string;     // 用户提示词
  rules: PluginExecutionRules;  // 执行规则
  files: PluginExecutionFile[]; // 执行的文件列表
}

// 插件执行状态接口定义
interface PluginExecutionState {
  dataFilePath: string | null;  // 数据文件路径
  executions: Record<string, PluginExecution>;  // 插件执行记录映射
  
  // 动作接口定义
  initializeDataFile: (folderPath: string) => Promise<void>;  // 初始化数据文件
  savePluginExecution: (
    pluginId: string,
    execution: PluginExecution
  ) => Promise<void>;  // 保存插件执行记录
  getPluginExecution: (pluginId: string) => PluginExecution | null;  // 获取插件执行记录
}

// 创建插件执行状态存储
export const usePluginExecutionStore = create<PluginExecutionState>((set, get) => ({
  // 初始状态
  dataFilePath: null,
  executions: {},

  // 初始化数据文件方法
  initializeDataFile: async (folderPath: string) => {
    // 构建数据文件路径
    const dataFilePath = join(folderPath, '.codeaskdata');
    try {
      // 尝试读取现有数据文件
      const content = await readTextFile(dataFilePath);
      const data = JSON.parse(content);
      
      // 设置状态：数据文件路径和执行记录
      set({
        dataFilePath,
        executions: data.plugins || {}
      });
    } catch {
      // 如果文件不存在或读取失败，创建新文件
      await writeTextFile(dataFilePath, JSON.stringify({ plugins: {} }));
      set({
        dataFilePath,
        executions: {}
      });
    }
  },

  // 保存插件执行记录方法
  savePluginExecution: async (pluginId: string, execution: PluginExecution) => {
    const { dataFilePath, executions } = get();
    if (!dataFilePath) return;

    // 获取已存在的插件执行记录
    const existingExecution = executions[pluginId];
    
    // 合并文件列表
    let mergedFiles: PluginExecutionFile[] = [];
    if (existingExecution) {
      // 合并规则设置，保留现有规则
      execution.rules = {
        ...existingExecution.rules,
        ...execution.rules
      };
      
      // 合并文件列表
      mergedFiles = [...existingExecution.files];
      execution.files.forEach(newFile => {
        const index = mergedFiles.findIndex(f => f.filename === newFile.filename);
        if (index !== -1) {
          // 如果文件已存在，更新它
          mergedFiles[index] = newFile;
        } else {
          // 如果是新文件，添加到列表末尾
          mergedFiles.push(newFile);
        }
      });
      
      execution.files = mergedFiles;
    }

    // 创建新的执行记录映射
    const newExecutions = {
      ...executions,
      [pluginId]: execution
    };

    try {
      // 先读取现有的文件内容
      const content = await readTextFile(dataFilePath);
      const data = JSON.parse(content);

      // 更新 plugins 部分，保留其他数据
      await writeTextFile(
        dataFilePath,
        JSON.stringify({
          ...data,
          plugins: newExecutions
        }, null, 2)
      );

      // 更新状态
      set({ executions: newExecutions });
    } catch (error) {
      console.error('保存插件执行数据失败:', error);
      throw error;
    }
  },

  // 获取指定插件的执行记录方法
  getPluginExecution: (pluginId: string) => {
    const { executions } = get();
    return executions[pluginId] || null;
  }
})); 