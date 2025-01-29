import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type Tab = {
  id: string;
  title: string;
  active: boolean;
};

type TabsBarProps = {
  tabs: Tab[];
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
};

export default function TabsBar({ tabs, onTabClick, onTabClose }: TabsBarProps) {
  return (
    <div className="flex h-10 items-center border-b bg-background px-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group relative mr-1 flex h-8 items-center border-t border-l border-r px-3 text-sm
            ${tab.active ? 'border-border bg-background' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="mr-2">{tab.title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
} 