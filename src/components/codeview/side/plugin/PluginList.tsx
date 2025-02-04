import React from "react";
import { usePluginStore } from "@/store/usePluginStore";
import { useModelStore } from "@/store/useModelStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, PlayCircle, Pencil, Trash2 } from "lucide-react";
import { PluginConfigDialog } from "./PluginConfigDialog";
import { PluginExecuteDialog } from "./PluginExecuteDialog";
import { PluginEditDialog } from "./PluginEditDialog";
import { useTranslation } from "react-i18next";

export default function PluginList() {
  const { plugins, togglePlugin, deletePlugin } = usePluginStore();
  const { models } = useModelStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <h2 className="text-sm font-semibold">{t('codeview.plugin.title')}</h2>
        <PluginConfigDialog>
          <Button variant="ghost" size="icon" className="h-7 w-7" title={t('codeview.plugin.add')}>
            <PlusCircle className="h-4 w-4" />
          </Button>
        </PluginConfigDialog>
      </div>

      <div className="space-y-1">
        {plugins.map((plugin) => {
          const model = models.find((m) => m.id === plugin.modelId);
          return (
            <div
              key={plugin.id}
              className="group flex items-center justify-between px-2 py-1 hover:bg-accent/50 rounded-md"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{plugin.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {model?.name || t('codeview.plugin.unknownModel')}
                </div>
              </div>
              <div className="flex items-center gap-0.5 ml-2">
                <PluginExecuteDialog pluginId={plugin.id} pluginName={plugin.name}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </PluginExecuteDialog>
                <PluginEditDialog plugin={plugin}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" title={t('codeview.plugin.edit')}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </PluginEditDialog>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => deletePlugin(plugin.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                <Switch
                  className="ml-0.5"
                  checked={plugin.enabled}
                  onCheckedChange={() => togglePlugin(plugin.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}