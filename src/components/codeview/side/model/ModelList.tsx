import React from "react";
// 导入模型状态管理 hook
import { useModelStore } from "@/store/useModelStore";
// 导入 UI 组件
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
// 导入图标
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
// 导入模型配置和编辑对话框组件
import { ModelConfigDialog } from "./ModelConfigDialog";
import { ModelEditDialog } from "./ModelEditDialog";
// 导入国际化翻译 hook
import { useTranslation } from "react-i18next";

// 模型列表组件：展示和管理模型配置
export default function ModelList() {
  // 从模型状态管理 hook 中解构方法和状态
  const { models, toggleModel, deleteModel } = useModelStore();
  // 使用国际化翻译 hook
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {/* 标题和添加模型按钮区域 */}
      <div className="flex items-center justify-between px-2 py-1">
        {/* 显示模型列表标题，支持国际化 */}
        <h2 className="text-sm font-semibold">{t('codeview.model.title')}</h2>
        
        {/* 模型配置对话框，点击可添加新模型 */}
        <ModelConfigDialog>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            title={t('codeview.model.add')}
          >
            {/* 添加模型的加号图标 */}
            <PlusCircle className="h-4 w-4" />
          </Button>
        </ModelConfigDialog>
      </div>

      {/* 模型列表容器 */}
      <div className="space-y-1">
        {/* 遍历并渲染所有模型 */}
        {models.map((model) => (
          <div
            key={model.id}
            // 使用 group 类实现 hover 效果
            className="group flex flex-col px-2 py-1.5 hover:bg-accent/50 rounded-md"
          >
            <div className="flex items-center justify-between">
              {/* 模型名称显示区域 */}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{model.name}</div>
              </div>

              {/* 模型操作区域：编辑、删除和启用/禁用开关 */}
              <div className="flex items-center gap-0.5 ml-2">
                {/* 仅在 hover 时显示的编辑和删除按钮 */}
                <div className="hidden group-hover:flex gap-0.5">
                  {/* 模型编辑对话框 */}
                  <ModelEditDialog model={model}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      title={t('codeview.model.edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </ModelEditDialog>

                  {/* 删除模型按钮 */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => deleteModel(model.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                {/* 模型启用/禁用开关 */}
                <Switch
                  className="ml-0.5"
                  checked={model.enabled}
                  onCheckedChange={() => toggleModel(model.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 