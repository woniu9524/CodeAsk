import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderTree, Search, Puzzle, Settings } from "lucide-react";
import FileTree, { FileNode } from './side/FileTree';
import { useFileStore } from '@/store/useFileStore';
import PluginList from './side/plugin/PluginList';
import ModelList from './side/model/ModelList';

type SidebarProps = {
  className?: string;
  onFileClick?: (filePath: string) => void;
}

type TabType = 'explorer' | 'search' | 'plugin' | 'model';

export default function Sidebar({ className = "", onFileClick }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('explorer');
  const { fileTree, openFile } = useFileStore();

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      onFileClick?.(file.id);
    }
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* 侧边按钮栏 */}
      <div className="flex w-12 flex-col items-center border-r bg-background pt-2">
        <Button
          variant={activeTab === 'explorer' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('explorer')}
        >
          <FolderTree className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'plugin' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('plugin')}
        >
          <Puzzle className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'model' ? 'secondary' : 'ghost'}
          size="icon"
          className="mb-1"
          onClick={() => setActiveTab('model')}
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          variant={activeTab === 'search' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('search')}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="w-60 border-r bg-background p-2">
        {activeTab === 'explorer' && (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">资源管理器</h2>
            <FileTree data={fileTree} onFileClick={handleFileClick} />
          </div>
        )}
        {activeTab === 'search' && (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">搜索</h2>
            {/* TODO: 添加搜索组件 */}
          </div>
        )}
        {activeTab === 'plugin' && <PluginList />}
        {activeTab === 'model' && <ModelList />}
      </div>
    </div>
  );
}
