import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FileIcon, FolderIcon } from 'lucide-react';

export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
};

type FileTreeProps = {
  data: FileNode[];
  onFileClick?: (file: FileNode) => void;
};

type FileTreeItemProps = FileTreeProps & {
  level?: number;
};

export function getFileIcon(fileName: string) {
  // 使用原生 JavaScript 获取文件扩展名
  const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
  
  // 根据文件扩展名返回不同的图标颜色
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileIcon className="h-4 w-4 text-blue-500" />;
    case 'js':
    case 'jsx':
      return <FileIcon className="h-4 w-4 text-yellow-500" />;
    case 'json':
      return <FileIcon className="h-4 w-4 text-green-500" />;
    case 'md':
      return <FileIcon className="h-4 w-4 text-purple-500" />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileIcon className="h-4 w-4 text-pink-500" />;
    case 'html':
      return <FileIcon className="h-4 w-4 text-orange-500" />;
    default:
      return <FileIcon className="h-4 w-4 text-gray-500" />;
  }
}

function FileTreeItem({ data, level = 0, onFileClick }: FileTreeItemProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  return (
    <>
      {data.map((node) => (
        <div key={node.id}>
          <div
            style={{ paddingLeft: `${level * 16 + 4}px` }}
            className="flex items-center cursor-pointer py-1 px-2 text-sm hover:bg-accent/50 group"
            onClick={() => {
              if (node.type === 'directory') {
                toggleNode(node.id);
              } else {
                onFileClick?.(node);
              }
            }}
          >
            {node.type === 'directory' && (
              <span className="mr-1">
                {expandedNodes[node.id] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            )}
            {node.type === 'directory' ? (
              <FolderIcon className="mr-1 h-4 w-4 text-yellow-500" />
            ) : (
              getFileIcon(node.name)
            )}
            <span className="ml-1 truncate">{node.name}</span>
          </div>
          {node.type === 'directory' &&
            node.children &&
            expandedNodes[node.id] && (
              <FileTreeItem
                data={node.children}
                level={level + 1}
                onFileClick={onFileClick}
              />
          )}
        </div>
      ))}
    </>
  );
}

export default function FileTree({ data, onFileClick }: FileTreeProps) {
  return (
    <div className="select-none overflow-auto">
      <FileTreeItem data={data} onFileClick={onFileClick} />
    </div>
  );
} 