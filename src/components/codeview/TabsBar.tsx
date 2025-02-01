import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/tailwind';
import { getFileIcon } from './FileTree';

export type Tab = {
  id: string;
  title: string;
  isActive: boolean;
};

type TabsBarProps = {
  tabs: Tab[];
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
};

export default function TabsBar({ tabs, onTabClick, onTabClose }: TabsBarProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex h-9 items-center border-b bg-background px-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group relative flex h-8 items-center border-r px-4 text-sm",
            "cursor-pointer hover:bg-accent/50",
            tab.isActive && "bg-accent"
          )}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="mr-2">{getFileIcon(tab.title)}</span>
          <span className="truncate max-w-[120px]">{tab.title}</span>
          <button
            className="ml-2 rounded-sm opacity-0 hover:bg-accent group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 