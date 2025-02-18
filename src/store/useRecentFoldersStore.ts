import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 定义最大最近文件夹数量常量
const MAX_RECENT_FOLDERS = 10;

// 定义最近文件夹状态接口
interface RecentFoldersState {
  // 存储最近文件夹路径的数组
  recentFolders: string[];
  
  // 添加最近文件夹的方法
  addRecentFolder: (path: string) => void;
  
  // 移除特定最近文件夹的方法
  removeRecentFolder: (path: string) => void;
  
  // 清空所有最近文件夹的方法
  clearRecentFolders: () => void;
}

// 创建并导出最近文件夹状态管理 store
export const useRecentFoldersStore = create<RecentFoldersState>()(
  // 使用 persist 中间件实现状态持久化
  persist(
    (set) => ({
      // 初始化最近文件夹为空数组
      recentFolders: [],
      
      // 添加最近文件夹的实现
      addRecentFolder: (path: string) => set((state) => {
        // 创建新的最近文件夹列表
        const newRecentFolders = [
          // 将新路径添加到数组开头
          path,
          // 过滤掉重复的路径
          ...state.recentFolders.filter((p) => p !== path)
        // 限制最大数量
        ].slice(0, MAX_RECENT_FOLDERS);
        
        // 更新状态
        return { recentFolders: newRecentFolders };
      }),

      // 移除特定最近文件夹的实现
      removeRecentFolder: (path: string) => set((state) => ({
        // 过滤掉指定路径
        recentFolders: state.recentFolders.filter((p) => p !== path)
      })),

      // 清空所有最近文件夹的实现
      clearRecentFolders: () => set({ recentFolders: [] })
    }),
    {
      // 配置本地存储的键名
      name: 'recent-folders-storage'
    }
  )
); 