import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderOpenDot, Search, Puzzle, Bot, Locate, Sparkles } from "lucide-react";
import FileTree, { FileNode } from './side/FileTree';
import { useFileStore } from '@/store/useFileStore';
import PluginList from './side/plugin/PluginList';
import ModelList from './side/model/ModelList';
import { useTranslation } from 'react-i18next';
import { PromptTemplatesDialog } from './side/prompt/PromptTemplatesDialog';
import SearchPanel from './side/search/SearchPanel';
import path from '@/utils/path';

type SidebarProps = {
  className?: string;
  onFileClick?: (filePath: string) => void;
}

type TabType = 'explorer' | 'search' | 'plugin' | 'model';

const hideScrollbarStyle = {
  'msOverflowStyle': 'none',
  'scrollbarWidth': 'none'
} as const;

export default function Sidebar({ className = "", onFileClick }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('explorer');
  const { fileTree, activeFile, currentFolderPath } = useFileStore();
  const { t } = useTranslation();

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      onFileClick?.(file.id);
    }
  };

  const locateActiveFile = (expandCallback: (file: string) => void) => {
    if (activeFile) {
      // Extract actual file path if it's a plugin result
      const actualPath = activeFile.startsWith('plugin_result:')
        ? activeFile.split(':').slice(2).join(':') // Get everything after plugin name
        : activeFile;
      expandCallback(actualPath);
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
        <PromptTemplatesDialog>
          <Button
            variant="ghost"
            size="icon"
            className="mb-1"
            title={t('codeview.sidebar.promptTemplates')}
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        </PromptTemplatesDialog>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 border-r bg-background p-2 overflow-auto" style={hideScrollbarStyle}>
        {activeTab === 'explorer' && (
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-sm font-semibold">{t('codeview.sidebar.explorer')}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => locateActiveFile((file) => {
                    if (fileTree) {
                      const treeRef = document.querySelector('[data-tree-ref]');
                      treeRef?.dispatchEvent(new CustomEvent('locate-file', { detail: file }));
                    }
                  })}
                  title={t('codeview.sidebar.locate')}
                >
                  <Locate className="h-4 w-4" />
                </Button>
            </div>
            <FileTree
              data={fileTree}
              onFileClick={handleFileClick}
              activeFile={activeFile}
            />
          </div>
        )}
        {activeTab === 'search' && (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">{t('codeview.sidebar.search')}</h2>
            <SearchPanel onResultClick={(result) => {
              if (result.type === 'code') {
                onFileClick?.(result.path);
              } else if (result.type === 'plugin' && result.pluginName) {
                const absolutePath = currentFolderPath ? path.join(currentFolderPath, result.path) : result.path;
                const pluginResultId = `plugin_result:${result.pluginName}:${absolutePath}`;
                onFileClick?.(pluginResultId);
                onFileClick?.(absolutePath);
              }
            }} />
          </div>
        )}
        {activeTab === 'plugin' && <PluginList />}
        {activeTab === 'model' && <ModelList />}
      </div>
    </div>
  );
}
