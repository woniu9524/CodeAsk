import { dialog, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import type { FileNode } from "@/components/codeview/side/FileTree";
import { FOLDER_READ_CHANNEL, FOLDER_SELECT_CHANNEL } from "./folder-channels";

// 递归读取指定目录的文件和子目录
function readDirectory(dir: string): FileNode[] {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  return items.map(item => {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      return {
        id: fullPath,
        name: item.name,
        type: "directory",
        children: readDirectory(fullPath)
      } as FileNode;
    } else {
      return {
        id: fullPath,
        name: item.name,
        type: "file"
      } as FileNode;
    }
  });
}

export function addFolderEventListeners() {
  // 处理选择文件夹的请求
  ipcMain.handle(FOLDER_SELECT_CHANNEL, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // 处理读取文件夹结构的请求
  ipcMain.handle(FOLDER_READ_CHANNEL, async (event, folderPath: string) => {
    try {
      const tree = readDirectory(folderPath);
      return tree;
    } catch (error) {
      console.error("读取文件夹失败", error);
      throw error;
    }
  });
}
