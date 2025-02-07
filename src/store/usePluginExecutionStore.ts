import { create } from 'zustand';
import { readTextFile, writeTextFile } from '@/helpers/file_helpers';
import { join } from '@/utils/path';

export interface PluginExecutionFile {
  filename: string;
  fileHash: string;
  result: string;
  status: "success" | "error";
}

interface PluginExecutionRules {
  fileExtensions: string[];
  showProcessed: boolean;
  showUpdated: boolean;
}

interface PluginExecution {
  pluginName: string;
  modelId: string;
  systemPrompt: string;
  userPrompt: string;
  rules: PluginExecutionRules;
  files: PluginExecutionFile[];
}

interface PluginExecutionState {
  dataFilePath: string | null;
  executions: Record<string, PluginExecution>;
  
  // Actions
  initializeDataFile: (folderPath: string) => Promise<void>;
  savePluginExecution: (
    pluginId: string,
    execution: PluginExecution
  ) => Promise<void>;
  getPluginExecution: (pluginId: string) => PluginExecution | null;
}

export const usePluginExecutionStore = create<PluginExecutionState>((set, get) => ({
  dataFilePath: null,
  executions: {},

  initializeDataFile: async (folderPath: string) => {
    const dataFilePath = join(folderPath, '.codeaskdata');
    try {
      const content = await readTextFile(dataFilePath);
      const data = JSON.parse(content);
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

  savePluginExecution: async (pluginId: string, execution: PluginExecution) => {
    const { dataFilePath, executions } = get();
    if (!dataFilePath) return;

    const existingExecution = executions[pluginId];
    
    // 如果已存在该插件的执行记录，合并文件列表
    let mergedFiles: PluginExecutionFile[] = [];
    if (existingExecution) {
      // 保留现有的规则设置
      execution.rules = {
        ...existingExecution.rules,
        ...execution.rules
      };
      
      // 合并新文件列表
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

    const newExecutions = {
      ...executions,
      [pluginId]: execution
    };

    await writeTextFile(
      dataFilePath,
      JSON.stringify({ plugins: newExecutions }, null, 2)
    );

    set({ executions: newExecutions });
  },

  getPluginExecution: (pluginId: string) => {
    const { executions } = get();
    return executions[pluginId] || null;
  }
})); 