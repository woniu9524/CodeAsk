import React from "react";
import { usePluginStore } from "@/store/usePluginStore";
import { useModelStore } from "@/store/useModelStore";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, PlayCircle } from "lucide-react";
import { PluginConfigDialog } from "./PluginConfigDialog";
import { PluginExecuteDialog } from "./PluginExecuteDialog";

export default function PluginList() {
  const { plugins, togglePlugin } = usePluginStore();
  const { models } = useModelStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">插件列表</h2>
        <PluginConfigDialog>
          <Button variant="ghost" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </PluginConfigDialog>
      </div>

      <div className="space-y-2">
        {plugins.map((plugin) => {
          const model = models.find((m) => m.id === plugin.modelId);
          return (
            <div
              key={plugin.id}
              className="flex items-center justify-between rounded-lg border p-2"
            >
              <div className="space-y-1">
                <div className="font-medium">{plugin.name}</div>
                <div className="text-xs text-muted-foreground">
                  使用模型：{model?.name || "未知模型"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PluginExecuteDialog pluginId={plugin.id} pluginName={plugin.name}>
                  <Button variant="ghost" size="icon">
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </PluginExecuteDialog>
                <Switch
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