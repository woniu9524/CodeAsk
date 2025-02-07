import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getCurrentTheme } from "@/helpers/theme_helpers";
import Prism from 'prismjs';
import type { Components } from 'react-markdown';
import mermaid from 'mermaid';
import { MermaidBlock } from './MermaidBlock';
import { Copy } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [theme, setTheme] = React.useState<'dark' | 'light' | 'system'>('dark');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !match;
      const codeString = String(children).replace(/\n$/, '');

      if (language === 'mermaid') {
        return <MermaidBlock>{children}</MermaidBlock>;
      }
      
      return isInline ? (
        <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      ) : (
        <div className="relative group">
          {language && (
            <div className="absolute right-2 top-2 flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-background/30 px-2 py-1 rounded">
                {language}
              </span>
              <button
                onClick={() => handleCopyCode(codeString)}
                className="p-1 rounded hover:bg-background/30 transition-colors"
                title="Copy code"
              >
                <Copy size={14} className={copiedCode === codeString ? "text-green-500" : "text-muted-foreground"} />
              </button>
            </div>
          )}
          <pre className="!bg-muted p-4 rounded-lg my-4 overflow-x-auto">
            <code className={className} {...props}>
              {codeString}
            </code>
          </pre>
        </div>
      );
    },
    img({ src, alt, ...props }) {
      return (
        <div className="my-4">
          <img
            src={src}
            alt={alt}
            className="rounded-lg max-w-full h-auto"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 4h10l2 2v10l-2 2H7l-2-2V6z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>';
            }}
            {...props}
          />
          {alt && <p className="text-sm text-muted-foreground text-center mt-2">{alt}</p>}
        </div>
      );
    },
    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
    p: ({ children }) => <p className="my-4 leading-7">{children}</p>,
    ul: ({ children }) => (
      <ul className="list-disc my-4 space-y-1 ml-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal my-4 space-y-1 ml-6">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="pl-1 leading-normal">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic">{children}</blockquote>
    ),
    table: ({ children }) => (
      <div className="my-6 w-full overflow-x-auto">
        <table className="w-full border-collapse divide-y divide-border">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 bg-muted font-semibold text-left border-b border-border">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 border-b border-border">
        {children}
      </td>
    ),
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