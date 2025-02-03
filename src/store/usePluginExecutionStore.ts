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