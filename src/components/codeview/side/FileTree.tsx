import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { FolderIcon } from 'lucide-react';
import SvgIcon from '@/components/SvgIcon';
import { usePluginStore } from "@/store/usePluginStore";
import { useFileStore } from "@/store/useFileStore";

export type FileNode = {
  id: string;
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
};

type FileTreeProps = {
  data: FileNode[];
  onFileClick?: (file: FileNode) => void;
  activeFile?: string | null;
};

type FileTreeItemProps = FileTreeProps & {
  level?: number;
};

export function getFileIcon(fileName: string) {
  // 获取文件名和扩展名
  const name = fileName.toLowerCase();
  const ext = name.slice(((name.lastIndexOf(".") - 1) >>> 0) + 2);
  
  // 特殊文件名映射
  const specialFiles: { [key: string]: string } = {
    'dockerfile': 'docker',
    '.dockerignore': 'docker',
    '.gitignore': 'git',
    '.env': 'env',
    'package.json': 'nodejs',
    'package-lock.json': 'nodejs',
    'yarn.lock': 'yarn',
    'pnpm-lock.yaml': 'pnpm',
    'readme.md': 'markdown',
    'license': 'certificate',
    'license.txt': 'certificate',
    'license.md': 'certificate',
    'tsconfig.json': 'typescript',
    'tslint.json': 'typescript',
    'eslintrc': 'eslint',
    '.eslintrc.js': 'eslint',
    '.eslintrc.json': 'eslint',
    '.prettierrc': 'prettier',
    'vite.config.ts': 'vite',
    'vite.config.js': 'vite',
    'next.config.js': 'nextjs',
    'nuxt.config.js': 'nuxt',
    'angular.json': 'angular',
    'vue.config.js': 'vue',
    'astro.config.mjs': 'astro',
    'biome.json': 'biome',
    '.babelrc': 'babel',
    'babel.config.js': 'babel',
    'azure-pipelines.yml': 'azure-pipelines',
    'appveyor.yml': 'appveyor',
    '.browserslistrc': 'browserlist',
    'capacitor.config.json': 'capacitor',
    'changelog.md': 'changelog',
    'authors.md': 'authors',
    'contributing.md': 'contributing',
    'code-of-conduct.md': 'conduct',
    'citation.cff': 'citation',
    'circleci.yml': 'circleci',
    '.circleci/config.yml': 'circleci',
    'codeowners': 'codeowners',
    'commitlint.config.js': 'commitlint',
    'contentlayer.config.js': 'contentlayer'
  };

  // 检查是否是特殊文件
  if (specialFiles[name]) {
    return <SvgIcon name={specialFiles[name]} size={16} className="mr-1" />;
  }

  // 扩展名映射
  const extMap: { [key: string]: string } = {
    // Web 技术
    'html': 'html',
    'css': 'css',
    'scss': 'sass',
    'sass': 'sass',
    'less': 'less',
    'js': 'javascript',
    'jsx': 'react',
    'ts': 'typescript',
    'tsx': 'react',
    'vue': 'vue',
    'svelte': 'svelte',
    'astro': 'astro',

    // 编程语言
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'java': 'java',
    'kt': 'kotlin',
    'go': 'go',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'swift': 'swift',
    'dart': 'dart',
    'abap': 'abap',
    'abc': 'abc',
    'ada': 'ada',
    'applescript': 'applescript',
    'as': 'actionscript',
    'asm': 'assembly',
    'ahk': 'autohotkey',
    'au3': 'autoit',
    'bal': 'ballerina',
    'bf': 'brainfuck',
    'clj': 'clojure',
    'cob': 'cobol',
    'coffee': 'coffee',
    'cfm': 'coldfusion',

    // 数据和配置文件
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'xml': 'xml',
    'csv': 'csv',
    'sql': 'database',
    'graphql': 'apollo',
    'prisma': 'prisma',
    'bicep': 'bicep',

    // 构建和工具配置
    'bzl': 'bazel',
    'cmake': 'cmake',
    'cabal': 'cabal',
    'caddy': 'caddy',

    // 文档
    'md': 'markdown',
    'mdx': 'markdown',
    'txt': 'text',
    'pdf': 'pdf',
    'doc': 'word',
    'docx': 'word',
    'xls': 'excel',
    'xlsx': 'excel',
    'adoc': 'asciidoc',

    // 多媒体
    'png': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'gif': 'image',
    'svg': 'svg',
    'mp3': 'audio',
    'wav': 'audio',
    'mp4': 'video',
    'mov': 'video',
    '3ds': '3d',
    'obj': '3d',
    'fbx': '3d',

    // 嵌入式和硬件
    'ino': 'arduino',
    'vhd': 'assembly',
    'v': 'assembly',

    // 其他
    'sh': 'console',
    'bash': 'console',
    'bat': 'console',
    'cmd': 'console',
    'zip': 'zip',
    'rar': 'zip',
    '7z': 'zip',
    'tar': 'zip',
    'gz': 'zip',
    'bun': 'bun',
    'bruno': 'bruno',
    'dll': 'dll'
  };

  const iconName = extMap[ext] || 'file';
  return <SvgIcon name={iconName} size={16} className="mr-1" />;
}

function FileTreeItem({ 
  data, 
  level = 0, 
  onFileClick,
  expandedNodes,
  setExpandedNodes,
  activeFile 
}: FileTreeItemProps & { 
  expandedNodes: Record<string, boolean>,
  setExpandedNodes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev: Record<string, boolean>) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  return (
    <>
      {data.map((node) => (
        <div key={node.id}>
          <div
            style={{ paddingLeft: `${level * 16 + 4}px` }}
            className={`flex items-center cursor-pointer py-1 px-2 text-sm hover:bg-accent/50 group ${
              node.id === activeFile ? "bg-accent/70 text-accent-foreground" : ""
            }`}
            onClick={() => {
              if (node.type === 'directory') {
                toggleNode(node.id);
              } else {
                onFileClick?.(node);
              }
            }}
          >
            {node.type === 'directory' && (
              <span className="mr-1">
                {expandedNodes[node.id] ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </span>
            )}
            {node.type === 'directory' ? (
              <FolderIcon className="mr-1 h-4 w-4 text-yellow-500" />
            ) : (
              getFileIcon(node.name)
            )}
            <span className="ml-1 truncate">{node.name}</span>
          </div>
          {node.type === 'directory' &&
            node.children &&
            expandedNodes[node.id] && (
              <FileTreeItem
                data={node.children}
                level={level + 1}
                onFileClick={onFileClick}
                expandedNodes={expandedNodes}
                setExpandedNodes={setExpandedNodes}
                activeFile={activeFile}
              />
          )}
        </div>
      ))}
    </>
  );
}

export default function FileTree({ data, onFileClick, activeFile }: FileTreeProps) {
  const { currentFolderPath } = useFileStore();
  const { loadProjectPlugins } = usePluginStore();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const treeRef = useRef<HTMLDivElement>(null);

  const locateFile = (targetFile: string) => {
    // Reset expanded nodes
    const newExpandedNodes: Record<string, boolean> = {};
    
    // Find and expand all parent directories of target file
    const expandParents = (nodes: FileNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === targetFile) {
          return true;
        }
        if (node.children && expandParents(node.children)) {
          newExpandedNodes[node.id] = true;
          return true;
        }
      }
      return false;
    };

    expandParents(data);
    setExpandedNodes(newExpandedNodes);
  };

  useEffect(() => {
    const element = treeRef.current;
    if (!element) return;

    const handleLocate = (e: CustomEvent<string>) => {
      locateFile(e.detail);
    };

    element.addEventListener('locate-file', handleLocate as EventListener);
    return () => {
      element.removeEventListener('locate-file', handleLocate as EventListener);
    };
  }, [data]);

  // 当文件夹路径改变时加载项目插件
  useEffect(() => {
    if (currentFolderPath) {
      loadProjectPlugins(currentFolderPath);
    }
  }, [currentFolderPath, loadProjectPlugins]);

  return (
    <div className="select-none h-full flex flex-col min-h-0" ref={treeRef} data-tree-ref>
      <div className="overflow-auto flex-1">
        <FileTreeItem 
          data={data} 
          onFileClick={onFileClick} 
          expandedNodes={expandedNodes}
          setExpandedNodes={setExpandedNodes}
          activeFile={activeFile}
        />
      </div>
    </div>
  );
} 