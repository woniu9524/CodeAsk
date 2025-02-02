import { FILE_READ_CHANNEL, FILE_WRITE_CHANNEL } from "./file-channels";

export function exposeFileContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("fileAPI", {
    readTextFile: (filePath: string) => ipcRenderer.invoke(FILE_READ_CHANNEL, filePath),
    writeTextFile: (filePath: string, content: string) => 
      ipcRenderer.invoke(FILE_WRITE_CHANNEL, filePath, content)
  });
} 