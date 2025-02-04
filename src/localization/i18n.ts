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
        },
        codeview: {
          sidebar: {
            explorer: "Explorer",
            search: "Search",
            plugin: "Plugin",
            model: "Model"
          },
          tabs: {
            splitScreen: "Split Screen",
            cancelSplit: "Cancel Split"
          },
          model: {
            title: "Model List",
            add: "Add Model",
            edit: "Edit Model",
            name: "Model Name",
            apiKey: "API Key",
            baseUrl: "Base URL",
            temperature: "Temperature",
            maxContextTokens: "Max Context Tokens",
            maxOutputTokens: "Max Output Tokens",
            concurrency: "Concurrency",
            save: "Save"
          },
          plugin: {
            title: "Plugin List",
            add: "Add Plugin",
            edit: "Edit Plugin",
            name: "Plugin Name",
            model: "Model",
            selectModel: "Select Model",
            unknownModel: "Unknown Model",
            systemPrompt: "System Prompt",
            userPrompt: "User Prompt",
            save: "Save",
            execute: {
              title: "Execute Plugin:",
              filterRules: "Filter Rules",
              fileExtensions: "File Extensions (comma separated)",
              fileExtensionsPlaceholder: "e.g. .ts,.tsx,.js",
              displayMode: "Display Mode",
              displayModeAll: "Show All",
              displayModeUnprocessed: "Hide Processed",
              displayModeUnprocessedAndUpdated: "Show Unprocessed and Updated",
              fileSelection: "File Selection",
              processing: "Processing...",
              execute: "Execute",
              modelNotFound: "Model not found",
              pluginNotFound: "Plugin not found",
              unknownError: "Unknown error"
            }
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
        },
        codeview: {
          sidebar: {
            explorer: "资源管理器",
            search: "搜索",
            plugin: "插件",
            model: "模型"
          },
          tabs: {
            splitScreen: "分屏显示",
            cancelSplit: "取消分屏"
          },
          model: {
            title: "模型列表",
            add: "添加模型",
            edit: "编辑模型",
            name: "模型名称",
            apiKey: "API Key",
            baseUrl: "Base URL",
            temperature: "温度",
            maxContextTokens: "最大上下文Token数",
            maxOutputTokens: "最大输出Token数",
            concurrency: "并发数",
            save: "保存"
          },
          plugin: {
            title: "插件列表",
            add: "添加插件",
            edit: "编辑插件",
            name: "插件名称",
            model: "使用模型",
            selectModel: "选择模型",
            unknownModel: "未知模型",
            systemPrompt: "系统提示词",
            userPrompt: "用户提示词",
            save: "保存",
            execute: {
              title: "执行插件：",
              filterRules: "过滤规则",
              fileExtensions: "文件扩展名（用逗号分隔）",
              fileExtensionsPlaceholder: "例如：.ts,.tsx,.js",
              displayMode: "文件显示模式",
              displayModeAll: "全部显示",
              displayModeUnprocessed: "隐藏已处理",
              displayModeUnprocessedAndUpdated: "显示未处理及需更新",
              fileSelection: "文件选择",
              processing: "处理中...",
              execute: "执行",
              modelNotFound: "模型未找到",
              pluginNotFound: "插件未找到",
              unknownError: "未知错误"
            }
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
        },
        codeview: {
          sidebar: {
            explorer: "エクスプローラー",
            search: "検索",
            plugin: "プラグイン",
            model: "モデル"
          },
          tabs: {
            splitScreen: "分割画面表示",
            cancelSplit: "分割解除"
          },
          model: {
            title: "モデル一覧",
            add: "モデルを追加",
            edit: "モデルを編集",
            name: "モデル名",
            apiKey: "API Key",
            baseUrl: "Base URL",
            temperature: "温度",
            maxContextTokens: "最大コンテキストトークン数",
            maxOutputTokens: "最大出力トークン数",
            concurrency: "同時実行数",
            save: "保存"
          },
          plugin: {
            title: "プラグイン一覧",
            add: "プラグインを追加",
            edit: "プラグインを編集",
            name: "プラグイン名",
            model: "使用モデル",
            selectModel: "モデルを選択",
            unknownModel: "不明なモデル",
            systemPrompt: "システムプロンプト",
            userPrompt: "ユーザープロンプト",
            save: "保存",
            execute: {
              title: "プラグインを実行：",
              filterRules: "フィルタールール",
              fileExtensions: "ファイル拡張子（カンマ区切り）",
              fileExtensionsPlaceholder: "例：.ts,.tsx,.js",
              displayMode: "表示モード",
              displayModeAll: "すべて表示",
              displayModeUnprocessed: "処理済みを非表示",
              displayModeUnprocessedAndUpdated: "未処理と更新が必要なファイルを表示",
              fileSelection: "ファイル選択",
              processing: "処理中...",
              execute: "実行",
              modelNotFound: "モデルが見つかりません",
              pluginNotFound: "プラグインが見つかりません",
              unknownError: "不明なエラー"
            }
          }
        }
      },
    },
  },
});
