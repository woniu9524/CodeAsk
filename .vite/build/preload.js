"use strict";
const FILE_READ_CHANNEL = "file:read";
const FILE_WRITE_CHANNEL = "file:write";
const FILE_HASH_CHANNEL = "file:hash";
function exposeFileContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("fileAPI", {
    readTextFile: (filePath) => ipcRenderer.invoke(FILE_READ_CHANNEL, filePath),
    writeTextFile: (filePath, content) => ipcRenderer.invoke(FILE_WRITE_CHANNEL, filePath, content),
    getFileHash: (filePath) => ipcRenderer.invoke(FILE_HASH_CHANNEL, filePath)
  });
}
const FOLDER_READ_CHANNEL = "folder:read";
const FOLDER_SELECT_CHANNEL = "folder:select";
function exposeFolderContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("folderAPI", {
    // 提供一个 readFolder 方法，接收文件夹路径
    readFolder: (folderPath) => ipcRenderer.invoke(FOLDER_READ_CHANNEL, folderPath),
    // 提供一个 selectFolder 方法，用于打开文件夹选择对话框
    selectFolder: () => ipcRenderer.invoke(FOLDER_SELECT_CHANNEL)
  });
}
const THEME_MODE_CURRENT_CHANNEL = "theme-mode:current";
const THEME_MODE_TOGGLE_CHANNEL = "theme-mode:toggle";
const THEME_MODE_DARK_CHANNEL = "theme-mode:dark";
const THEME_MODE_LIGHT_CHANNEL = "theme-mode:light";
const THEME_MODE_SYSTEM_CHANNEL = "theme-mode:system";
function exposeThemeContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("themeMode", {
    current: () => ipcRenderer.invoke(THEME_MODE_CURRENT_CHANNEL),
    toggle: () => ipcRenderer.invoke(THEME_MODE_TOGGLE_CHANNEL),
    dark: () => ipcRenderer.invoke(THEME_MODE_DARK_CHANNEL),
    light: () => ipcRenderer.invoke(THEME_MODE_LIGHT_CHANNEL),
    system: () => ipcRenderer.invoke(THEME_MODE_SYSTEM_CHANNEL)
  });
}
const WIN_MINIMIZE_CHANNEL = "window:minimize";
const WIN_MAXIMIZE_CHANNEL = "window:maximize";
const WIN_CLOSE_CHANNEL = "window:close";
const WIN_OPEN_EXTERNAL_CHANNEL = "window:open-external";
function exposeWindowContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("electronWindow", {
    minimize: () => ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
    maximize: () => ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
    close: () => ipcRenderer.invoke(WIN_CLOSE_CHANNEL),
    openExternal: (url) => ipcRenderer.invoke(WIN_OPEN_EXTERNAL_CHANNEL, url)
  });
}
const STORE_GET_CHANNEL = "store:get";
const STORE_SET_CHANNEL = "store:set";
const STORE_DELETE_CHANNEL = "store:delete";
function exposeStoreContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("storeAPI", {
    get: (storeName, key) => ipcRenderer.invoke(STORE_GET_CHANNEL, storeName, key),
    set: (storeName, key, value) => ipcRenderer.invoke(STORE_SET_CHANNEL, storeName, key, value),
    delete: (storeName, key) => ipcRenderer.invoke(STORE_DELETE_CHANNEL, storeName, key)
  });
}
function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeFolderContext();
  exposeFileContext();
  exposeStoreContext();
}
exposeContexts();
