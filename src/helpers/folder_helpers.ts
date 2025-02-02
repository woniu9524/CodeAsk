import type { FileNode } from "@/components/codeview/FileTree";

/**
 * 异步读取指定文件夹的文件结构
 * @param folderPath 文件夹路径
 * @returns 文件夹下的文件以及子目录的树形结构
 */
export async function readFolder(folderPath: string): Promise<FileNode[]> {
  // 利用暴露在 window 对象上的 folderAPI 调用 IPC 方法
  // @ts-ignore
  return await window.folderAPI.readFolder(folderPath);
}

export async function selectFolder(): Promise<string | null> {
  // @ts-ignore
  return await window.folderAPI.selectFolder();
}
