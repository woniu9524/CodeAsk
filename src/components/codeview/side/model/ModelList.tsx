import React from "react";
import { useModelStore } from "@/store/useModelStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";
import { ModelConfigDialog } from "./ModelConfigDialog";

export default function ModelList() {
  const { models, toggleModel } = useModelStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">模型列表</h2>
        <ModelConfigDialog>
          <Button variant="ghost" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </ModelConfigDialog>
      </div>

      <div className="space-y-2">
        {models.map((model) => (
          <Card key={model.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm">{model.name}</CardTitle>
                <CardDescription className="text-xs">{model.baseUrl}</CardDescription>
              </div>
              <Switch
                checked={model.enabled}
                onCheckedChange={() => toggleModel(model.id)}
              />
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-xs">
                <div>
                  <span className="font-medium">温度：</span>
                  {model.temperature}
                </div>
                <div>
                  <span className="font-medium">最大上下文Token：</span>
                  {model.maxContextTokens}
                </div>
                <div>
                  <span className="font-medium">最大输出Token：</span>
                  {model.maxOutputTokens}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 