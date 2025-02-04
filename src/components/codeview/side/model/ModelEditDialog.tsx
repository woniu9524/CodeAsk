import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModelStore, ModelConfig } from "@/store/useModelStore";
import { useForm } from "react-hook-form";

type ModelFormData = Omit<ModelConfig, 'id' | 'enabled'>;

interface ModelEditDialogProps {
  children: React.ReactNode;
  model: ModelConfig;
}

export function ModelEditDialog({ children, model }: ModelEditDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit } = useForm<ModelFormData>({
    defaultValues: {
      name: model.name,
      apiKey: model.apiKey,
      baseUrl: model.baseUrl,
      temperature: model.temperature,
      maxContextTokens: model.maxContextTokens,
      maxOutputTokens: model.maxOutputTokens,
      concurrency: model.concurrency ?? 1,
    },
  });
  
  const { updateModel } = useModelStore();

  const onSubmit = (data: ModelFormData) => {
    updateModel(model.id, data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑模型</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">模型名称</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input id="apiKey" type="password" {...register("apiKey", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input id="baseUrl" {...register("baseUrl", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">温度</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              {...register("temperature", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxContextTokens">最大上下文Token数</Label>
            <Input
              id="maxContextTokens"
              type="number"
              {...register("maxContextTokens", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxOutputTokens">最大输出Token数</Label>
            <Input
              id="maxOutputTokens"
              type="number"
              {...register("maxOutputTokens", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="concurrency">并发数</Label>
            <Input
              id="concurrency"
              type="number"
              min="1"
              {...register("concurrency", {
                required: true,
                valueAsNumber: true,
                min: 1,
              })}
            />
          </div>
          <Button type="submit" className="w-full">保存</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 