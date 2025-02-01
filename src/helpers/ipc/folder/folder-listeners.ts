import { dialog, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import type { FileNode } from "@/components/codeview/FileTree";

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

// 新增"folder:read" IPC 处理，用于读取指定路径的文件结构
ipcMain.handle("folder:read", async (event, folderPath: string) => {
  try {
    const tree = readDirectory(folderPath);
    return tree;
  } catch (error) {
    console.error("读取文件夹失败", error);
    throw error;
  }
}); 