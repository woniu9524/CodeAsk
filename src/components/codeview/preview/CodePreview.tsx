import React, { useEffect } from "react";
import Editor, { loader, type Monaco } from "@monaco-editor/react";
import { readTextFile } from "@/helpers/file_helpers";
import { getCurrentTheme } from "@/helpers/theme_helpers";
import { getMonacoLanguage } from "@/utils/language";
import path from "@/utils/path";
import * as monaco from 'monaco-editor';

// 配置 Monaco Editor 加载器
loader.config({ monaco });

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

interface CodePreviewProps {
  filePath: string;
}

export function CodePreview({ filePath }: CodePreviewProps) {
  const [content, setContent] = React.useState<string>("");
  const [theme, setTheme] = React.useState<'vs-dark' | 'light'>('vs-dark');

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
        setTheme(local === 'dark' ? 'vs-dark' : 'light');
      } catch (error) {
        console.error("加载主题失败:", error);
      }
    };
    loadTheme();
    const intervalId = setInterval(loadTheme, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const ext = path.extname(filePath).slice(1).toLowerCase();

  const handleEditorWillMount = (monaco: Monaco) => {
    // 这里可以在编辑器加载前进行一些配置
    monaco.editor.defineTheme('vs-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {}
    });
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
          readOnly: true, // 设置为只读模式，用户不能编辑内容
          minimap: { enabled: false }, // 启用右侧的代码缩略图
          scrollBeyondLastLine: false, // 禁止滚动超过最后一行
          fontSize: 24, // 设置代码字体大小
          lineNumbers: "on", // 显示行号
          renderLineHighlight: "all", // 高亮当前行
          automaticLayout: true, // 自动调整编辑器布局
          wordWrap: "off", // 启用自动换行
          folding: true, // 启用代码折叠功能
          foldingStrategy: "indentation", // 使用缩进作为折叠策略
          showFoldingControls: "always", // 始终显示折叠控件
          formatOnPaste: true, // 粘贴时自动格式化代码
          formatOnType: true, // 输入时自动格式化代码

        }}
        beforeMount={handleEditorWillMount}
      />
    </div>
  );
} 