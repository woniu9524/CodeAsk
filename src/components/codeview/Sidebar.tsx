import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderOpenDot, Search, Puzzle, Bot } from "lucide-react";
import FileTree, { FileNode } from './side/FileTree';
import { useFileStore } from '@/store/useFileStore';
import PluginList from './side/plugin/PluginList';
import ModelList from './side/model/ModelList';
import { useTranslation } from 'react-i18next';

type SidebarProps = {
  className?: string;
  onFileClick?: (filePath: string) => void;
}

type TabType = 'explorer' | 'search' | 'plugin' | 'model';

const hideScrollbarStyle = {
  '::-webkit-scrollbar': {
    display: 'none'
  },
  'msOverflowStyle': 'none',
  'scrollbarWidth': 'none'
} as const;

export default function Sidebar({ className = "", onFileClick }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('explorer');
  const { fileTree } = useFileStore();
  const { t } = useTranslation();

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      onFileClick?.(file.id);
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* 侧边按钮栏 */}
      <div className="flex w-12 flex-shrink-0 flex-col items-center border-r bg-background pt-2">
        <Button
          variant={activeTab === 'explorer' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('explorer')}
          title={t('codeview.sidebar.explorer')}
        >
          <FolderOpenDot className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'plugin' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('plugin')}
          title={t('codeview.sidebar.plugin')}
        >
          <Puzzle className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'model' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('model')}
          title={t('codeview.sidebar.model')}
        >
          <Bot className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'search' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('search')}
          title={t('codeview.sidebar.search')}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 border-r bg-background p-2 overflow-auto" style={hideScrollbarStyle}>
        {activeTab === 'explorer' && (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">{t('codeview.sidebar.explorer')}</h2>
              <FileTree data={fileTree} onFileClick={handleFileClick} />
          </div>
        )}
        {activeTab === 'search' && (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">{t('codeview.sidebar.search')}</h2>
              {/* TODO: 添加搜索组件 */}
          </div>
        )}
        {activeTab === 'plugin' && <PluginList />}
        {activeTab === 'model' && <ModelList />}
      </div>
    </div>
  );
}
