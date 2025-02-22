import { create } from 'zustand';
import { readTextFile, writeTextFile } from '@/helpers/file_helpers';
import { join } from '@/utils/path';
import { useGlobalAnalysisExecutionStore } from '@/store/useGlobalAnalysisExecutionStore';

// 单页分析配置接口
interface SinglePageAnalysisConfig {
  modelId: string;
  prompt: string;
}

// 总结分析配置接口
interface SummaryAnalysisConfig {
  modelId: string;
  prompt: string;
}

// 全局分析配置接口
export interface GlobalAnalysis {
  id: string;
  name: string;
  singlePageAnalysis: SinglePageAnalysisConfig;
  summaryAnalysis: SummaryAnalysisConfig;
  isProjectAnalysis?: boolean;
}

interface GlobalAnalysisData {
  globalAnalysisName: string;
  singlePagePrompt: string;
  summaryPrompt: string;
}

// 全局分析状态接口
interface GlobalAnalysisState {
  analyses: GlobalAnalysis[];
  addAnalysis: (analysis: Omit<GlobalAnalysis, 'id'>) => void;
  updateAnalysis: (id: string, analysis: Partial<GlobalAnalysis>) => void;
  deleteAnalysis: (id: string) => void;
  addProjectAnalysis: (analysis: GlobalAnalysis) => void;
  loadProjectAnalyses: (folderPath: string) => Promise<void>;
}

// 创建全局分析存储
export const useGlobalAnalysisStore = create<GlobalAnalysisState>((set, get) => {
  // 初始化时从本地存储加载分析数据
  window.storeAPI.get('globalAnalysis', 'analyses').then((analyses) => {
    set({ analyses: analyses || [] });
  });

  return {
    analyses: [],

    addAnalysis: async (analysis) => {
      const newAnalysis = {
        ...analysis,
        id: crypto.randomUUID(),
        isProjectAnalysis: false
      };
      set((state) => {
        const newAnalyses = [...state.analyses, newAnalysis];
        window.storeAPI.set('globalAnalysis', 'analyses', newAnalyses);
        return { analyses: newAnalyses };
      });
    },

    addProjectAnalysis: (analysis) => {
      set((state) => {
        // 检查是否已存在相同ID的分析
        const existingAnalysis = state.analyses.find(a => a.id === analysis.id);
        if (existingAnalysis) return { analyses: state.analyses };

        // 只在内存中添加项目分析
        const newAnalyses = [...state.analyses, { ...analysis, isProjectAnalysis: true }];
        return { analyses: newAnalyses };
      });
    },

    loadProjectAnalyses: async (folderPath: string) => {
      try {
        const dataFilePath = join(folderPath, '.codeaskdata');
        const content = await readTextFile(dataFilePath);
        const data = JSON.parse(content);

        if (data.globalAnalysis?.results) {
          // 遍历所有项目分析
          Object.entries<GlobalAnalysisData>(data.globalAnalysis.results).forEach(([analysisId, analysisData]) => {
            const projectAnalysis: GlobalAnalysis = {
              id: analysisId,
              name: analysisData.globalAnalysisName,
              singlePageAnalysis: {
                modelId: '', // 这些字段需要从配置中获取
                prompt: analysisData.singlePagePrompt
              },
              summaryAnalysis: {
                modelId: '', // 这些字段需要从配置中获取
                prompt: analysisData.summaryPrompt
              },
              isProjectAnalysis: true
            };
            get().addProjectAnalysis(projectAnalysis);
          });
        }
      } catch (error) {
        console.error('加载项目分析失败:', error);
      }
    },

    updateAnalysis: async (id, analysis) => {
      set((state) => {
        const newAnalyses = state.analyses.map((a) =>
          a.id === id ? { ...a, ...analysis } : a
        );
        // 只保存非项目分析到本地存储
        const analysesToSave = newAnalyses.filter(a => !a.isProjectAnalysis);
        window.storeAPI.set('globalAnalysis', 'analyses', analysesToSave);
        return { analyses: newAnalyses };
      });
    },

    deleteAnalysis: async (id) => {
      set((state) => {
        const newAnalyses = state.analyses.filter((a) => a.id !== id);
        // 只保存非项目分析到本地存储
        const analysesToSave = newAnalyses.filter(a => !a.isProjectAnalysis);
        window.storeAPI.set('globalAnalysis', 'analyses', analysesToSave);

        // 删除 .codeaskdata 中的分析数据
        const { dataFilePath, results } = useGlobalAnalysisExecutionStore.getState();
        if (dataFilePath) {
          const newResults = { ...results };
          delete newResults[id];
          writeTextFile(
            dataFilePath,
            JSON.stringify({
              globalAnalysis: {
                results: newResults
              }
            }, null, 2)
          ).catch(error => {
            console.error('删除分析数据失败:', error);
          });
        }

        return { analyses: newAnalyses };
      });
    },
  };
}); 