import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCurrentTheme } from "@/helpers/theme_helpers";
import Prism from 'prismjs';
import type { Components } from 'react-markdown';
import mermaid from 'mermaid';
import { MermaidBlock } from './MermaidBlock';
import { Copy } from 'lucide-react';

// MarkdownPreview 组件的属性接口
interface MarkdownPreviewProps {
  content: string; // 要渲染的 Markdown 内容
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  // 主题状态，默认为深色主题
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('dark');
  
  // 记录已复制的代码块，用于显示复制成功状态
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const mermaidInitialized = useRef(false);

  useEffect(() => {
    // 异步加载主题配置
    const loadTheme = async () => {
      try {
        // 获取当前本地主题设置
        const { local } = await getCurrentTheme();
        // 设置主题，如果没有本地设置则默认为深色
        setTheme(local || 'dark');
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };
    loadTheme();

    // 初始化 Mermaid 配置
    if (!mermaidInitialized.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose',
      });
      mermaidInitialized.current = true;
    }

    // 使用 Prism 高亮代码块
    Prism.highlightAll();
  }, [theme]);

  // 当内容变化时重新渲染所有 Mermaid 图表
  useEffect(() => {
    const renderMermaidDiagrams = async () => {
      try {
        // 清理所有现有的 Mermaid SVG
        document.querySelectorAll('.mermaid svg').forEach(svg => svg.remove());
        
        // 重新渲染所有 Mermaid 图表
        await mermaid.run({
          querySelector: '.mermaid',
          suppressErrors: true
        });
      } catch (error) {
        console.error('Failed to render Mermaid diagrams:', error);
      }
    };

    // 给 React 一点时间来渲染 DOM
    const timeoutId = setTimeout(() => {
      renderMermaidDiagrams();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [content]);

  // 处理代码块复制功能
  const handleCopyCode = (code: string) => {
    // 复制代码到剪贴板
    navigator.clipboard.writeText(code);
    // 设置当前复制的代码
    setCopiedCode(code);
    // 2秒后清除复制状态
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // 自定义 Markdown 渲染组件
  const components: Components = {
    // 自定义代码块渲染
    code({ className, children, ...props }) {
      // 提取代码块语言
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      // 判断是否为行内代码
      const isInline = !match;
      // 处理代码字符串，移除末尾换行
      const codeString = String(children).replace(/\n$/, '');

      // 特殊处理 Mermaid 图表
      if (language === 'mermaid') {
        return <MermaidBlock>{children}</MermaidBlock>;
      }
      
      // 行内代码和代码块的不同渲染
      return isInline ? (
        // 行内代码样式
        <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      ) : (
        // 代码块渲染，包含语言标签和复制按钮
        <div className="relative group">
          {language && (
            <div className="absolute right-2 top-2 flex items-center gap-2">
              {/* 显示代码语言 */}
              <span className="text-xs text-muted-foreground bg-background/30 px-2 py-1 rounded">
                {language}
              </span>
              {/* 复制代码按钮 */}
              <button
                onClick={() => handleCopyCode(codeString)}
                className="p-1 rounded hover:bg-background/30 transition-colors"
                title="复制代码"
              >
                <Copy 
                  size={14} 
                  className={copiedCode === codeString ? "text-green-500" : "text-muted-foreground"} 
                />
              </button>
            </div>
          )}
          {/* 代码块预格式化显示 */}
          <pre className="!bg-muted p-4 rounded-lg my-4 overflow-x-auto">
            <code className={className} {...props}>
              {codeString}
            </code>
          </pre>
        </div>
      );
    },

    // 自定义图片渲染，添加懒加载和错误处理
    img({ src, alt, ...props }) {
      return (
        <div className="my-4">
          <img
            src={src}
            alt={alt}
            className="rounded-lg max-w-full h-auto"
            loading="lazy"
            // 图片加载失败时显示占位 SVG
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4h10l2 2v10l-2 2H7l-2-2V6z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>';
            }}
            {...props}
          />
          {/* 图片说明文字 */}
          {alt && <p className="text-sm text-muted-foreground text-center mt-2">{alt}</p>}
        </div>
      );
    },

    // 自定义标题样式
    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,

    // 段落样式
    p: ({ children }) => <p className="my-4 leading-7">{children}</p>,

    // 无序列表样式
    ul: ({ children }) => (
      <ul className="list-disc my-4 space-y-1 ml-4">
        {children}
      </ul>
    ),

    // 有序列表样式
    ol: ({ children }) => (
      <ol className="list-decimal my-4 space-y-1 ml-6">
        {children}
      </ol>
    ),

    // 列表项样式
    li: ({ children }) => (
      <li className="pl-1 leading-normal">
        {children}
      </li>
    ),

    // 引用块样式
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic bg-muted/20 py-2 rounded-r">
        {children}
      </blockquote>
    ),

    // 表格样式
    table: ({ children }) => (
      <div className="my-6 w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          {children}
        </table>
      </div>
    ),

    // 表头样式
    th: ({ children }) => (
      <th className="px-6 py-3 bg-muted/50 font-semibold text-left text-sm border-b border-border/50 sticky top-0">
        {children}
      </th>
    ),

    // 表格单元格样式
    td: ({ children }) => (
      <td className="px-6 py-3.5 text-sm border-b border-border/30 even:bg-muted/10 hover:bg-muted/20 transition-colors">
        {children}
      </td>
    ),

    // 链接样式，支持外部链接
    a: ({ children, href }) => {
      const isExternal = href?.startsWith('http');
      return (
        <a
          href={href}
          className="text-primary hover:underline inline-flex items-center gap-0.5"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {children}
          {/* 外部链接添加图标 */}
          {isExternal && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-0.5"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          )}
        </a>
      );
    },
  };

  // 渲染 Markdown 内容
  return (
    <div className="h-full p-6 overflow-auto bg-background">
      <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-bold prose-a:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} // 启用 GitHub Flavored Markdown 扩展
          components={components} // 使用自定义渲染组件
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
} 