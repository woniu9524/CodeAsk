import { create } from 'zustand';
import type { FileNode } from '@/components/codeview/side/FileTree';
import { readFolder } from '@/helpers/folder_helpers';

interface FileStore {
  // 状态
  currentFolderPath: string | null;
  fileTree: FileNode[];
  openedFiles: string[];
  activeFile: string | null;

  // actions
  setCurrentFolder: (path: string) => Promise<void>;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
}

export const useFileStore = create<FileStore>((set) => ({
  // 初始状态
  currentFolderPath: null,
  fileTree: [],
  openedFiles: [],
  activeFile: null,

  // actions
  setCurrentFolder: async (path: string) => {
    try {
      const tree = await readFolder(path);
      set({
        currentFolderPath: path,
        fileTree: tree
      });
    } catch (error) {
      console.error('Failed to read folder:', error);
      throw error;
    }
  },

  openFile: (path: string) => {
    set((state) => ({
      openedFiles: state.openedFiles.includes(path)
        ? state.openedFiles
        : [...state.openedFiles, path],
      activeFile: path
    }));
  },

  closeFile: (path: string) => {
    set((state) => {
      const newOpenedFiles = state.openedFiles.filter(f => f !== path);
      return {
        openedFiles: newOpenedFiles,
        // 如果关闭的是当前活动文件，则设置最后一个打开的文件为活动文件
        activeFile: state.activeFile === path
          ? newOpenedFiles[newOpenedFiles.length - 1] || null
          : state.activeFile
      };
    });
  },

  setActiveFile: (path: string) => {
    set({ activeFile: path });
  }
}));
