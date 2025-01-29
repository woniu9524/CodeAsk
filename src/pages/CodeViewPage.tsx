import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/codeview/Sidebar";
import TabsBar, { Tab } from "@/components/codeview/TabsBar";

export default function CodeViewPage() {
  const { t } = useTranslation();
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'example.tsx', active: true },
    { id: '2', title: 'index.ts', active: false },
  ]);

  const handleTabClick = (id: string) => {
    setTabs(tabs.map(tab => ({
      ...tab,
      active: tab.id === id
    })));
  };

  const handleTabClose = (id: string) => {
    setTabs(tabs.filter(tab => tab.id !== id));
  };

  return (
    <div className="flex h-full">
      {/* 左侧边栏 */}
      <Sidebar />
      
      {/* 右侧内容区 */}
      <div className="flex flex-1 flex-col">
        <TabsBar 
          tabs={tabs}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
        />
        <div className="flex-1 bg-background p-4">
          {/* 内容区域 */}
          {tabs.find(tab => tab.active)?.title || '没有打开的文件'}
        </div>
      </div>
    </div>
  );
}
