import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "electron-shadcn",
        titleSecondPage: "Second Page",
        menu: {
          file: {
            title: "File",
            openFile: "Open File",
            openFolder: "Open Folder",
            openRecent: "Open Recent",
            noRecentFolders: "No Recent Folders",
            exit: "Exit"
          },
          settings: {
            title: "Settings",
          },
          help: {
            title: "Help",
            documentation: "Documentation",
            about: "About"
          }
        }
      },
    },
    zh: {
      translation: {
        appName: "electron-shadcn",
        titleSecondPage: "第二页",
        menu: {
          file: {
            title: "文件",
            openFile: "打开文件",
            openFolder: "打开文件夹",
            openRecent: "打开最近",
            noRecentFolders: "没有最近的文件夹",
            exit: "退出"
          },
          settings: {
            title: "设置",
          },
          help: {
            title: "帮助",
            documentation: "文档",
            about: "关于"
          }
        }
      },
    },
  },
});
