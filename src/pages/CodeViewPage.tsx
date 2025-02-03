import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/codeview/Sidebar";
import TabsBar, { Tab } from "@/components/codeview/TabsBar";
import { useFileStore } from "@/store/useFileStore";
import { usePluginStore } from "@/store/usePluginStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import path from "@/utils/path";
import { readTextFile } from "@/helpers/file_helpers";

export default function CodeViewPage() {
  const { t } = useTranslation();
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
  
  // 初始化当前文件夹路径
  useEffect(() => {
    if (!currentFolderPath) {
      if (activeFile) {
        const folderPath = path.dirname(activeFile);
        setCurrentFolder(folderPath);
      }
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
    
    const isCodeTab = !filePath.includes("plugin_result:");
    if (isCodeTab) {
      return {
        id: filePath,
        title: path.basename(filePath || '') || '未知文件',
        isActive: filePath === activeFile
      };
    } else {
      const parts = filePath.split("plugin_result:", 2);
      const pluginName = parts[1].split(":", 1)[0];
      const originalPath = parts[1].substring(pluginName.length + 1);
      
      return {
        id: filePath,
        title: `${pluginName} - ${path.basename(originalPath || '') || '未知文件'}`,
        isActive: filePath === activeFile
      };
    }
  }).filter(Boolean) as Tab[];

  // 处理文件点击事件
  const handleFileClick = async (filePath: string) => {
    // 关闭之前的所有标签
    openedFiles.forEach(file => closeFile(file));
    
    // 打开代码预览标签
    openFile(filePath);
    
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
    <div className="flex h-full">
      {/* 左侧边栏 */}
      <Sidebar onFileClick={handleFileClick} />
      
      {/* 右侧内容区 */}
      <div className="flex flex-1 flex-col">
        <TabsBar 
          tabs={tabs}
          onTabClick={setActiveFile}
          onTabClose={closeFile}
        />
        <div className="flex-1 bg-background p-4 overflow-auto">
          {activeFile ? (
            <div className="text-sm font-mono whitespace-pre">
              {activeFile.startsWith("plugin_result:") ? (
                // 显示插件结果
                (() => {
                  const parts = activeFile.split("plugin_result:", 2);
                  const pluginName = parts[1].split(":", 1)[0];
                  const filePath = parts[1].substring(pluginName.length + 1);
                  
                  const relativePath = currentFolderPath ? path.relative(currentFolderPath, filePath) : filePath;
                  const plugin = plugins.find(p => p.name === pluginName);
                  if (!plugin) {
                    return "插件未找到";
                  }

                  const execution = getPluginExecution(plugin.id);
                  if (!execution) {
                    return "未找到执行结果";
                  }

                  const matchedFile = execution.files.find(f => f.filename === relativePath);
                  if (!matchedFile) {
                    return "未找到文件分析结果";
                  }

                  return matchedFile.result || "无结果";
                })()
              ) : (
                // 显示代码预览
                <CodePreview filePath={activeFile} />
              )}
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

// 代码预览组件
function CodePreview({ filePath }: { filePath: string }) {
  const [content, setContent] = React.useState<string>("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const text = await readTextFile(filePath);
        setContent(text);
      } catch (error) {
        console.error("Failed to load file content:", error);
        setContent("加载失败");
      }
    };
    loadContent();
  }, [filePath]);

  return content;
}
