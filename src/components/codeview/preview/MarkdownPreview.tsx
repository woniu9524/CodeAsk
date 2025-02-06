import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCurrentTheme } from "@/helpers/theme_helpers";
import Prism from 'prismjs';
import type { Components } from 'react-markdown';
import mermaid from 'mermaid';
import { MermaidBlock } from './MermaidBlock';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
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

      if (language === 'mermaid') {
        return <MermaidBlock>{children}</MermaidBlock>;
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
    ol: ({ children }) => (
      <ol className="list-decimal my-4 space-y-2 ml-6">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="ml-2 pl-2">
        {children}
      </li>
    ),
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