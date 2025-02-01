import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderTree, Search } from "lucide-react";
import FileTree, { FileNode } from './FileTree';
import { useFileStore } from '@/store/useFileStore';

type SidebarProps = {
  className?: string;
}

export default function Sidebar({ className = "" }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'search'>('explorer');
  const { fileTree, openFile } = useFileStore();

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file') {
      openFile(file.id);
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
          variant={activeTab === 'search' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('search')}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* 内容区域 */}
      <div className="w-60 border-r bg-background p-2">
        {activeTab === 'explorer' ? (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">资源管理器</h2>
            <FileTree data={fileTree} onFileClick={handleFileClick} />
          </div>
        ) : (
          <div>
            <h2 className="mb-2 px-2 text-sm font-semibold">搜索</h2>
            {/* TODO: 添加搜索组件 */}
          </div>
        )}
      </div>
    </div>
  );
} 