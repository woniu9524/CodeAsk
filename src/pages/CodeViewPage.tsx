import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "@/components/codeview/Sidebar";
import TabsBar, { Tab, TabType } from "@/components/codeview/TabsBar";
import { useFileStore } from "@/store/useFileStore";
import { usePluginStore } from "@/store/usePluginStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import { useSplitStore } from "@/store/useSplitStore";
import path from "@/utils/path";
import { readTextFile } from "@/helpers/file_helpers";
import CodeMirror from '@uiw/react-codemirror';
import Split from 'react-split';
import './split.css';  // 添加分隔条样式

import { oneDark } from '@codemirror/theme-one-dark';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCurrentTheme } from "@/helpers/theme_helpers";
import { getLanguageExtension } from "@/utils/language";
import 'prismjs/themes/prism-tomorrow.css';
import Prism from 'prismjs';
import type { Components } from 'react-markdown';
import mermaid from 'mermaid';

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
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('dark');

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

    Prism.highlightAll();
    // 初始化 mermaid，使用当前主题
    mermaid.initialize({
      startOnLoad: true,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
    });
  }, [theme]);

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !match;

      // 处理 Mermaid 图表
      if (language === 'mermaid') {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        React.useEffect(() => {
          mermaid.contentLoaded();
        }, []);
        
        return (
          <div className="my-4">
            <div className="mermaid" id={id}>
              {String(children)}
            </div>
          </div>
        );
      }

      return isInline ? (
        <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      ) : (
        <pre className="!bg-muted p-4 rounded-lg my-4">
          <code
            className={className}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </code>
        </pre>
      );
    },
    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
    p: ({ children }) => <p className="my-4 leading-7">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-inside my-4 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-inside my-4 space-y-2">{children}</ol>,
    li: ({ children }) => <li className="ml-4">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic">{children}</blockquote>
    ),
    a: ({ children, href }) => (
      <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-border">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="px-4 py-2 bg-muted font-semibold">{children}</th>,
    td: ({ children }) => <td className="px-4 py-2 border-t border-border">{children}</td>,
  };

  return (
    <div className="h-full p-6 overflow-auto bg-background">
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-bold prose-a:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
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
  const { isSplit, rightPaneFileId, splitSizes, setSplitSizes } = useSplitStore();

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
  const renderTabContent = (fileId: string | null) => {
    if (!fileId) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          {t('codeView.noOpenedFile')}
        </div>
      );
    }

    const activeTab = tabs.find(tab => tab.id === fileId);
    if (!activeTab) return null;

    if (activeTab.type === 'code') {
      return <CodePreview filePath={fileId} />;
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
        <div className="flex-1 bg-background overflow-hidden">
          {isSplit ? (
            <Split
              sizes={splitSizes}
              minSize={200}
              expandToMin={false}
              gutterSize={10}
              gutterStyle={() => ({
                backgroundColor: 'var(--border)',
                cursor: 'col-resize'
              })}
              className="split-horizontal"
              onDragEnd={(sizes: number[]) => setSplitSizes(sizes)}
            >
              <div className="h-full overflow-auto">
                {renderTabContent(activeFile)}
              </div>
              <div className="h-full overflow-auto">
                {renderTabContent(rightPaneFileId)}
              </div>
            </Split>
          ) : (
            <div className="h-full overflow-auto">
              {renderTabContent(activeFile)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
