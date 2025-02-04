import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "CodeAsk",
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
        appName: "CodeAsk",
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
    ja: {
      translation: {
        appName: "CodeAsk",
        titleSecondPage: "セカンドページ",
        menu: {
          file: {
            title: "ファイル",
            openFile: "ファイルを開く",
            openFolder: "フォルダを開く",
            openRecent: "最近使用したファイル",
            noRecentFolders: "最近使用したフォルダはありません",
            exit: "終了"
          },
          settings: {
            title: "設定",
          },
          help: {
            title: "ヘルプ",
            documentation: "ドキュメント",
            about: "バージョン情報"
          }
        }
      },
    },
  },
});
