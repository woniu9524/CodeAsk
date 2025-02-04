import {
  closeWindow,
  maximizeWindow,
  minimizeWindow,
} from "@/helpers/window_helpers";
import React, { type ReactNode } from "react";
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
} from "./ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { selectFolder } from "@/helpers/folder_helpers";
import path from "@/utils/path";

interface DragWindowRegionProps {
  title?: ReactNode;
}

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
  const { t } = useTranslation();
  const setCurrentFolder = useFileStore(state => state.setCurrentFolder);
  const { recentFolders, addRecentFolder } = useRecentFoldersStore();
  const navigate = useNavigate();

  const handleOpenFolder = async () => {
    try {
      const folderPath = await selectFolder();
      if (folderPath) {
        await setCurrentFolder(folderPath);
        addRecentFolder(folderPath);
        await navigate({ to: "/code-view" });
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  const handleOpenRecentFolder = async (folderPath: string) => {
    try {
      await setCurrentFolder(folderPath);
      addRecentFolder(folderPath);
      await navigate({ to: "/code-view" });
    } catch (error) {
      console.error('Failed to open recent folder:', error);
    }
  };

  return (
    <div className="flex w-screen items-stretch justify-between">
      <div className="flex w-full items-center">
        <div className="flex items-center gap-2 px-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 text-sm hover:bg-accent rounded-sm">
              {t('menu.file.title')}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{t('menu.file.openFile')}</DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenFolder}>{t('menu.file.openFolder')}</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t('menu.file.openRecent')}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
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

          <DropdownMenu>
            <DropdownMenuTrigger className="px-2 py-1 text-sm hover:bg-accent rounded-sm">
              {t('menu.help.title')}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>{t('menu.help.documentation')}</DropdownMenuItem>
              <DropdownMenuItem>{t('menu.help.about')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="draglayer flex-1 h-8"></div>
        <div className="flex items-center gap-2 px-2">
          <ToggleTheme />
          <LangToggle />
        </div>
      </div>
      <WindowButtons />
    </div>
  );
}

function WindowButtons() {
  return (
    <div className="flex">
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
