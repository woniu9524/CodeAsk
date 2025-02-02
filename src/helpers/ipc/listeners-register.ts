import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { addFolderEventListeners } from "./folder/folder-listeners";
import { addFileEventListeners } from "./file/file-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
  addWindowEventListeners(mainWindow);
  addThemeEventListeners();
  addFolderEventListeners();
  addFileEventListeners();
}
