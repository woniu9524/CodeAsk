import React from 'react';
import { X, Split } from 'lucide-react';
import { cn } from '@/utils/tailwind';
import { getFileIcon } from './side/FileTree';
import { useSplitStore } from '@/store/useSplitStore';
import { useTranslation } from 'react-i18next';

export type TabType = 'code' | 'plugin_markdown';

export interface Tab {
  id: string;
  title: string;
  type: TabType;
  isActive: boolean;
  originalPath?: string;  // 对于plugin_markdown类型，存储原始文件路径
  pluginName?: string;    // 对于plugin_markdown类型，存储插件名称
}

type TabsBarProps = {
  tabs: Tab[];
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
};

export default function TabsBar({ tabs, onTabClick, onTabClose }: TabsBarProps) {
  const { isSplit, setSplit, setRightPaneFile } = useSplitStore();
  const { t } = useTranslation();

  if (tabs.length === 0) {
    return null;
  }

  const handleSplitClick = (tab: Tab) => {
    if (isSplit) {
      setSplit(false);
      setRightPaneFile(null);
    } else {
      setSplit(true);
      setRightPaneFile(tab.id);
    }
  };

  return (
    <div className="flex h-9 items-center border-b bg-background px-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group relative flex h-8 items-center border-r px-4 text-sm",
            "cursor-pointer hover:bg-accent/50",
            tab.isActive && "bg-accent",
            tab.type === 'plugin_markdown' && "italic"
          )}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="mr-2">{getFileIcon(tab.originalPath || tab.title)}</span>
          <span className="truncate max-w-[120px]">
            {tab.type === 'plugin_markdown' && tab.pluginName ? 
              `${tab.pluginName} - ${tab.title}` : 
              tab.title
            }
          </span>
          <div className="ml-2 flex items-center opacity-0 group-hover:opacity-100">
            <button
              className="rounded-sm hover:bg-accent mr-1"
              onClick={(e) => {
                e.stopPropagation();
                handleSplitClick(tab);
              }}
              title={isSplit ? t('codeview.tabs.cancelSplit') : t('codeview.tabs.splitScreen')}
            >
              <Split className="h-4 w-4" />
            </button>
            <button
              className="rounded-sm hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
