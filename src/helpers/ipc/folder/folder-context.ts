import { FOLDER_READ_CHANNEL, FOLDER_SELECT_CHANNEL } from "./folder-channels";

export function exposeFolderContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("folderAPI", {
    // 提供一个 readFolder 方法，接收文件夹路径
    readFolder: (folderPath: string) => ipcRenderer.invoke(FOLDER_READ_CHANNEL, folderPath),
    // 提供一个 selectFolder 方法，用于打开文件夹选择对话框
    selectFolder: () => ipcRenderer.invoke(FOLDER_SELECT_CHANNEL)
  });
} 