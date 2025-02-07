import { ipcMain, app } from "electron";
import path from "path";
import fs from "fs/promises";
import { STORE_GET_CHANNEL, STORE_SET_CHANNEL, STORE_DELETE_CHANNEL } from "./store-channels";

// 获取存储文件路径
function getStorePath(storeName: string) {
  return path.join(app.getPath('userData'), `${storeName}.json`);
}

// 确保存储文件存在
async function ensureStoreFile(storePath: string) {
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, '{}', 'utf-8');
  }
}

// 读取存储文件
async function readStore(storePath: string) {
  await ensureStoreFile(storePath);
  const data = await fs.readFile(storePath, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// 写入存储文件
async function writeStore(storePath: string, data: any) {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function addStoreEventListeners() {
  ipcMain.handle(STORE_GET_CHANNEL, async (event, storeName: string, key: string) => {
    const storePath = getStorePath(storeName);
    const store = await readStore(storePath);
    return store[key];
  });

  ipcMain.handle(STORE_SET_CHANNEL, async (event, storeName: string, key: string, value: any) => {
    const storePath = getStorePath(storeName);
    const store = await readStore(storePath);
    store[key] = value;
    await writeStore(storePath, store);
  });

  ipcMain.handle(STORE_DELETE_CHANNEL, async (event, storeName: string, key: string) => {
    const storePath = getStorePath(storeName);
    const store = await readStore(storePath);
    delete store[key];
    await writeStore(storePath, store);
  });
} 