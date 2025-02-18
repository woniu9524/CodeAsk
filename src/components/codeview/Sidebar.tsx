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

// 定义侧边栏组件的属性类型
type SidebarProps = {
  className?: string;  // 可选的CSS类名
  onFileClick?: (filePath: string) => void;  // 可选的文件点击回调函数
}

// 定义侧边栏标签页类型
type TabType = 'explorer' | 'search' | 'plugin' | 'model';

// 隐藏滚动条的样式配置
const hideScrollbarStyle = {
  'msOverflowStyle': 'none',  // 针对IE和Edge的隐藏滚动条样式
  'scrollbarWidth': 'none'    // 针对Firefox的隐藏滚动条样式
} as const;

export default function Sidebar({ className = "", onFileClick }: SidebarProps) {
  // 使用状态管理当前活跃的标签页，默认为文件资源管理器
  const [activeTab, setActiveTab] = useState<TabType>('explorer');
  
  // 从文件存储中获取文件树、活跃文件和当前文件夹路径
  const { fileTree, activeFile, currentFolderPath } = useFileStore();
  
  // 使用国际化翻译钩子
  const { t } = useTranslation();

  // 处理文件点击事件的方法
  const handleFileClick = (file: FileNode) => {
    // 仅当点击的是文件类型时触发回调
    if (file.type === 'file') {
      onFileClick?.(file.id);
    }
  };

  // 定位活跃文件的方法
  const locateActiveFile = (expandCallback: (file: string) => void) => {
    if (activeFile) {
      // 处理插件结果文件路径的特殊情况
      const actualPath = activeFile.startsWith('plugin_result:')
        ? activeFile.split(':').slice(2).join(':') // 获取插件名之后的完整路径
        : activeFile;
      expandCallback(actualPath);
    }
  };

  return (
    <div className={`flex h-full min-h-0 ${className}`}>
      {/* 侧边按钮栏 - 用于切换不同的标签页 */}
      <div className="flex w-12 flex-shrink-0 flex-col items-center border-r bg-background pt-2 min-h-0">
        {/* 文件资源管理器按钮 */}
        <Button
          variant={activeTab === 'explorer' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('explorer')}
          title={t('codeview.sidebar.explorer')}
        >
          <FolderOpenDot className="h-5 w-5" />
        </Button>

        {/* 插件列表按钮 */}
        <Button
          variant={activeTab === 'plugin' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('plugin')}
          title={t('codeview.sidebar.plugin')}
        >
          <Puzzle className="h-5 w-5" />
        </Button>

        {/* 模型列表按钮 */}
        <Button
          variant={activeTab === 'model' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('model')}
          title={t('codeview.sidebar.model')}
        >
          <Bot className="h-5 w-5" />
        </Button>

        {/* 搜索面板按钮 */}
        <Button
          variant={activeTab === 'search' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('search')}
          title={t('codeview.sidebar.search')}
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* 提示模板对话框按钮 */}
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

      {/* 内容区域 - 根据当前活跃标签页显示不同的内容 */}
      <div className="flex-1 border-r bg-background p-2 overflow-auto min-h-0" style={hideScrollbarStyle}>
        {/* 文件资源管理器标签页 */}
        {activeTab === 'explorer' && (
          <div className="h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
              <h2 className="text-sm font-semibold">{t('codeview.sidebar.explorer')}</h2>
              {/* 定位活跃文件的按钮 */}
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
            <div className="flex-1 min-h-0">
              <FileTree
                data={fileTree}
                onFileClick={handleFileClick}
                activeFile={activeFile}
              />
            </div>
          </div>
        )}

        {/* 搜索标签页 */}
        {activeTab === 'search' && (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">{t('codeview.sidebar.search')}</h2>
            <SearchPanel onResultClick={(result) => {
              // 处理搜索结果点击事件，支持代码文件和插件结果
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

        {/* 插件列表标签页 */}
        {activeTab === 'plugin' && <PluginList />}

        {/* 模型列表标签页 */}
        {activeTab === 'model' && <ModelList />}
      </div>
    </div>
  );
}
