import React, { useEffect } from "react";
import Sidebar from "@/components/codeview/Sidebar";
import TabsBar, { Tab, TabType } from "@/components/codeview/TabsBar";
import { useFileStore } from "@/store/useFileStore";
import { usePluginStore } from "@/store/usePluginStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import { useSplitStore } from "@/store/useSplitStore";
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
    openFile,
    setCurrentFolder
  } = useFileStore();
  const { plugins } = usePluginStore();
  const { getPluginExecution, initializeDataFile } = usePluginExecutionStore();
  const { isSplit, splitSizes, setSplitSizes } = useSplitStore();

  // 初始化当前文件夹路径
  useEffect(() => {
    if (!currentFolderPath && activeFile) {
      const folderPath = path.dirname(activeFile);
      setCurrentFolder(folderPath);
    }
  }, [currentFolderPath, activeFile]);

  // 初始化插件执行数据
  useEffect(() => {
    if (currentFolderPath) {
      initializeDataFile(currentFolderPath);
    }
  }, [currentFolderPath]);

  // 将文件路径转换为标签数据
  const tabs: Tab[] = openedFiles.filter(Boolean).map(filePath => {
    if (!filePath) return null;

    if (filePath.startsWith("plugin_result:")) {
      const parts = filePath.split("plugin_result:", 2);
      const pluginName = parts[1].split(":", 1)[0];
      const originalPath = parts[1].substring(pluginName.length + 1);

      return {
        id: filePath,
        title: path.basename(originalPath || '') || '未知文件',
        type: 'plugin_markdown' as TabType,
        isActive: filePath === activeFile,
        originalPath,
        pluginName
      };
    } else {
      return {
        id: filePath,
        title: path.basename(filePath || '') || '未知文件',
        type: 'code' as TabType,
        isActive: filePath === activeFile
      };
    }
  }).filter(Boolean) as Tab[];

  const codeTabId = tabs.find(tab => tab.type === 'code')?.id || null;
  const [activePluginFileId, setActivePluginFileId] = React.useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    const clickedTab = tabs.find(tab => tab.id === tabId);
    if (isSplit && clickedTab && clickedTab.type === 'plugin_markdown') {
      setActivePluginFileId(tabId);
    } else {
      setActiveFile(tabId);
    }
  };

  const activePluginTabId = isSplit ? (activePluginFileId || tabs.find(tab => tab.type === 'plugin_markdown')?.id || null) : activeFile;

  // 处理文件点击事件
  const handleFileClick = async (filePath: string) => {
    // 关闭之前的所有标签
    openedFiles.forEach(file => closeFile(file));

    // 打开代码预览标签
    openFile(filePath);
    // Delay setting active file to ensure openFile finishes updating state
    setTimeout(() => {
      setActiveFile(filePath);
    }, 0);

    // 遍历启用的插件，查找匹配的结果
    const enabledPlugins = plugins.filter(p => p.enabled);

    for (const plugin of enabledPlugins) {
      const execution = getPluginExecution(plugin.id);
      if (execution) {
        // 计算相对路径
        const relativePath = currentFolderPath ? path.relative(currentFolderPath, filePath) : filePath;

        // 查找匹配的文件结果
        const matchedFile = execution.files.find(f => f.filename === relativePath);
        if (matchedFile) {
          // 为插件结果创建新标签
          const resultTabId = `plugin_result:${plugin.name}:${filePath}`;
          openFile(resultTabId);
        }
      }
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
        <Sidebar onFileClick={handleFileClick} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="flex h-full flex-col">
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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
