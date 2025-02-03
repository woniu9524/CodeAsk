import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFileStore } from "@/store/useFileStore";
import { usePluginExecutionStore } from "@/store/usePluginExecutionStore";
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
  // 如果父节点被选中，当前节点也应该被选中
  const effectiveSelected = parentSelected || node.selected;

  return (
    <div className="pl-4">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={effectiveSelected}
          onCheckedChange={(checked) => onSelect(node, !!checked)}
        />
        <span>{node.name}</span>
      </div>
      {node.type === 'directory' && node.children && (
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

  useEffect(() => {
    if (isOpen && currentFolderPath) {
      // 初始化数据文件
      initializeDataFile(currentFolderPath);
      
      // 转换文件树
      const newTree = fileTree.map(convertToSelectableTree);
      setSelectableTree(newTree);

      // 加载插件历史配置
      const execution = getPluginExecution(pluginId);
      if (execution) {
        setFileExtensions(execution.rules.fileExtensions.join(','));
        // 根据历史配置设置显示模式
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
            // 更新父节点状态：如果所有子节点都被选中，父节点也被选中
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
    
    // 根据显示模式设置规则
    const rules = {
      fileExtensions: extensions,
      showProcessed: displayMode === "all",
      showUpdated: displayMode === "unprocessed_and_updated"
    };
    
    const execution = {
      pluginName,
      rules,
      files: selectedFiles.map(filename => ({
        filename,
        fileHash: "mock-hash-" + Math.random(),
        result: "处理结果示例",
        status: "success" as const
      }))
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
              {selectableTree.map((node) => (
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