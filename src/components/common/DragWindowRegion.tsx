import {
  closeWindow,
  maximizeWindow,
  minimizeWindow,
  openExternalUrl,
} from "@/helpers/window_helpers";
import React, { useState, useEffect } from "react";
import ToggleTheme from "./ToggleTheme";
import LangToggle from "./LangToggle";
import { useFileStore } from "@/store/useFileStore";
import { useRecentFoldersStore } from "@/store/useRecentFoldersStore";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { selectFolder } from "@/helpers/folder_helpers";
import path from "@/utils/path";
import UpdateCheckDialog from "./UpdateCheckDialog";
import { useUpdateCheck } from "@/hooks/useUpdateCheck";
import pkg from "../../../package.json";

// 主窗口拖拽区域和顶部菜单栏组件
export default function DragWindowRegion() {
  // 国际化翻译钩子
  const { t } = useTranslation();

  // 获取设置当前文件夹的方法
  const setCurrentFolder = useFileStore(state => state.setCurrentFolder);

  // 获取最近文件夹相关状态和方法
  const { recentFolders, addRecentFolder } = useRecentFoldersStore();

  // 路由导航钩子
  const navigate = useNavigate();

  // 控制更新弹窗显示的状态
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // 更新检查相关钩子
  const { isChecking, updateLogs, checkForUpdates } = useUpdateCheck();

  // 是否有新版本的状态
  const [hasNewVersion, setHasNewVersion] = useState(false);

  // 组件挂载时自动检查更新
  useEffect(() => {
    const checkUpdate = async () => {
      await checkForUpdates();
    };
    checkUpdate();
  }, []);

  // 监听更新日志，判断是否有新版本
  useEffect(() => {
    if (updateLogs.length > 0 && updateLogs[0].version !== pkg.version) {
      setHasNewVersion(true);
    }
  }, [updateLogs, pkg.version]);

  // 打开文件夹处理函数
  const handleOpenFolder = async () => {
    try {
      // 选择文件夹
      const folderPath = await selectFolder();
      if (folderPath) {
        // 设置当前文件夹
        await setCurrentFolder(folderPath);
        // 添加到最近文件夹
        addRecentFolder(folderPath);
        // 导航到代码视图页面
        await navigate({ to: "/code-view" });
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  // 打开最近文件夹处理函数
  const handleOpenRecentFolder = async (folderPath: string) => {
    try {
      // 设置当前文件夹
      await setCurrentFolder(folderPath);
      // 添加到最近文件夹
      addRecentFolder(folderPath);
      // 导航到代码视图页面
      await navigate({ to: "/code-view" });
    } catch (error) {
      console.error('Failed to open recent folder:', error);
    }
  };

  // 打开 GitHub 仓库
  const handleOpenGitHub = async () => {
    try {
      await openExternalUrl('https://github.com/woniu9524/CodeAsk');
    } catch (error) {
      console.error('Failed to open GitHub:', error);
    }
  };

  // 手动检查更新
  const handleCheckForUpdates = async () => {
    await checkForUpdates();
    setShowUpdateDialog(true);
  };

  return (
    <div className="flex w-screen items-stretch justify-between">
      <div className="flex w-full items-center">
        {/* 文件菜单 */}
        <div className="flex items-center gap-2 px-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 text-sm hover:bg-accent rounded-sm">
              {t('menu.file.title')}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* 打开文件夹和最近文件夹菜单项 */}
              <DropdownMenuItem onClick={handleOpenFolder}>{t('menu.file.openFolder')}</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t('menu.file.openRecent')}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {/* 渲染最近文件夹列表 */}
                  {recentFolders.length > 0 ? (
                    recentFolders.map((folderPath) => (
                      <DropdownMenuItem
                        key={folderPath}
                        onClick={() => handleOpenRecentFolder(folderPath)}
                      >
                        {path.basename(folderPath)}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      {t('menu.file.noRecentFolders')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={closeWindow}>{t('menu.file.exit')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 帮助菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 text-sm hover:bg-accent rounded-sm">
              {t('menu.help.title')}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* 检查更新菜单项 */}
              <DropdownMenuItem onClick={handleCheckForUpdates} disabled={isChecking}>
                {isChecking ? t('menu.help.checkingUpdates') : t('menu.help.checkForUpdates')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleOpenGitHub}>{t('menu.help.documentation')}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenGitHub}>{t('menu.help.about')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 新版本提示按钮 */}
          {hasNewVersion && (
            <button
              onClick={handleCheckForUpdates}
              className="flex items-center gap-1 px-1.5 py-0.5 text-xs hover:bg-accent rounded-sm transition-colors"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {t('menu.help.newVersionAvailable')}
            </button>
          )}
        </div>

        {/* 可拖拽区域 */}
        <div className="draglayer flex-1 h-8"></div>

        {/* 右侧功能按钮 */}
        <div className="flex items-center gap-2 px-2">
          <ToggleTheme />
          <LangToggle />
          <button
            onClick={handleOpenGitHub}
            className="p-1.5 hover:bg-accent rounded-sm transition-colors"
            title="GitHub"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 窗口控制按钮 */}
      <WindowButtons />

      {/* 更新检查对话框 */}
      <UpdateCheckDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        currentVersion={pkg.version}
        updateLogs={updateLogs}
      />
    </div>
  );
}

// 窗口控制按钮组件
function WindowButtons() {
  return (
    <div className="flex">
      {/* 最小化按钮 */}
      <button
        title="Minimize"
        type="button"
        className="p-2 hover:bg-slate-300"
        onClick={minimizeWindow}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <rect fill="currentColor" width="10" height="1" x="1" y="6"></rect>
        </svg>
      </button>

      {/* 最大化按钮 */}
      <button
        title="Maximize"
        type="button"
        className="p-2 hover:bg-slate-300"
        onClick={maximizeWindow}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <rect
            width="9"
            height="9"
            x="1.5"
            y="1.5"
            fill="none"
            stroke="currentColor"
          ></rect>
        </svg>
      </button>

      {/* 关闭按钮 */}
      <button
        type="button"
        title="Close"
        className="p-2 hover:bg-red-300"
        onClick={closeWindow}
      >
        <svg
          aria-hidden="true"
          role="img"
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <polygon
            fill="currentColor"
            fillRule="evenodd"
            points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"
          ></polygon>
        </svg>
      </button>
    </div>
  );
}
