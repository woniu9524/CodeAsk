import React from "react";
import Footer from "@/components/template/Footer";
import { useTranslation } from "react-i18next";
import { useModelStore } from "@/store/useModelStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";
import { ModelConfigDialog } from "@/components/settings/ModelConfigDialog";

export default function SettingPage() {
  const { t } = useTranslation();
  const { models, toggleModel } = useModelStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 p-6 space-y-6">

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">模型设置</h2>
            <ModelConfigDialog>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                添加模型
              </Button>
            </ModelConfigDialog>
          </div>

          <div className="grid gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">{model.name}</CardTitle>
                    <CardDescription>{model.baseUrl}</CardDescription>
                  </div>
                  <Switch
                    checked={model.enabled}
                    onCheckedChange={() => toggleModel(model.id)}
                  />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
      </div>
      <Footer />
    </div>
  );
}
