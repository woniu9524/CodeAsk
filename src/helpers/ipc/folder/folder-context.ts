export function exposeFolderContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("folderAPI", {
    // 提供一个 readFolder 方法，接收文件夹路径
    readFolder: (folderPath: string) => ipcRenderer.invoke("folder:read", folderPath)
  });
} 