import { create } from 'zustand';
import { readTextFile, writeTextFile } from '@/helpers/file_helpers';
import { join } from '@/utils/path';

// 单页分析结果接口
export interface SinglePageAnalysisResult {
  filename: string;
  content: string;
  fileHash: string;
  status: "success" | "error";
}

// 全局分析结果接口
export interface GlobalAnalysisResult {
  globalAnalysisName: string;
  singlePagePrompt: string;
  summaryPrompt: string;
  summary: string;
  timestamp: number;
}

// 全局分析执行状态接口
interface GlobalAnalysisExecutionState {
  dataFilePath: string | null;
  results: Record<string, GlobalAnalysisResult>;
  
  initializeDataFile: (folderPath: string) => Promise<void>;
  saveAnalysisResult: (
    analysisId: string,
    result: GlobalAnalysisResult
  ) => Promise<void>;
  getAnalysisResult: (analysisId: string) => GlobalAnalysisResult | null;
}

// 创建全局分析执行存储
export const useGlobalAnalysisExecutionStore = create<GlobalAnalysisExecutionState>((set, get) => ({
  // 初始状态
  dataFilePath: null,
  results: {},

  // 初始化数据文件
  initializeDataFile: async (folderPath: string) => {
    const dataFilePath = join(folderPath, '.codeaskdata');
    try {
      const content = await readTextFile(dataFilePath);
      const data = JSON.parse(content);
      
      set({
        dataFilePath,
        results: data.globalAnalysis?.results || {}
      });
    } catch {
      await writeTextFile(dataFilePath, JSON.stringify({ 
        globalAnalysis: { 
          configurations: {},
          results: {} 
        } 
      }));
      set({
        dataFilePath,
        results: {}
      });
    }
  },

  // 保存分析结果
  saveAnalysisResult: async (analysisId: string, result: GlobalAnalysisResult) => {
    const { dataFilePath, results } = get();
    if (!dataFilePath) return;

    const newResults = {
      ...results,
      [analysisId]: result
    };

    try {
      const content = await readTextFile(dataFilePath);
      const data = JSON.parse(content);

      await writeTextFile(
        dataFilePath,
        JSON.stringify({
          ...data,
          globalAnalysis: {
            ...data.globalAnalysis,
            results: newResults
          }
        }, null, 2)
      );

      set({ results: newResults });
    } catch (error) {
      console.error('保存分析结果失败:', error);
      throw error;
    }
  },

  // 获取分析结果
  getAnalysisResult: (analysisId: string) => {
    const { results } = get();
    return results[analysisId] || null;
  }
})); 