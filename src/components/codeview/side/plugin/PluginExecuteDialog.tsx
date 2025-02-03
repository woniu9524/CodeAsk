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
import { getFileHash } from "@/helpers/file_helpers";
import type { FileNode } from '@/components/codeview/side/FileTree';

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
  
  const [selectableTree, setSelectableTree] = useState<FileNodeWithSelection[]>([]);
  const [fileExtensions, setFileExtensions] = useState("");
  const [displayMode, setDisplayMode] = useState<FileDisplayMode>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});

  // 获取所有文件的哈希值
  const updateFileHashes = async (nodes: FileNodeWithSelection[]) => {
    const newHashes: Record<string, string> = {};
    const processNode = async (node: FileNodeWithSelection) => {
      if (node.type === 'file') {
        try {
          newHashes[node.id] = await getFileHash(node.id);
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

      const processedFile = execution.files.find(f => f.filename === node.id);
      const isProcessed = !!processedFile;
      const currentHash = fileHashes[node.id];
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
          return {
            ...node,
            selected,
            children: node.children?.map(child => ({
              ...child,
              selected,
              children: child.children?.map(grandChild => ({
                ...grandChild,
                selected
              }))
            }))
          };
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
    const selectedFiles = getSelectedFiles(selectableTree);
    const extensions = fileExtensions.split(',').map(ext => ext.trim()).filter(Boolean);
    
    const rules = {
      fileExtensions: extensions,
      showProcessed: displayMode === "all",
      showUpdated: displayMode === "unprocessed_and_updated"
    };

    // 获取所有选中文件的哈希值
    const processedFiles = await Promise.all(
      selectedFiles.map(async filename => ({
        filename,
        fileHash: await getFileHash(filename),
        result: "处理结果示例",
        status: "success" as const
      }))
    );
    
    const execution = {
      pluginName,
      rules,
      files: processedFiles
    };

    await savePluginExecution(pluginId, execution);
    setIsOpen(false);
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
                    <SelectItem value="unprocessed">显示未处理</SelectItem>
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

          <Button onClick={handleExecute} className="w-full">
            执行
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 