import { create } from 'zustand';
import type { FileNode } from '@/components/codeview/side/FileTree';
import { readFolder } from '@/helpers/folder_helpers';

// 文件存储状态接口，定义了文件管理的数据结构和操作
interface FileStore {
  // 状态属性
  // 当前选中的文件夹路径
  currentFolderPath: string | null;
  // 文件树结构，用于展示文件夹和文件层级
  fileTree: FileNode[];
  // 已打开的文件路径列表
  openedFiles: string[];
  // 当前活动（选中）的文件路径
  activeFile: string | null;

  // 操作方法
  // 设置当前文件夹，并读取其内容
  setCurrentFolder: (path: string) => Promise<void>;
  // 打开指定文件
  openFile: (path: string) => void;
  // 关闭指定文件
  closeFile: (path: string) => void;
  // 设置当前活动文件
  setActiveFile: (path: string) => void;
}

// 使用 Zustand 创建文件状态管理 store
export const useFileStore = create<FileStore>((set) => ({
  // 初始状态
  // 初始时没有选中文件夹
  currentFolderPath: null,
  // 初始文件树为空
  fileTree: [],
  // 初始没有打开的文件
  openedFiles: [],
  // 初始没有活动文件
  activeFile: null,

  // 操作方法实现
  // 异步设置当前文件夹，读取文件夹内容并更新文件树
  setCurrentFolder: async (path: string) => {
    try {
      // 使用 readFolder 读取指定路径的文件夹内容
      const tree = await readFolder(path);
      
      // 更新 store 状态：设置当前文件夹路径和文件树
      set({
        currentFolderPath: path,
        fileTree: tree
      });
    } catch (error) {
      // 处理读取文件夹失败的情况
      console.error('读取文件夹失败:', error);
      throw error;
    }
  },

  // 打开文件，如果文件未在已打开列表中则添加，并设置为活动文件
  openFile: (path: string) => {
    set((state) => ({
      // 避免重复添加已打开的文件
      openedFiles: state.openedFiles.includes(path)
        ? state.openedFiles
        : [...state.openedFiles, path],
      // 设置当前打开的文件为活动文件
      activeFile: path
    }));
  },

  // 关闭指定文件
  closeFile: (path: string) => {
    set((state) => {
      // 从已打开文件列表中移除指定文件
      const newOpenedFiles = state.openedFiles.filter(f => f !== path);
      
      return {
        // 更新已打开文件列表
        openedFiles: newOpenedFiles,
        // 如果关闭的是当前活动文件，则：
        // 1. 如果还有其他已打开文件，设置最后一个打开的文件为活动文件
        // 2. 如果没有其他已打开文件，则活动文件设为 null
        activeFile: state.activeFile === path
          ? newOpenedFiles[newOpenedFiles.length - 1] || null
          : state.activeFile
      };
    });
  },

  // 设置当前活动文件
  setActiveFile: (path: string) => {
    set({ activeFile: path });
  }
}));
