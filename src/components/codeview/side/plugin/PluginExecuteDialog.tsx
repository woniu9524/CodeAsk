import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronDown, Folder, File, Filter } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
import { usePluginStore } from "@/store/usePluginStore";
import { useModelStore } from "@/store/useModelStore";
import { getFileHash, readTextFile } from "@/helpers/file_helpers";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { FileNode } from '@/components/codeview/side/FileTree';
import { relative, join, extname } from "@/utils/path";
import type { PluginExecutionFile } from "@/store/usePluginExecutionStore";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  onSelect
                  }: {
  node: FileNodeWithSelection;
  onSelect: (node: FileNodeWithSelection, selected: boolean) => void;
  parentSelected?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            checked={node.selected}
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
              parentSelected={node.selected}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type FileDisplayMode = "all" | "unprocessed" | "unprocessed_and_updated";

interface ExtensionStat {
  extension: string;
  count: number;
  selected: boolean;
}

function FileExtensionsDialog({
  open,
  onOpenChange,
  onConfirm,
  initialExtensions
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (extensions: string[]) => void;
  initialExtensions: string[];
}) {
  const { t } = useTranslation();
  const { fileTree } = useFileStore();
  const [extensionStats, setExtensionStats] = useState<ExtensionStat[]>([]);

  // Calculate extension statistics
  useEffect(() => {
    const stats: Record<string, number> = {};
    
    const traverseFileTree = (nodes: FileNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'file') {
          const ext = extname(node.id).toLowerCase() || 'no-extension';
          stats[ext] = (stats[ext] || 0) + 1;
        }
        if (node.children) {
          traverseFileTree(node.children);
        }
      });
    };
    
    if (fileTree) {
      traverseFileTree(fileTree);
    }
    
    const sortedStats = Object.entries(stats)
      .map(([extension, count]) => ({
        extension,
        count,
        selected: initialExtensions.includes(extension)
      }))
      .sort((a, b) => b.count - a.count);
    
    setExtensionStats(sortedStats);
  }, [fileTree, initialExtensions]);

  const handleSelectAll = (checked: boolean) => {
    setExtensionStats(prev => prev.map(stat => ({
      ...stat,
      selected: checked
    })));
  };

  const handleConfirm = () => {
    const selectedExtensions = extensionStats
      .filter(stat => stat.selected)
      .map(stat => stat.extension);
    onConfirm(selectedExtensions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('codeview.plugin.execute.selectExtensions')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('codeview.plugin.execute.fileExtensions')}</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={extensionStats.length > 0 && extensionStats.every(stat => stat.selected)}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm cursor-pointer">
                {t('codeview.plugin.execute.selectAll')}
              </Label>
            </div>
          </div>
          <ScrollArea className="h-[300px] border rounded-md p-4">
            <div className="space-y-2">
              {extensionStats.map((stat) => (
                <div key={stat.extension} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={stat.selected}
                      onCheckedChange={(checked) => {
                        setExtensionStats(prev => prev.map(s => 
                          s.extension === stat.extension ? { ...s, selected: !!checked } : s
                        ));
                      }}
                    />
                    <span className="text-sm">{stat.extension || t('codeview.plugin.execute.noExtension')}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stat.count}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button onClick={handleConfirm} className="w-full">
            {t('codeview.plugin.execute.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PluginExecuteDialog({ children, pluginId, pluginName }: PluginExecuteDialogProps) {
  const { fileTree, currentFolderPath } = useFileStore();
  const { initializeDataFile, getPluginExecution, savePluginExecution } = usePluginExecutionStore();
  const { plugins } = usePluginStore();
  const { models } = useModelStore();
  const { t } = useTranslation();

  const [selectableTree, setSelectableTree] = useState<FileNodeWithSelection[]>([]);
  const [fileExtensions, setFileExtensions] = useState("");
  const [displayMode, setDisplayMode] = useState<FileDisplayMode>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extensionsDialogOpen, setExtensionsDialogOpen] = useState(false);

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
      return tree.map(currentNode => {
        if (currentNode.id === targetPath) {
          // 更新当前节点及其所有子节点
          const updateChildrenRecursively = (node: FileNodeWithSelection): FileNodeWithSelection => {
            return {
              ...node,
              selected,
              children: node.children?.map(updateChildrenRecursively)
            };
          };
          return updateChildrenRecursively(currentNode);
        }

        if (currentNode.children) {
          const updatedChildren = updateNodeSelection(currentNode.children, targetPath, selected);
          // 更新父节点状态：只有当所有子节点都被选中时，父节点才被选中
          const allChildrenSelected = updatedChildren.every(child => child.selected);
          return {
            ...currentNode,
            children: updatedChildren,
            selected: allChildrenSelected
          };
        }

        return currentNode;
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

  const getSelectedFileCount = (nodes: FileNodeWithSelection[]): number => {
    let count = 0;
    const traverse = (node: FileNodeWithSelection) => {
      if (node.type === 'file' && node.selected) {
        count++;
      }
      node.children?.forEach(traverse);
    };
    nodes.forEach(traverse);
    return count;
  };

  const handleExecute = async () => {
    try {
      setIsProcessing(true);
      setProgress(0);
      const selectedFiles = getSelectedFiles(selectableTree);
      const extensions = fileExtensions.split(',').map(ext => ext.trim()).filter(Boolean);
      // 获取插件配置
      const plugin = plugins.find(p => p.id === pluginId);
      if (!plugin) {
        toast.error(t('codeview.plugin.execute.pluginNotFound'));
        return;
      }

      // 获取模型配置
      const model = models.find(m => m.id === plugin.modelId);
      if (!model) {
        toast.error(t('codeview.plugin.execute.modelNotFound'));
        return;
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
          let result = typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);

          // Remove any <think></think> segments
          result = result.replace(/<think>[\s\S]*?<\/think>/g, '');

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

        // 更新进度
        const currentProgress = Math.min(((i + concurrency) / selectedFiles.length) * 100, 100);
        setProgress(currentProgress);
      }

      const execution = {
        pluginName,
        modelId: plugin.modelId,
        systemPrompt: plugin.systemPrompt,
        userPrompt: plugin.userPrompt,
        rules: {
          fileExtensions: extensions,
          showProcessed: displayMode === "all",
          showUpdated: displayMode === "unprocessed_and_updated"
        },
        files: processedFiles
      };

      await savePluginExecution(pluginId, execution);
      setIsOpen(false);
    } catch (error) {
      console.error('执行失败:', error);
      toast.error(error instanceof Error ? error.message : t('codeview.plugin.execute.unknownError'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
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
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('codeview.plugin.execute.title')+pluginName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>{t('codeview.plugin.execute.filterRules')}</Label>
            <div className="space-y-4">
              <div>
                <Label>{t('codeview.plugin.execute.fileExtensions')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={fileExtensions}
                    onChange={(e) => setFileExtensions(e.target.value)}
                    placeholder={t('codeview.plugin.execute.fileExtensionsPlaceholder')}
                    readOnly
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setExtensionsDialogOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('codeview.plugin.execute.displayMode')}</Label>
                <Select value={displayMode} onValueChange={(value: FileDisplayMode) => setDisplayMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('codeview.plugin.execute.displayModeAll')}</SelectItem>
                    <SelectItem value="unprocessed">{t('codeview.plugin.execute.displayModeUnprocessed')}</SelectItem>
                    <SelectItem value="unprocessed_and_updated">{t('codeview.plugin.execute.displayModeUnprocessedAndUpdated')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>{t('codeview.plugin.execute.fileSelection')}</Label>
                <span className="text-sm text-gray-500">
                  ({getSelectedFileCount(selectableTree)} {t('codeview.plugin.execute.selectedFiles')})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectableTree.length > 0 && selectableTree.every(node => node.selected)}
                  onCheckedChange={(checked) => {
                    const updateAllNodes = (nodes: FileNodeWithSelection[]): FileNodeWithSelection[] => {
                      return nodes.map(node => ({
                        ...node,
                        selected: !!checked,
                        children: node.children ? updateAllNodes(node.children) : undefined
                      }));
                    };
                    setSelectableTree(prevTree => updateAllNodes(prevTree));
                  }}
                />
                <Label htmlFor="select-all" className="text-sm cursor-pointer">
                  {t('codeview.plugin.execute.selectAll')}
                </Label>
              </div>
            </div>
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

          <div className="space-y-4">
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <div className="text-sm text-center text-gray-500">
                  {Math.round(progress)}% {t('codeview.plugin.execute.completed')}
                </div>
              </div>
            )}
            <Button onClick={handleExecute} className="w-full" disabled={isProcessing}>
              {isProcessing ? t('codeview.plugin.execute.processing') : t('codeview.plugin.execute.execute')}
            </Button>
          </div>
        </div>
      </DialogContent>

      <FileExtensionsDialog
        open={extensionsDialogOpen}
        onOpenChange={setExtensionsDialogOpen}
        onConfirm={(extensions) => setFileExtensions(extensions.join(','))}
        initialExtensions={fileExtensions.split(',').map(ext => ext.trim()).filter(Boolean)}
      />
    </Dialog>
  );
}
