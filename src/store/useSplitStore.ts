import { create } from 'zustand';

interface SplitState {
  // 分屏状态
  isSplit: boolean;
  // 分屏中右侧显示的文件ID
  rightPaneFileId: string | null;
  // 分屏比例
  splitSizes: number[];
  // 操作方法
  setSplit: (isSplit: boolean) => void;
  setRightPaneFile: (fileId: string | null) => void;
  setSplitSizes: (sizes: number[]) => void;
}

export const useSplitStore = create<SplitState>((set) => ({
  isSplit: false,
  rightPaneFileId: null,
  splitSizes: [50, 50],
  setSplit: (isSplit) => set({ isSplit }),
  setRightPaneFile: (fileId) => set({ rightPaneFileId: fileId }),
  setSplitSizes: (sizes) => set({ splitSizes: sizes }),
})); 