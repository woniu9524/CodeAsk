import { exposeFileContext } from "./file/file-context";
import { exposeFolderContext } from "./folder/folder-context";
import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeStoreContext } from "./store/store-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeFolderContext();
  exposeFileContext();
  exposeStoreContext();
}
