import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileStore } from '@/store/useFileStore';
import { usePluginExecutionStore } from '@/store/usePluginExecutionStore';
import { useTranslation } from 'react-i18next';
import path from '@/utils/path';
import type { FileNode } from '@/components/codeview/side/FileTree';
import { readTextFile } from '@/helpers/file_helpers';

interface ExtensionStat {
  extension: string;
  count: number;
  selected: boolean;
}

// 不可搜索的文件扩展名列表
const UNSEARCHABLE_EXTENSIONS = new Set([
  // 二进制和可执行文件
  '.dll', '.exe', '.so', '.dylib', '.a', '.lib', '.o', '.obj',
  '.bin', '.sys', '.ko', '.class',

  // Python相关
  '.pyd', '.pyc', '.pyi', '.pth', '.whl', '.egg', '.egg-info',

  // 图片文件
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.icns', '.webp',
  '.tiff', '.svg', '.eps', '.raw', '.cr2', '.nef', '.heic', '.avif',
  '.psd', '.ai', '.sketch',

  // 音视频文件
  '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma',
  '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm',
  '.m4v', '.mpg', '.mpeg', '.3gp',

  // 压缩和打包文件
  '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
  '.tgz', '.pkg', '.dmg', '.deb', '.rpm', '.msi', '.apk',
  '.jar', '.war', '.ear',

  // 数据和缓存文件
  '.dat', '.db', '.sqlite', '.sqlite3', '.mdb', '.accdb',
  '.cache', '.tmp', '.temp', '.swp', '.bak', '.old',
  '.log', '.pid', '.lock', '.dmp',

  // 证书和密钥文件
  '.pem', '.key', '.keystore', '.crt', '.cer', '.p12',
  '.pfx', '.jks', '.csr', '.der',

  // 环境和配置文件
  '.env', '.virtualenv', '.venv', '.codeaskdata',
  '.aidigestignore', '.gitignore', '.dockerignore',
  '.npmignore', '.eslintignore', '.prettierignore',
  '.development', '.production', '.local', '.test',
  '.staging', '.debug',

  // 模板和构建文件
  '.tmpl', '.nsh', '.qrc', '.rc', '.res', '.manifest',
  '.map', '.min', '.chunk', '.bundle',

  // 字体文件
  '.ttf', '.otf', '.woff', '.woff2', '.eot',

  // 文档和办公文件
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.odt', '.ods', '.odp',


  // IDE和编辑器文件
  '.idea', '.vscode', '.vs', '.project', '.workspace',
  '.iml', '.sln', '.suo', '.user', '.sublime-project',
  '.sublime-workspace',

  // 其他特殊文件
  'no-extension',
  '.d.ts',  // TypeScript 声明文件
  '.min.js', // 压缩的 JS 文件
  '.min.css', // 压缩的 CSS 文件
  '.spec.ts', // 测试文件
  '.test.ts', // 测试文件
  '.spec.js',
  '.test.js',
  '.config.js',
  '.config.ts',
  '.conf',
  '.ini',
  '.properties',
  '.pbxproj',
  '.xcodeproj',
  '.xcworkspace',
  '.gradle',
  '.m',
  '.h',
  '.hpp',
  '.cpp',
  '.c',
  '.swift',
  '.kt',
  '.class',
  '.jar',
  '.framework'
]);

export interface SearchResult {
  id: string;
  name: string;
  path: string;
  type: 'code' | 'plugin';
  extension: string;
  pluginName?: string;
  matchingContent?: string;
  lineNumber?: number;
}

interface SearchPanelProps {
  onResultClick: (result: SearchResult) => void;
}

export default function SearchPanel({ onResultClick }: SearchPanelProps) {
  const { t } = useTranslation();
  const { fileTree, currentFolderPath } = useFileStore();
  const { executions } = usePluginExecutionStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [extensionStats, setExtensionStats] = useState<ExtensionStat[]>([]);
  const [searchTypes, setSearchTypes] = useState({
    code: true,
    plugin: true
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // 统计文件扩展名
  const calculateExtensionStats = () => {
    const stats: Record<string, number> = {};
    
    // 遍历文件树统计扩展名
    const traverseFileTree = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') {
          const ext = path.extname(node.id).toLowerCase() || 'no-extension';
          if (!UNSEARCHABLE_EXTENSIONS.has(ext)) {
            stats[ext] = (stats[ext] || 0) + 1;
          }
        }
        if (node.children) {
          traverseFileTree(node.children);
        }
      });
    };
    
    // 统计代码文件扩展名
    if (fileTree) {
      traverseFileTree(fileTree);
    }
    
    // 统计插件结果文件扩展名
    Object.values(executions).forEach(execution => {
      execution.files.forEach(file => {
        const ext = path.extname(file.filename).toLowerCase() || 'no-extension';
        if (!UNSEARCHABLE_EXTENSIONS.has(ext)) {
          stats[ext] = (stats[ext] || 0) + 1;
        }
      });
    });
    
    // 转换为数组并排序
    const sortedStats = Object.entries(stats)
      .map(([extension, count]) => ({
        extension,
        count,
        selected: true
      }))
      .sort((a, b) => b.count - a.count);
    
    setExtensionStats(sortedStats);
  };
  
  // 初始化时计算扩展名统计
  useEffect(() => {
    calculateExtensionStats();
  }, [fileTree, executions]);

  // 搜索文件内容
  const searchFileContent = async (filePath: string): Promise<string | null> => {
    try {
      const content = await readTextFile(filePath);
      if (!searchQuery) return null;
      
      if (content.toLowerCase().includes(searchQuery.toLowerCase())) {
        // 找到包含搜索词的行
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(searchQuery.toLowerCase())) {
            return `${i + 1}: ${lines[i].trim()}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  };
  
  // 执行搜索
  const performSearch = async () => {
    if (!searchQuery || !currentFolderPath) return;
    
    setIsSearching(true);
    const results: SearchResult[] = [];
    const selectedExtensions = extensionStats
      .filter(stat => stat.selected)
      .map(stat => stat.extension);
    
    try {
      // 搜索代码文件内容
      if (searchTypes.code && fileTree) {
        const searchFileTree = async (nodes: FileNode[]) => {
          for (const node of nodes) {
            if (node.type === 'file') {
              const ext = path.extname(node.id).toLowerCase() || 'no-extension';
              if (selectedExtensions.includes(ext) && !UNSEARCHABLE_EXTENSIONS.has(ext)) {
                const matchingContent = await searchFileContent(node.id);
                if (matchingContent) {
                  const [lineNumber, content] = matchingContent.split(': ', 2);
                  results.push({
                    id: node.id,
                    name: node.name,
                    path: node.id,
                    type: 'code',
                    extension: ext,
                    matchingContent: content,
                    lineNumber: parseInt(lineNumber, 10)
                  });
                }
              }
            }
            if (node.children) {
              await searchFileTree(node.children);
            }
          }
        };
        
        await searchFileTree(fileTree);
      }
      
      // 搜索插件结果内容
      if (searchTypes.plugin) {
        Object.values(executions).forEach(execution => {
          execution.files.forEach(file => {
            const ext = path.extname(file.filename).toLowerCase() || 'no-extension';
            if (
              selectedExtensions.includes(ext) &&
              !UNSEARCHABLE_EXTENSIONS.has(ext) &&
              file.result &&
              file.result.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
              // 找到包含搜索词的行
              const lines = file.result.split('\n');
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.toLowerCase().includes(searchQuery.toLowerCase())) {
                  results.push({
                    id: `plugin_result:${execution.pluginName}:${file.filename}`,
                    name: path.basename(file.filename),
                    path: file.filename,
                    type: 'plugin',
                    extension: ext,
                    pluginName: execution.pluginName,
                    matchingContent: line.trim(),
                    lineNumber: i + 1
                  });
                  break; // 只添加第一个匹配的行
                }
              }
            }
          });
        });
      }
      
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };
  
  // 当搜索条件改变时执行搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // 添加防抖

    return () => clearTimeout(timer);
  }, [searchQuery, searchTypes, extensionStats]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 p-2">
        <Input
          placeholder={t('codeview.search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="space-y-2">
          <Label>{t('codeview.search.searchIn')}</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="search-code"
                checked={searchTypes.code}
                onCheckedChange={(checked) => 
                  setSearchTypes(prev => ({ ...prev, code: !!checked }))
                }
              />
              <Label htmlFor="search-code">{t('codeview.search.code')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="search-plugin"
                checked={searchTypes.plugin}
                onCheckedChange={(checked) => 
                  setSearchTypes(prev => ({ ...prev, plugin: !!checked }))
                }
              />
              <Label htmlFor="search-plugin">{t('codeview.search.plugin')}</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Label>{t('codeview.search.extensions')}</Label>
            <div className="flex items-center space-x-1">
              <Checkbox
                id="select-all-extensions"
                checked={extensionStats.every(stat => stat.selected)}
                className="h-3 w-3"
                onCheckedChange={(checked) => {
                  setExtensionStats(prev =>
                    prev.map(s => ({ ...s, selected: !!checked }))
                  );
                }}
              />
              <Label className="text-xs" htmlFor="select-all-extensions">
                {t('codeview.search.selectAll')}
              </Label>
            </div>
          </div>
          <ScrollArea className="h-48 rounded-md border">
            <div className="p-2 grid grid-cols-3 gap-x-2 gap-y-1">
              {extensionStats.map((stat) => (
                <div key={stat.extension} className="flex items-center space-x-1">
                  <Checkbox
                    id={`ext-${stat.extension}`}
                    checked={stat.selected}
                    className="h-3 w-3"
                    onCheckedChange={(checked) => {
                      setExtensionStats(prev =>
                        prev.map(s =>
                          s.extension === stat.extension
                            ? { ...s, selected: !!checked }
                            : s
                        )
                      );
                    }}
                  />
                  <Label className="text-xs truncate" htmlFor={`ext-${stat.extension}`}>
                    {stat.extension}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isSearching ? (
            <div className="text-center py-4 text-muted-foreground">
              {t('codeview.search.searching')}
            </div>
          ) : searchResults.length === 0 && searchQuery ? (
            <div className="text-center py-4 text-muted-foreground">
              {t('codeview.search.noResults')}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="text-sm text-muted-foreground mb-2 px-2">
              {t('codeview.search.results', { count: searchResults.length })}
            </div>
          ) : null}
          {searchResults.map((result) => (
            <div
              key={`${result.id}-${result.lineNumber}`}
              className="p-2 rounded-md hover:bg-accent cursor-pointer"
              onClick={() => onResultClick(result)}
            >
              <div className="font-medium">{result.name}</div>
              {result.matchingContent && (
                <div className="text-sm bg-muted/50 p-1 rounded mt-1 font-mono">
                  <span className="text-muted-foreground">
                    {result.lineNumber}:
                  </span>{' '}
                  {result.matchingContent}
                </div>
              )}
              <div className="text-sm text-muted-foreground mt-1">
                {result.type === 'plugin' && result.pluginName 
                  ? `${result.pluginName} - ${result.path}`
                  : result.path}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}