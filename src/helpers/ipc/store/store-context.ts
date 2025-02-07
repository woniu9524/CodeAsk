import { STORE_GET_CHANNEL, STORE_SET_CHANNEL, STORE_DELETE_CHANNEL } from "./store-channels";

export function exposeStoreContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("storeAPI", {
    get: (storeName: string, key: string) => 
      ipcRenderer.invoke(STORE_GET_CHANNEL, storeName, key),
    set: (storeName: string, key: string, value: any) => 
      ipcRenderer.invoke(STORE_SET_CHANNEL, storeName, key, value),
    delete: (storeName: string, key: string) => 
      ipcRenderer.invoke(STORE_DELETE_CHANNEL, storeName, key),
  });
} 