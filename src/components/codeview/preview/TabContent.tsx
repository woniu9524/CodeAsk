import React from 'react';
import { useTranslation } from "react-i18next";
import { usePluginStore } from "@/store/usePluginStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import path from "@/utils/path";
import { CodePreview } from './CodePreview';
import { MarkdownPreview } from './MarkdownPreview';

// TabContent 组件的属性类型定义
type TabContentProps = {
  // 当前选中的文件ID
  fileId: string | null;
  // 标签页数组，包含每个标签页的详细信息
  tabs: Array<{
    id: string;                   // 标签页唯一标识
    type: 'code' | 'plugin_markdown';  // 标签页类型（代码或插件生成的Markdown）
    originalPath?: string;        // 原始文件路径（可选）
    pluginName?: string;          // 插件名称（可选）
  }>;
  // 当前文件夹路径
  currentFolderPath: string | null;
}

// TabContent 组件：根据不同的标签页类型渲染不同的预览内容
export function TabContent({ fileId, tabs, currentFolderPath }: TabContentProps) {
  // 国际化翻译钩子
  const { t } = useTranslation();
  // 插件存储钩子，获取所有插件信息
  const { plugins } = usePluginStore();
  // 插件执行存储钩子，获取插件执行结果
  const { getPluginExecution } = usePluginExecutionStore();

  // 如果没有选中文件，显示提示信息
  if (!fileId) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {t('codeview.noOpenedFile')}
      </div>
    );
  }

  // 查找当前活动的标签页
  const activeTab = tabs.find(tab => tab.id === fileId);
  // 如果没有找到活动标签页，返回 null
  if (!activeTab) return null;

  // 处理插件生成的 Markdown 类型标签页
  if (activeTab.type === 'plugin_markdown') {
    // 根据插件名称查找对应的插件
    const plugin = plugins.find(p => p.name === activeTab.pluginName);
    // 如果插件不存在，显示错误信息
    if (!plugin) return <div>插件未找到</div>;

    // 获取插件的执行结果
    const execution = getPluginExecution(plugin.id);
    // 如果没有执行结果，显示错误信息
    if (!execution) return <div>未找到执行结果</div>;

    // 计算相对路径
    const relativePath = currentFolderPath && activeTab.originalPath ?
      path.relative(currentFolderPath, activeTab.originalPath) :
      activeTab.originalPath || '';

    // 在执行结果中查找匹配的文件
    const matchedFile = execution.files.find(f => f.filename === relativePath);
    // 如果没有找到匹配的文件，显示错误信息
    if (!matchedFile) return <div>未找到文件分析结果</div>;

    // 渲染插件生成的 Markdown 内容
    return (
      <div className="h-full overflow-auto">
        <MarkdownPreview content={matchedFile.result || "无结果"} />
      </div>
    );
  }

  // 处理代码类型的标签页，渲染代码预览
  return (
    <div className="h-full overflow-auto">
      <CodePreview filePath={fileId} />
    </div>
  );
}
