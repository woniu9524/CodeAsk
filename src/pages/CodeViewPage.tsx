import React from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/codeview/Sidebar";
import TabsBar, { Tab } from "@/components/codeview/TabsBar";
import { useFileStore } from "@/store/useFileStore";
import path from "@/utils/path";

export default function CodeViewPage() {
  const { t } = useTranslation();
  const { openedFiles, activeFile, setActiveFile, closeFile } = useFileStore();
  
  // 将文件路径转换为标签数据
  const tabs: Tab[] = openedFiles.map(filePath => ({
    id: filePath,
    title: path.basename(filePath),
    isActive: filePath === activeFile
  }));

  return (
    <div className="flex h-full">
      {/* 左侧边栏 */}
      <Sidebar />
      
      {/* 右侧内容区 */}
      <div className="flex flex-1 flex-col">
        <TabsBar 
          tabs={tabs}
          onTabClick={setActiveFile}
          onTabClose={closeFile}
        />
        <div className="flex-1 bg-background p-4">
          {/* TODO: 添加代码编辑器组件 */}
          {activeFile ? (
            <div className="text-sm">
              {activeFile}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {t('codeView.noOpenedFile')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
