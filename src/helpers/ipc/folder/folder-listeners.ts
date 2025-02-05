import { dialog, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import ignore from "ignore";
import type { FileNode } from "@/components/codeview/side/FileTree";
import { FOLDER_READ_CHANNEL, FOLDER_SELECT_CHANNEL } from "./folder-channels";

// 读取并解析 .gitignore 文件
function getGitIgnore(rootDir: string) {
  const ig = ignore();
  const gitignorePath = path.join(rootDir, '.gitignore');
  
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    ig.add(gitignoreContent);
  }
  
  return ig;
}

// 递归读取指定目录的文件和子目录
function readDirectory(dir: string, ig?: ReturnType<typeof ignore>, rootDir?: string): FileNode[] {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const relativeDirPath = rootDir ? path.relative(rootDir, dir) : '';
  
  return items
    .map(item => {
      const fullPath = path.join(dir, item.name);
      const relativePath = rootDir 
        ? path.join(relativeDirPath, item.name).replace(/\\/g, '/')
        : item.name;

      // 忽略 .git 目录
      if (item.name === '.git') {
        return null;
      }

      // 如果有 .gitignore 规则，检查文件是否应该被忽略
      if (ig && ig.ignores(relativePath)) {
        return null;
      }

      if (item.isDirectory()) {
        const children = readDirectory(fullPath, ig, rootDir || dir);
        // 如果目录为空，则不包含在结果中
        if (children.length === 0) {
          return null;
        }
        return {
          id: fullPath,
          name: item.name,
          type: "directory",
          children
        } as FileNode;
      } else {
        return {
          id: fullPath,
          name: item.name,
          type: "file"
        } as FileNode;
      }
    })
    .filter((item): item is FileNode => item !== null);
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
      const ig = getGitIgnore(folderPath);
      const tree = readDirectory(folderPath, ig, folderPath);
      return tree;
    } catch (error) {
      console.error("读取文件夹失败", error);
      throw error;
    }
  });
}
