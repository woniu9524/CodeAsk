import { create } from 'zustand';
import { readTextFile } from '@/helpers/file_helpers';
import { join } from '@/utils/path';

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

// 全局分析状态接口
interface GlobalAnalysisState {
  analyses: GlobalAnalysis[];
  addAnalysis: (analysis: Omit<GlobalAnalysis, 'id' | 'isProjectAnalysis'>) => void;
  updateAnalysis: (id: string, analysis: Partial<GlobalAnalysis>) => void;
  deleteAnalysis: (id: string) => void;
  addProjectAnalysis: (analysis: GlobalAnalysis) => void;
  loadProjectAnalyses: (folderPath: string) => Promise<void>;
}

// 创建全局分析存储
export const useGlobalAnalysisStore = create<GlobalAnalysisState>((set, get) => {
  // 初始化时从本地存储加载分析配置
  window.storeAPI.get('globalAnalyses', 'analyses').then((analyses: GlobalAnalysis[] | null) => {
    set({ analyses: analyses ?? [] });
  });

  return {
    // 初始化空的分析列表
    analyses: [],

    // 添加新的非项目分析配置
    addAnalysis: async (analysis) => {
      const newAnalysis = {
        ...analysis,
        id: crypto.randomUUID(),
        isProjectAnalysis: false
      };
      set((state) => {
        const newAnalyses = [...state.analyses, newAnalysis];
        // 保存到本地存储
        window.storeAPI.set('globalAnalyses', 'analyses', newAnalyses);
        return { analyses: newAnalyses };
      });
    },

    // 添加项目分析配置（仅在内存中）
    addProjectAnalysis: async (analysis) => {
      set((state) => {
        const existingAnalysis = state.analyses.find(a => a.id === analysis.id);
        if (existingAnalysis) return { analyses: state.analyses };

        const newAnalyses = [...state.analyses, { ...analysis, isProjectAnalysis: true }];
        return { analyses: newAnalyses };
      });
    },

    // 从项目文件夹加载项目分析配置
    loadProjectAnalyses: async (folderPath: string) => {
      try {
        const dataFilePath = join(folderPath, '.codeaskdata');
        const content = await readTextFile(dataFilePath);
        const data = JSON.parse(content);

        if (data.globalAnalysis?.configurations) {
          Object.entries(data.globalAnalysis.configurations).forEach(([analysisId, analysisData]) => {
            const projectAnalysis: GlobalAnalysis = {
              id: analysisId,
              ...(analysisData as Omit<GlobalAnalysis, 'id' | 'isProjectAnalysis'>),
              isProjectAnalysis: true
            };
            get().addProjectAnalysis(projectAnalysis);
          });
        }
      } catch (error) {
        console.error('加载项目分析配置失败:', error);
      }
    },

    // 更新指定ID的分析配置
    updateAnalysis: async (id, analysis) => {
      set((state) => {
        const newAnalyses = state.analyses.map((a) =>
          a.id === id ? { ...a, ...analysis } : a
        );
        // 只保存非项目分析配置到本地存储
        const analysesToSave = newAnalyses.filter(a => !a.isProjectAnalysis);
        window.storeAPI.set('globalAnalyses', 'analyses', analysesToSave);
        return { analyses: newAnalyses };
      });
    },

    // 删除指定ID的分析配置
    deleteAnalysis: async (id) => {
      set((state) => {
        const newAnalyses = state.analyses.filter((a) => a.id !== id);
        // 只保存非项目分析配置到本地存储
        const analysesToSave = newAnalyses.filter(a => !a.isProjectAnalysis);
        window.storeAPI.set('globalAnalyses', 'analyses', analysesToSave);
        return { analyses: newAnalyses };
      });
    }
  };
}); 