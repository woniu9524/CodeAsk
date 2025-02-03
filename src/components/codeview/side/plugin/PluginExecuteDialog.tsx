import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import { usePluginStore } from "@/store/usePluginStore";
import { useModelStore } from "@/store/useModelStore";
import { getFileHash, readTextFile } from "@/helpers/file_helpers";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { FileNode } from '@/components/codeview/side/FileTree';
import { relative, join } from "@/utils/path";
import type { PluginExecutionFile } from "@/store/usePluginExecutionStore";

interface PluginExecuteDialogProps {
  children?: React.ReactNode;
  pluginId: string;
  pluginName: string;
}

interface FileNodeWithSelection extends FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  selected: boolean;
  children?: FileNodeWithSelection[];
  _hidden?: boolean;
}

function convertToSelectableTree(node: FileNode): FileNodeWithSelection {
  return {
    ...node,
    selected: false,
    children: node.children?.map(convertToSelectableTree)
  };
}

function FileTree({ 
  node,
  onSelect,
  parentSelected = false
}: { 
  node: FileNodeWithSelection;
  onSelect: (node: FileNodeWithSelection, selected: boolean) => void;
  parentSelected?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const effectiveSelected = parentSelected || node.selected;

  if (node._hidden) {
    return null;
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const isDirectory = node.type === 'directory';

  return (
    <div className="pl-2">
      <div 
        className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
        onClick={isDirectory ? handleToggle : undefined}
      >
        <div className="flex items-center gap-1">
          {isDirectory && (
            <span className="w-4 h-4" onClick={handleToggle}>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          {!isDirectory && <span className="w-4" />}
          <Checkbox
            checked={effectiveSelected}
            onCheckedChange={(checked) => onSelect(node, !!checked)}
            onClick={(e) => e.stopPropagation()}
          />
          {isDirectory ? (
            <Folder className="w-4 h-4 text-blue-500" />
          ) : (
            <File className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm">{node.name}</span>
        </div>
      </div>
      {isDirectory && node.children && isExpanded && (
        <div className="pl-4">
          {node.children.map((child) => (
            <FileTree
              key={child.id}
              node={child}
              onSelect={onSelect}
              parentSelected={effectiveSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type FileDisplayMode = "all" | "unprocessed" | "unprocessed_and_updated";

export function PluginExecuteDialog({ children, pluginId, pluginName }: PluginExecuteDialogProps) {
  const { fileTree, currentFolderPath } = useFileStore();
  const { initializeDataFile, getPluginExecution, savePluginExecution } = usePluginExecutionStore();
  const { plugins } = usePluginStore();
  const { models } = useModelStore();
  
  const [selectableTree, setSelectableTree] = useState<FileNodeWithSelection[]>([]);
  const [fileExtensions, setFileExtensions] = useState("");
  const [displayMode, setDisplayMode] = useState<FileDisplayMode>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // 获取所有文件的哈希值
  const updateFileHashes = async (nodes: FileNodeWithSelection[]) => {
    const newHashes: Record<string, string> = {};
    const processNode = async (node: FileNodeWithSelection) => {
      if (node.type === 'file') {
        try {
          const fileRelativePath = currentFolderPath ? relative(currentFolderPath, node.id) : node.id;
          newHashes[fileRelativePath] = await getFileHash(node.id);
        } catch (error) {
          console.error(`获取文件哈希值失败: ${node.id}`, error);
        }
      }
      for (const child of node.children || []) {
        await processNode(child);
      }
    };

    for (const node of nodes) {
      await processNode(node);
    }
    setFileHashes(newHashes);
  };

  useEffect(() => {
    if (isOpen && currentFolderPath) {
      initializeDataFile(currentFolderPath);
      
      const newTree = fileTree.map(convertToSelectableTree);
      setSelectableTree(newTree);
      updateFileHashes(newTree);

      const execution = getPluginExecution(pluginId);
      if (execution) {
        setFileExtensions(execution.rules.fileExtensions.join(','));
        if (!execution.rules.showProcessed) {
          setDisplayMode("unprocessed");
        } else if (execution.rules.showUpdated) {
          setDisplayMode("unprocessed_and_updated");
        } else {
          setDisplayMode("all");
        }
      }
    }
  }, [isOpen, currentFolderPath, fileTree, pluginId]);

  const filterNode = (node: FileNodeWithSelection): boolean => {
    const extensions = fileExtensions.split(',').map(ext => ext.trim()).filter(Boolean);
    if (node.type === 'file') {
      // 检查文件扩展名
      if (extensions.length > 0) {
        const hasMatchingExtension = extensions.some(ext => 
          node.name.toLowerCase().endsWith(ext.toLowerCase())
        );
        if (!hasMatchingExtension) return false;
      }

      // 获取文件的处理记录
      const execution = getPluginExecution(pluginId);
      if (!execution) return true;

      const fileRelativePath = currentFolderPath ? relative(currentFolderPath, node.id) : node.id;
      const processedFile = execution.files.find(f => f.filename === fileRelativePath);
      const isProcessed = !!processedFile;
      const currentHash = fileHashes[fileRelativePath];
      const needsUpdate = isProcessed && currentHash && processedFile.fileHash !== currentHash;

      // 根据显示模式过滤
      if (displayMode === "unprocessed" && isProcessed) {
        return false;
      }
      if (displayMode === "unprocessed_and_updated" && isProcessed && !needsUpdate) {
        return false;
      }
    }

    return true;
  };

  const filterTree = (nodes: FileNodeWithSelection[]): FileNodeWithSelection[] => {
    return nodes.map(node => {
      if (node.type === 'directory') {
        const filteredChildren = node.children ? filterTree(node.children) : [];
        return {
          ...node,
          children: filteredChildren,
          _hidden: filteredChildren.length === 0 || filteredChildren.every(child => child._hidden)
        };
      }
      return {
        ...node,
        _hidden: !filterNode(node)
      };
    });
  };

  const handleNodeSelect = (node: FileNodeWithSelection, selected: boolean) => {
    const updateNodeSelection = (
      tree: FileNodeWithSelection[],
      targetPath: string,
      selected: boolean
    ): FileNodeWithSelection[] => {
      return tree.map(node => {
        if (node.id === targetPath) {
          const updateChildrenRecursively = (node: FileNodeWithSelection): FileNodeWithSelection => {
            return {
              ...node,
              selected,
              children: node.children?.map(updateChildrenRecursively)
            };
          };
          return updateChildrenRecursively(node);
        }
        
        if (node.children) {
          return {
            ...node,
            children: updateNodeSelection(node.children, targetPath, selected),
            selected: node.selected || (
              node.children.every(child => 
                child.id === targetPath ? selected : child.selected
              )
            )
          };
        }
        
        return node;
      });
    };

    setSelectableTree(prevTree => updateNodeSelection(prevTree, node.id, selected));
  };

  const getSelectedFiles = (nodes: FileNodeWithSelection[]): string[] => {
    const files: string[] = [];
    const traverse = (node: FileNodeWithSelection) => {
      if (node.type === 'file' && node.selected) {
        files.push(node.id);
      }
      node.children?.forEach(traverse);
    };
    nodes.forEach(traverse);
    return files;
  };

  const handleExecute = async () => {
    try {
      setIsProcessing(true);
      const selectedFiles = getSelectedFiles(selectableTree);
      const extensions = fileExtensions.split(',').map(ext => ext.trim()).filter(Boolean);
      // 获取插件配置
      const plugin = plugins.find(p => p.id === pluginId);
      if (!plugin) {
        throw new Error('插件未找到');
      }

      // 获取模型配置
      const model = models.find(m => m.id === plugin.modelId);
      if (!model) {
        throw new Error('模型未找到');
      }

      // 初始化 ChatOpenAI
      const chat = new ChatOpenAI({
        openAIApiKey: model.apiKey,
        modelName: model.name,
        temperature: model.temperature,
        maxTokens: model.maxOutputTokens,
        configuration: {
          baseURL: model.baseUrl
        }
      });

      // 处理单个文件的函数
      const processFile = async (filename: string) => {
        try {
          // 读取文件内容
          const content = await readTextFile(filename);
          const fileHash = await getFileHash(filename);

          // 获取相对路径
          const relativePath = currentFolderPath ? relative(currentFolderPath, filename) : filename;

          // 构建消息
          const messages = [
            new SystemMessage(plugin.systemPrompt),
            new HumanMessage(plugin.userPrompt + "\n\n" + content)
          ];

          // 调用模型分析
          const response = await chat.invoke(messages);
          const result = typeof response.content === 'string' 
            ? response.content 
            : JSON.stringify(response.content);

          return {
            filename: relativePath,
            fileHash,
            result,
            status: "success" as const
          };
        } catch (error) {
          console.error(`处理文件失败: ${filename}`, error);
          const relativePath = currentFolderPath ? relative(currentFolderPath, filename) : filename;
          return {
            filename: relativePath,
            fileHash: await getFileHash(filename),
            result: error instanceof Error ? error.message : '未知错误',
            status: "error" as const
          };
        }
      };

      // 并发处理文件
      const concurrency = model.concurrency ?? 1;
      const processedFiles: PluginExecutionFile[] = [];
      
      // 使用 for 循环分批处理文件
      for (let i = 0; i < selectedFiles.length; i += concurrency) {
        const batch = selectedFiles.slice(i, i + concurrency);
        const batchResults = await Promise.all(batch.map(processFile));
        processedFiles.push(...batchResults);
      }
      
      const rules = {
        fileExtensions: extensions,
        showProcessed: displayMode === "all",
        showUpdated: displayMode === "unprocessed_and_updated"
      };

      const execution = {
        pluginName,
        rules,
        files: processedFiles
      };

      await savePluginExecution(pluginId, execution);
      setIsOpen(false);
    } catch (error) {
      console.error('执行失败:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getAbsolutePath = (relativePath: string, rootPath: string) => {
    return join(rootPath, relativePath);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>执行插件: {pluginName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>过滤规则</Label>
            <div className="space-y-4">
              <div>
                <Label>文件扩展名 (用逗号分隔)</Label>
                <Input
                  value={fileExtensions}
                  onChange={(e) => setFileExtensions(e.target.value)}
                  placeholder="例如: .ts,.tsx,.js"
                />
              </div>
              
              <div className="space-y-2">
                <Label>文件显示模式</Label>
                <Select value={displayMode} onValueChange={(value: FileDisplayMode) => setDisplayMode(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择显示模式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部显示</SelectItem>
                    <SelectItem value="unprocessed">隐藏未处理</SelectItem>
                    <SelectItem value="unprocessed_and_updated">显示未处理及需更新</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>文件选择</Label>
            <div className="max-h-[300px] overflow-auto border rounded-md p-4">
              {filterTree(selectableTree).map((node) => (
                <FileTree
                  key={node.id}
                  node={node}
                  onSelect={handleNodeSelect}
                />
              ))}
            </div>
          </div>

          <Button onClick={handleExecute} className="w-full" disabled={isProcessing}>
            {isProcessing ? "处理中..." : "执行"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 