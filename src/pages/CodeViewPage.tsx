import React from "react";
import TabsBar, { Tab, TabType } from "@/components/codeview/TabsBar";
import { useFileStore } from "@/store/useFileStore";
import { useSplitStore } from "@/store/useSplitStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import path from "@/utils/path";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { TabContent } from "@/components/codeview/preview/TabContent";

export default function CodeViewPage() {
  const {
    openedFiles,
    activeFile,
    setActiveFile,
    closeFile,
    currentFolderPath,
  } = useFileStore();
  const { isSplit, splitSizes, setSplitSizes } = useSplitStore();
  const { initializeDataFile } = usePluginExecutionStore();

  const [activePluginFileId, setActivePluginFileId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (currentFolderPath) {
      initializeDataFile(currentFolderPath);
    }
  }, [currentFolderPath]);

  // 先找到代码类型的标签ID
  const codeTabId = openedFiles.find(filePath => filePath && !filePath.startsWith("plugin_result:")) || null;

  // 然后再生成tabs数组
  const tabs: Tab[] = openedFiles.filter(Boolean).map(filePath => {
    if (!filePath) return null;

    const isActive = isSplit 
      ? (filePath === activeFile && filePath === codeTabId) || filePath === activePluginFileId
      : filePath === activeFile;

    if (filePath.startsWith("plugin_result:")) {
      const parts = filePath.split("plugin_result:", 2);
      const pluginName = parts[1].split(":", 1)[0];
      const originalPath = parts[1].substring(pluginName.length + 1);

      return {
        id: filePath,
        title: path.basename(originalPath || '') || '未知文件',
        type: 'plugin_markdown' as TabType,
        isActive,
        originalPath,
        pluginName
      };
    } else {
      return {
        id: filePath,
        title: path.basename(filePath || '') || '未知文件',
        type: 'code' as TabType,
        isActive
      };
    }
  }).filter(Boolean) as Tab[];

  const handleTabClick = (tabId: string) => {
    const clickedTab = tabs.find(tab => tab.id === tabId);
    if (isSplit && clickedTab && clickedTab.type === 'plugin_markdown') {
      setActivePluginFileId(tabId);
    } else {
      setActiveFile(tabId);
    }
  };

  const activePluginTabId = isSplit ? (activePluginFileId || tabs.find(tab => tab.type === 'plugin_markdown')?.id || null) : activeFile;

  return (
    <div className="flex h-full flex-col min-h-0">
      <TabsBar
        tabs={tabs}
        onTabClick={handleTabClick}
        onTabClose={closeFile}
      />
      <div className="flex-1 min-h-0 bg-background">
        {isSplit ? (
          <ResizablePanelGroup
            direction="horizontal"
            onLayout={(sizes) => setSplitSizes(sizes)}
            className="h-full"
          >
            <ResizablePanel defaultSize={splitSizes[0]} minSize={20}>
              <div className="h-full">
                <TabContent
                  fileId={codeTabId}
                  tabs={tabs}
                  currentFolderPath={currentFolderPath}
                />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={splitSizes[1]} minSize={20}>
              <div className="h-full">
                <TabContent
                  fileId={activePluginTabId}
                  tabs={tabs}
                  currentFolderPath={currentFolderPath}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full">
            <TabContent
              fileId={activeFile}
              tabs={tabs}
              currentFolderPath={currentFolderPath}
            />
          </div>
        )}
      </div>
    </div>
  );
}
