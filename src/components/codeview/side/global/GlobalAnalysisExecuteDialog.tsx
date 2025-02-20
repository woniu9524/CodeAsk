import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronDown, Folder, File, Filter } from "lucide-react";
import { useFileStore } from "@/store/useFileStore";
import { useGlobalAnalysisStore } from "@/store/useGlobalAnalysisStore";
import { useGlobalAnalysisExecutionStore, SinglePageAnalysisResult } from "@/store/useGlobalAnalysisExecutionStore";
import { useModelStore } from "@/store/useModelStore";
import { getFileHash, readTextFile } from "@/helpers/file_helpers";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { FileNode } from '@/components/codeview/side/FileTree';
import { relative, extname } from "@/utils/path";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GlobalAnalysisExecuteDialogProps {
  children?: React.ReactNode;
  analysisId: string;
  analysisName: string;
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
        className="flex items-center gap-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
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
          <DialogTitle>{t('codeview.globalAnalysis.execute.selectExtensions')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{t('codeview.globalAnalysis.execute.fileExtensions')}</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={extensionStats.length > 0 && extensionStats.every(stat => stat.selected)}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm cursor-pointer">
                {t('codeview.globalAnalysis.execute.selectAll')}
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
                    <span className="text-sm">{stat.extension || t('codeview.globalAnalysis.execute.noExtension')}</span>
                  </div>
                  <span className="text-sm text-gray-500">{stat.count}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button onClick={handleConfirm} className="w-full">
            {t('codeview.globalAnalysis.execute.confirm')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GlobalAnalysisExecuteDialog({ children, analysisId, analysisName }: GlobalAnalysisExecuteDialogProps) {
  const { fileTree, currentFolderPath } = useFileStore();
  const { analyses } = useGlobalAnalysisStore();
  const { initializeDataFile, saveAnalysisResult } = useGlobalAnalysisExecutionStore();
  const { models } = useModelStore();
  const { t } = useTranslation();

  const [selectableTree, setSelectableTree] = useState<FileNodeWithSelection[]>([]);
  const [fileExtensions, setFileExtensions] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extensionsDialogOpen, setExtensionsDialogOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState<'single' | 'summary'>('single');

  const analysis = analyses.find(a => a.id === analysisId);

  const updateFileHashes = async (nodes: FileNodeWithSelection[]) => {
    const processNode = async (node: FileNodeWithSelection) => {
      if (node.type === 'file') {
        try {
          await getFileHash(node.id);
        } catch (error) {
          console.error(t('codeview.globalAnalysis.execute.getFileHashError', { filename: node.id }), error);
        }
      }
      for (const child of node.children || []) {
        await processNode(child);
      }
    };

    for (const node of nodes) {
      await processNode(node);
    }
  };

  useEffect(() => {
    if (isOpen && currentFolderPath) {
      initializeDataFile(currentFolderPath);

      const newTree = fileTree.map(convertToSelectableTree);
      setSelectableTree(newTree);
      updateFileHashes(newTree);
    }
  }, [isOpen, currentFolderPath, fileTree]);

  const filterNode = (node: FileNodeWithSelection): boolean => {
    const extensions = fileExtensions.split(',').map(ext => ext.trim()).filter(Boolean);
    if (node.type === 'file') {
      if (extensions.length > 0) {
        const hasMatchingExtension = extensions.some(ext =>
          node.name.toLowerCase().endsWith(ext.toLowerCase())
        );
        if (!hasMatchingExtension) return false;
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
      if (node._hidden) return;
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
      if (node._hidden) return;
      if (node.type === 'file' && node.selected) {
        count++;
      }
      node.children?.forEach(traverse);
    };
    nodes.forEach(traverse);
    return count;
  };

  const getVisibleFiles = (nodes: FileNodeWithSelection[]): FileNodeWithSelection[] => {
    const files: FileNodeWithSelection[] = [];
    const traverse = (node: FileNodeWithSelection): void => {
      if (node._hidden) return;
      if (node.type === 'file') {
        files.push(node);
      }
      node.children?.forEach(traverse);
    };
    nodes.forEach(traverse);
    return files;
  };

  const handleExecute = async () => {
    if (!analysis) {
      toast.error(t('codeview.globalAnalysis.analysisNotFound'));
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setCurrentStage('single');

      const selectedFiles = getSelectedFiles(filterTree(selectableTree));

      // 获取单页分析模型配置
      const singlePageModel = models.find(m => m.id === analysis.singlePageAnalysis.modelId);
      if (!singlePageModel) {
        toast.error(t('codeview.globalAnalysis.execute.modelNotFound'));
        return;
      }

      // 获取总结模型配置
      const summaryModel = models.find(m => m.id === analysis.summaryAnalysis.modelId);
      if (!summaryModel) {
        toast.error(t('codeview.globalAnalysis.execute.modelNotFound'));
        return;
      }

      // 初始化单页分析 ChatOpenAI
      const singlePageChat = new ChatOpenAI({
        openAIApiKey: singlePageModel.apiKey,
        modelName: singlePageModel.name,
        temperature: singlePageModel.temperature,
        maxTokens: singlePageModel.maxOutputTokens,
        configuration: {
          baseURL: singlePageModel.baseUrl
        }
      });

      // 初始化总结 ChatOpenAI
      const summaryChat = new ChatOpenAI({
        openAIApiKey: summaryModel.apiKey,
        modelName: summaryModel.name,
        temperature: summaryModel.temperature,
        maxTokens: summaryModel.maxOutputTokens,
        configuration: {
          baseURL: summaryModel.baseUrl
        }
      });

      // 处理单个文件的函数
      const processFile = async (filename: string) => {
        try {
          const content = await readTextFile(filename);
          const fileHash = await getFileHash(filename);
          const relativePath = currentFolderPath ? relative(currentFolderPath, filename) : filename;

          const messages = [
            new SystemMessage(analysis.singlePageAnalysis.prompt),
            new HumanMessage(`File: ${relativePath}\n\nCode:\n${content}`)
          ];

          const response = await singlePageChat.invoke(messages);
          let result = typeof response.content === 'string'
            ? response.content
            : JSON.stringify(response.content);

          result = result.replace(/<think>[\s\S]*?<\/think>/g, '');
          result = result.replace(/^```markdown([\s\S]*?)```$/, '$1');
          result = result.replace(/^```([\s\S]*?)```$/, '$1');

          return {
            filename: relativePath,
            content: result,
            fileHash,
            status: "success" as const
          };
        } catch (error) {
          console.error(t('codeview.globalAnalysis.execute.processingFileError', { filename }), error);
          const relativePath = currentFolderPath ? relative(currentFolderPath, filename) : filename;
          
          // Show error toast for each file processing error
          toast.error(t('codeview.globalAnalysis.execute.processingFileError', {
            filename: relativePath,
            error: error instanceof Error ? error.message : t('codeview.globalAnalysis.unknownError')
          }));

          return {
            filename: relativePath,
            content: error instanceof Error ? error.message : t('codeview.globalAnalysis.unknownError'),
            fileHash: await getFileHash(filename),
            status: "error" as const
          };
        }
      };

      // 并发处理文件
      const concurrency = singlePageModel.concurrency ?? 1;
      const singlePageResults: SinglePageAnalysisResult[] = [];
      let completedFiles = 0;

      // 使用 for 循环分批处理文件
      for (let i = 0; i < selectedFiles.length; i += concurrency) {
        const batch = selectedFiles.slice(i, i + concurrency);
        const batchPromises = batch.map(async (file) => {
          const result = await processFile(file);
          completedFiles++;
          setProgress((completedFiles / selectedFiles.length) * 90); // 单页分析占总进度的 90%
          return result;
        });
        const results = await Promise.all(batchPromises);
        singlePageResults.push(...results);
      }

      // 第二阶段：生成总结
      setCurrentStage('summary');
      setProgress(90);

      try {
        const summaryMessages = [
          new SystemMessage(analysis.summaryAnalysis.prompt),
          new HumanMessage(JSON.stringify(singlePageResults, null, 2))
        ];

        const summaryResponse = await summaryChat.invoke(summaryMessages);
        const summary = typeof summaryResponse.content === 'string'
          ? summaryResponse.content
          : JSON.stringify(summaryResponse.content);

        // 保存分析结果
        await saveAnalysisResult(analysisId, {
          analysisId,
          singlePageResults,
          summary: summary
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .replace(/^```markdown([\s\S]*?)```$/, '$1')
            .replace(/^```([\s\S]*?)```$/, '$1'),
          timestamp: Date.now()
        });

        setProgress(100);
        toast.success(t('codeview.globalAnalysis.execute.analysisComplete'));
      } catch (error) {
        console.error(t('codeview.globalAnalysis.execute.summaryError'), error);
        toast.error(t('codeview.globalAnalysis.execute.summaryGenerationError', {
          error: error instanceof Error ? error.message : t('codeview.globalAnalysis.unknownError')
        }));
      }

      setIsOpen(false);
    } catch (error) {
      console.error(t('codeview.globalAnalysis.execute.executionError'), error);
      toast.error(error instanceof Error ? error.message : t('codeview.globalAnalysis.unknownError'));
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setCurrentStage('single');
    }
  };

  // 使用 useMemo 缓存过滤后的文件树
  const filteredTree = useMemo(() => {
    return filterTree(selectableTree);
  }, [selectableTree, fileExtensions]);

  // 使用 useMemo 缓存可见文件列表
  const visibleFiles = useMemo(() => {
    return getVisibleFiles(filteredTree);
  }, [filteredTree]);

  // 使用 useMemo 缓存选中的文件数量
  const selectedFileCount = useMemo(() => {
    return getSelectedFileCount(filteredTree);
  }, [filteredTree]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('codeview.globalAnalysis.execute.title', { name: analysisName })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>{t('codeview.globalAnalysis.execute.filterRules')}</Label>
            <div className="space-y-4">
              <div>
                <Label>{t('codeview.globalAnalysis.execute.fileExtensions')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={fileExtensions}
                    onChange={(e) => setFileExtensions(e.target.value)}
                    placeholder={t('codeview.globalAnalysis.execute.fileExtensionsPlaceholder')}
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
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>{t('codeview.globalAnalysis.execute.fileSelection')}</Label>
                <span className="text-sm text-gray-500">
                  ({selectedFileCount} {t('codeview.globalAnalysis.execute.selectedFiles')})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={
                    visibleFiles.length > 0 &&
                    visibleFiles.every(file => file.selected)
                  }
                  onCheckedChange={(checked) => {
                    const updateAllNodes = (nodes: FileNodeWithSelection[]): FileNodeWithSelection[] => {
                      return nodes.map(node => {
                        if (node._hidden) return node;
                        return {
                          ...node,
                          selected: !!checked,
                          children: node.children ? updateAllNodes(node.children) : undefined
                        };
                      });
                    };
                    setSelectableTree(prevTree => updateAllNodes(prevTree));
                  }}
                />
                <Label htmlFor="select-all" className="text-sm cursor-pointer">
                  {t('codeview.globalAnalysis.execute.selectAll')}
                </Label>
              </div>
            </div>
            <div className="max-h-[300px] overflow-auto border rounded-md p-4">
              {filteredTree.map((node) => (
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
                  {currentStage === 'single' ? (
                    <>
                      {Math.round(progress)}% {t('codeview.globalAnalysis.execute.analyzingFiles')}
                    </>
                  ) : (
                    <>
                      {Math.round(progress)}% {t('codeview.globalAnalysis.execute.generatingSummary')}
                    </>
                  )}
                </div>
              </div>
            )}
            <Button onClick={handleExecute} className="w-full" disabled={isProcessing}>
              {isProcessing ? t('codeview.globalAnalysis.execute.processing') : t('codeview.globalAnalysis.execute.execute')}
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
