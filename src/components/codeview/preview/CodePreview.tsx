import React, { useEffect } from "react";
import Editor, { loader, type Monaco } from "@monaco-editor/react";
import { readTextFile } from "@/helpers/file_helpers";
import { getCurrentTheme } from "@/helpers/theme_helpers";
import { getMonacoLanguage } from "@/utils/language";
import path from "@/utils/path";
import * as monaco from 'monaco-editor';

// 配置 Monaco Editor 加载器
loader.config({ monaco });

/**
 * 加载编辑器时的加载组件
 * 显示一个旋转的加载动画和文字提示
 * @returns 加载状态的 React 组件
 */
function LoadingComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="text-sm text-muted-foreground">加载编辑器中...</span>
      </div>
    </div>
  );
}

/**
 * CodePreview 组件的属性接口
 */
interface CodePreviewProps {
  filePath: string; // 要预览的文件路径
}

/**
 * 代码预览组件
 * 用于展示文件内容，支持主题切换、字体大小调整等功能
 * @param props 组件属性，包含文件路径
 * @returns 代码预览的 React 组件
 */
export function CodePreview({ filePath }: CodePreviewProps) {
  // 文件内容状态
  const [content, setContent] = React.useState<string>("");
  
  // 编辑器主题状态（深色/浅色）
  const [theme, setTheme] = React.useState<'vs-dark' | 'light'>('vs-dark');
  
  // 字体大小状态，从本地存储初始化
  const [fontSize, setFontSize] = React.useState(() => {
    const savedSize = localStorage.getItem('editorFontSize');
    return savedSize ? parseInt(savedSize) : 24; // 默认字体大小为 24
  });

  // 加载文件内容的副作用
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

  // 监听并同步系统主题的副作用
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const { local } = await getCurrentTheme();
        setTheme(local === 'dark' ? 'vs-dark' : 'light');
      } catch (error) {
        console.error("加载主题失败:", error);
      }
    };
    loadTheme();
    const intervalId = setInterval(loadTheme, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // 获取文件扩展名
  const ext = path.extname(filePath).slice(1).toLowerCase();

  /**
   * 编辑器挂载前的配置处理
   * @param monaco Monaco 编辑器实例
   */
  const handleEditorWillMount = (monaco: Monaco) => {
    // 定义自定义深色主题
    monaco.editor.defineTheme('vs-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {}
    });
  };
  
  /**
   * 编辑器挂载后的事件处理
   * @param editor Monaco 编辑器实例
   * @returns 清理函数，用于取消事件监听
   */
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // 监听编辑器配置变化
    const disposable = editor.onDidChangeConfiguration((e) => {
      // 修复：使用正确的方式获取字体大小
      if (e.hasChanged('fontSize')) {
        const newSize = editor.getOption(monaco.editor.EditorOption.fontSize);
        setFontSize(newSize);
        localStorage.setItem('editorFontSize', newSize.toString());
      }
    });
    
    // 返回清理函数
    return () => disposable.dispose();
  };

  return (
    <div className="h-full overflow-auto">
      <Editor
        value={content}
        height="100%"
        theme={theme}
        language={getMonacoLanguage(ext)}
        loading={<LoadingComponent />}
        options={{
          readOnly: true, // 只读模式
          minimap: { enabled: false }, // 禁用代码缩略图
          scrollBeyondLastLine: false, // 禁止滚动超过最后一行
          fontSize: fontSize, // 动态字体大小
          lineNumbers: "on", // 显示行号
          renderLineHighlight: "all", // 高亮当前行
          automaticLayout: true, // 自动调整布局
          wordWrap: "off", // 禁用自动换行
          folding: true, // 启用代码折叠
          foldingStrategy: "indentation", // 使用缩进作为折叠策略
          showFoldingControls: "always", // 始终显示折叠控件
          formatOnPaste: true, // 粘贴时自动格式化
          formatOnType: true, // 输入时自动格式化
          mouseWheelZoom: true, // 启用 Ctrl+滚轮缩放
        }}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
      />
    </div>
  );
} 