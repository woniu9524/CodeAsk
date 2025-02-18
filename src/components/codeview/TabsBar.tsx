import React from 'react';
import { X, Split } from 'lucide-react';
import { cn } from '@/utils/tailwind';
import { getFileIcon } from './side/FileTree';
import { useSplitStore } from '@/store/useSplitStore';
import { useTranslation } from 'react-i18next';

// 定义标签类型：代码或插件Markdown
export type TabType = 'code' | 'plugin_markdown';

// 标签接口，描述每个标签的属性
export interface Tab {
  id: string;           // 唯一标识符
  title: string;        // 标签显示的标题
  type: TabType;        // 标签类型
  isActive: boolean;    // 是否为活动标签
  originalPath?: string;  // 对于插件Markdown类型，存储原始文件路径
  pluginName?: string;    // 对于插件Markdown类型，存储插件名称
}

// TabsBar组件的属性类型
type TabsBarProps = {
  tabs: Tab[];                     // 标签列表
  onTabClick: (id: string) => void;  // 点击标签时的回调函数
  onTabClose: (id: string) => void;  // 关闭标签时的回调函数
};

export default function TabsBar({ tabs, onTabClick, onTabClose }: TabsBarProps) {
  // 使用分屏状态管理 hook
  const { isSplit, setSplit, setRightPaneFile } = useSplitStore();
  
  // 国际化翻译 hook
  const { t } = useTranslation();

  // 如果没有标签，不渲染任何内容
  if (tabs.length === 0) {
    return null;
  }

  // 处理分屏按钮点击事件
  const handleSplitClick = (tab: Tab) => {
    if (isSplit) {
      // 如果已经是分屏状态，则取消分屏
      setSplit(false);
      setRightPaneFile(null);
    } else {
      // 如果不是分屏状态，则开启分屏并设置右侧窗格的文件
      setSplit(true);
      setRightPaneFile(tab.id);
    }
  };

  return (
    // 标签栏容器，支持水平滚动
    <div className="flex h-9 items-center border-b bg-background px-2 overflow-x-auto">
      {tabs.map((tab) => (
        // 单个标签项
        <div
          key={tab.id}
          className={cn(
            // 基础样式
            "group relative flex h-8 items-center border-r px-4 text-sm",
            // 交互样式
            "cursor-pointer hover:bg-accent/50 flex-shrink-0",
            // 活动标签样式
            tab.isActive && "bg-accent",
            // 插件Markdown标签样式
            tab.type === 'plugin_markdown' && "italic"
          )}
          onClick={() => onTabClick(tab.id)}
        >
          {/* 文件图标 */}
          <span className="mr-2">{getFileIcon(tab.originalPath || tab.title)}</span>
          
          {/* 标签标题，插件Markdown类型显示插件名称 */}
          <span className="truncate max-w-[160px]">
            {tab.type === 'plugin_markdown' && tab.pluginName ? 
              `${tab.pluginName} - ${tab.title}` : 
              tab.title
            }
          </span>
          
          {/* 悬停时显示的操作按钮 */}
          <div className="ml-2 flex items-center opacity-0 group-hover:opacity-100">
            {/* 分屏/取消分屏按钮 */}
            <button
              className="rounded-sm hover:bg-accent mr-1"
              onClick={(e) => {
                e.stopPropagation();
                handleSplitClick(tab);
              }}
              title={isSplit ? t('codeview.tabs.cancelSplit') : t('codeview.tabs.splitScreen')}
            >
              <Split className="h-4 w-4" />
            </button>
            
            {/* 关闭标签按钮 */}
            <button
              className="rounded-sm hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
