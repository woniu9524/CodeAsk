import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderOpenDot, Search, Puzzle, Bot, Locate, Sparkles, Brain } from "lucide-react";
import FileTree, { FileNode } from './side/FileTree';
import { useFileStore } from '@/store/useFileStore';
import PluginList from './side/plugin/PluginList';
import ModelList from './side/model/ModelList';
import { useTranslation } from 'react-i18next';
import SearchPanel from './side/search/SearchPanel';
import path from '@/utils/path';
import GlobalAnalysisList from './side/global/GlobalAnalysisList';
import { usePluginStore } from '@/store/usePluginStore';
import { usePluginExecutionStore } from '@/store/usePluginExecutionStore';
import { useNavigate } from "@tanstack/react-router";

// 定义侧边栏组件的属性类型
type SidebarProps = {
  className?: string;  // 可选的CSS类名
}

// 定义侧边栏标签页类型
type TabType = 'explorer' | 'search' | 'plugin' | 'model' | 'global';

// 隐藏滚动条的样式配置
const hideScrollbarStyle = {
  'msOverflowStyle': 'none',  // 针对IE和Edge的隐藏滚动条样式
  'scrollbarWidth': 'none'    // 针对Firefox的隐藏滚动条样式
} as const;

export default function Sidebar({ className = "" }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('explorer');
  const { fileTree, activeFile, currentFolderPath, openFile, setActiveFile, closeFile, openedFiles } = useFileStore();
  const { plugins } = usePluginStore();
  const { getPluginExecution } = usePluginExecutionStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'explorer') {
      navigate({ to: '/code-view' });
    }
  };

  const handleFileClick = async (file: FileNode) => {
    if (file.type === 'file') {
      // 关闭之前的所有标签
      openedFiles.forEach(file => closeFile(file));

      // 打开代码预览标签
      await openFile(file.id);
      setActiveFile(file.id);

      // 遍历启用的插件，查找匹配的结果
      const enabledPlugins = plugins.filter(p => p.enabled);

      for (const plugin of enabledPlugins) {
        const execution = getPluginExecution(plugin.id);
        if (execution) {
          // 计算相对路径
          const relativePath = currentFolderPath ? path.relative(currentFolderPath, file.id) : file.id;

          // 查找匹配的文件结果
          const matchedFile = execution.files.find(f => f.filename === relativePath);
          if (matchedFile) {
            // 为插件结果创建新标签
            const resultTabId = `plugin_result:${plugin.name}:${file.id}`;
            await openFile(resultTabId);
            break; // 只打开第一个匹配的插件标签
          }
        }
      }
    }
  };

  const handleSearchResultClick = async (result: { type: 'code' | 'plugin', path: string, pluginName?: string }) => {
    // 关闭之前的所有标签
    openedFiles.forEach(file => closeFile(file));

    if (result.type === 'code') {
      await openFile(result.path);
      setActiveFile(result.path);

      // 遍历启用的插件，查找匹配的结果
      const enabledPlugins = plugins.filter(p => p.enabled);

      for (const plugin of enabledPlugins) {
        const execution = getPluginExecution(plugin.id);
        if (execution) {
          // 计算相对路径
          const relativePath = currentFolderPath ? path.relative(currentFolderPath, result.path) : result.path;

          // 查找匹配的文件结果
          const matchedFile = execution.files.find(f => f.filename === relativePath);
          if (matchedFile) {
            // 为插件结果创建新标签
            const resultTabId = `plugin_result:${plugin.name}:${result.path}`;
            await openFile(resultTabId);
            break; // 只打开第一个匹配的插件标签
          }
        }
      }
    } else if (result.type === 'plugin' && result.pluginName) {
      const absolutePath = currentFolderPath ? path.join(currentFolderPath, result.path) : result.path;
      const pluginResultId = `plugin_result:${result.pluginName}:${absolutePath}`;
      await openFile(pluginResultId);
      setActiveFile(pluginResultId);
      await openFile(absolutePath);
    }
  };

  // 定位活跃文件的方法
  const locateActiveFile = (expandCallback: (file: string) => void) => {
    if (activeFile) {
      const actualPath = activeFile.startsWith('plugin_result:')
        ? activeFile.split(':').slice(2).join(':')
        : activeFile;
      expandCallback(actualPath);
    }
  };

  return (
    <div className={`flex h-full min-h-0 ${className}`}>
      {/* 侧边按钮栏 - 用于切换不同的标签页 */}
      <div className="flex w-12 flex-shrink-0 flex-col items-center border-r bg-background pt-2 min-h-0">
        <Button
          variant={activeTab === 'explorer' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => handleTabChange('explorer')}
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
          variant={activeTab === 'global' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('global')}
          title={t('codeview.sidebar.globalAnalysis')}
        >
          <Brain className="h-5 w-5" />
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

      {/* 内容区域 - 根据当前活跃标签页显示不同的内容 */}
      <div className="flex-1 border-r bg-background p-2 overflow-auto min-h-0" style={hideScrollbarStyle}>
        {activeTab === 'explorer' && (
          <div className="h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 px-2 flex-shrink-0">
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
            <div className="flex-1 min-h-0">
              <FileTree
                data={fileTree}
                onFileClick={handleFileClick}
                activeFile={activeFile}
              />
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">{t('codeview.sidebar.search')}</h2>
            <SearchPanel onResultClick={handleSearchResultClick} />
          </div>
        )}

        {activeTab === 'plugin' && <PluginList />}
        {activeTab === 'model' && <ModelList />}
        {activeTab === 'global' && <GlobalAnalysisList />}
      </div>
    </div>
  );
}
