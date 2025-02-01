import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            style={{ marginLeft: level * 16 }}
            className="flex items-center cursor-pointer py-1 px-2 text-sm hover:bg-accent/50"
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
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
            {node.type === 'directory' ? (
              <Folder className="mr-1 h-4 w-4" />
            ) : (
              <File className="mr-1 h-4 w-4" />
            )}
            <span>{node.name}</span>
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
    <div className="select-none">
      <FileTreeItem data={data} onFileClick={onFileClick} />
    </div>
  );
} 