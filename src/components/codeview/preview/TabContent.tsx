import React from 'react';
import { useTranslation } from "react-i18next";
import { usePluginStore } from "@/store/usePluginStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import path from "@/utils/path";
import { CodePreview } from './CodePreview';
import { MarkdownPreview } from './MarkdownPreview';
import { Tab } from '../TabsBar';

interface TabContentProps {
  fileId: string | null;
  tabs: Tab[];
  currentFolderPath: string | null;
}

export function TabContent({ fileId, tabs, currentFolderPath }: TabContentProps) {
  const { t } = useTranslation();
  const { plugins } = usePluginStore();
  const { getPluginExecution } = usePluginExecutionStore();

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

  return null;
} 