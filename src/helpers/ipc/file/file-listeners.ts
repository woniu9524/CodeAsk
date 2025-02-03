import { ipcMain } from "electron";
import fs from "fs/promises";
import { FILE_READ_CHANNEL, FILE_WRITE_CHANNEL } from "./file-channels";

export function addFileEventListeners() {
  // 处理读取文件的请求
  ipcMain.handle(FILE_READ_CHANNEL, async (event, filePath: string) => {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`文件不存在: ${filePath}`);
      }
      throw error;
    }
  });

  // 处理写入文件的请求
  ipcMain.handle(FILE_WRITE_CHANNEL, async (event, filePath: string, content: string) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`写入文件失败: ${filePath}`);
    }
  });
} 
