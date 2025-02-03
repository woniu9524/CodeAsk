import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/codeview/Sidebar";
import TabsBar, { Tab, TabType } from "@/components/codeview/TabsBar";
import { useFileStore } from "@/store/useFileStore";
import { usePluginStore } from "@/store/usePluginStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import path from "@/utils/path";
import { readTextFile } from "@/helpers/file_helpers";
import CodeMirror from '@uiw/react-codemirror';

import { oneDark } from '@codemirror/theme-one-dark';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCurrentTheme } from "@/helpers/theme_helpers";
import { getLanguageExtension } from "@/utils/language";
import 'prismjs/themes/prism-tomorrow.css';
import Prism from 'prismjs';
import type { Components } from 'react-markdown';

// 代码预览组件
function CodePreview({ filePath }: { filePath: string }) {
  const [content, setContent] = React.useState<string>("");
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('dark');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const text = await readTextFile(filePath);
        setContent(text);
      } catch (error) {
        console.error("加载文件内容失败:", error);
        setContent("加载失败");
      }
    };
    loadContent();
  }, [filePath]);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { local } = await getCurrentTheme();
        setTheme(local || 'dark');
      } catch (error) {
        console.error("加载主题失败:", error);
      }
    };
    loadTheme();
  }, []);

  const ext = path.extname(filePath).slice(1).toLowerCase();
  
  return (
    <CodeMirror
      value={content}
      height="100%"
      theme={theme === 'dark' ? oneDark : undefined}
      extensions={[getLanguageExtension(ext)]}
      editable={false}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: false,
      }}
    />
  );
}


// Markdown预览组件
function MarkdownPreview({ content }: { content: string }) {
  useEffect(() => {
    // 在组件挂载和内容更新后重新应用代码高亮
    Prism.highlightAll();
  }, [content]);

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      return isInline ? (
        <code className={className} {...props}>
          {children}
        </code>
      ) : (
        <pre className={className}>
          <code
            className={className}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </code>
        </pre>
      );
    }
  };

  return (
    <div className="h-full p-4 overflow-auto bg-background prose prose-invert max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

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

  // 渲染标签页内容
  const renderTabContent = () => {
    if (!activeFile) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          {t('codeView.noOpenedFile')}
        </div>
      );
    }

    const activeTab = tabs.find(tab => tab.id === activeFile);
    if (!activeTab) return null;

    if (activeTab.type === 'code') {
      return <CodePreview filePath={activeFile} />;
    }

    if (activeTab.type === 'plugin_markdown') {
      const plugin = plugins.find(p => p.name === activeTab.pluginName);
      if (!plugin) return "插件未找到";

      const execution = getPluginExecution(plugin.id);
      if (!execution) return "未找到执行结果";

      const relativePath = currentFolderPath && activeTab.originalPath ?
        path.relative(currentFolderPath, activeTab.originalPath) :
        activeTab.originalPath || '';

      const matchedFile = execution.files.find(f => f.filename === relativePath);
      if (!matchedFile) return "未找到文件分析结果";

      return <MarkdownPreview content={matchedFile.result || "无结果"} />;
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
        <div className="flex-1 bg-background overflow-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
