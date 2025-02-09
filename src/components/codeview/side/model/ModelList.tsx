import React from "react";
import { useModelStore } from "@/store/useModelStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { ModelConfigDialog } from "./ModelConfigDialog";
import { ModelEditDialog } from "./ModelEditDialog";
import { useTranslation } from "react-i18next";

export default function ModelList() {
  const { models, toggleModel, deleteModel } = useModelStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <h2 className="text-sm font-semibold">{t('codeview.model.title')}</h2>
        <ModelConfigDialog>
          <Button variant="ghost" size="icon" className="h-7 w-7" title={t('codeview.model.add')}>
            <PlusCircle className="h-4 w-4" />
          </Button>
        </ModelConfigDialog>
      </div>

      <div className="space-y-1">
        {models.map((model) => (
          <div
            key={model.id}
            className="group flex flex-col px-2 py-1.5 hover:bg-accent/50 rounded-md"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{model.name}</div>
              </div>
              <div className="flex items-center gap-0.5 ml-2">
                <div className="hidden group-hover:flex gap-0.5">
                  <ModelEditDialog model={model}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={t('codeview.model.edit')}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </ModelEditDialog>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => deleteModel(model.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
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