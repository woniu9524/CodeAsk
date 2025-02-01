import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FolderTree, Search } from "lucide-react";
import FileTree, { FileNode } from './FileTree';

type SidebarProps = {
  className?: string;
}

// 示例数据
const sampleData: FileNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'directory',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'directory',
        children: [
          { id: '3', name: 'FileTree.tsx', type: 'file' },
          { id: '4', name: 'Sidebar.tsx', type: 'file' }
        ]
      },
      { id: '5', name: 'App.tsx', type: 'file' }
    ]
  },
  {
    id: '6',
    name: 'public',
    type: 'directory',
    children: [
      { id: '7', name: 'index.html', type: 'file' }
    ]
  }
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'search'>('explorer');

  const handleFileClick = (file: FileNode) => {
    console.log('File clicked:', file);
    // TODO: 实现文件打开逻辑
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
            <FileTree data={sampleData} onFileClick={handleFileClick} />
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