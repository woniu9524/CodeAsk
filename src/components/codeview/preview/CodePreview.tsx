import React, { useEffect } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { readTextFile } from "@/helpers/file_helpers";
import { getCurrentTheme } from "@/helpers/theme_helpers";
import { getLanguageExtension } from "@/utils/language";
import path from "@/utils/path";

interface CodePreviewProps {
  filePath: string;
}

export function CodePreview({ filePath }: CodePreviewProps) {
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
    const intervalId = setInterval(loadTheme, 1000);
    return () => clearInterval(intervalId);
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