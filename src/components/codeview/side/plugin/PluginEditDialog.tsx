import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePluginStore, Plugin } from "@/store/usePluginStore";
import { useModelStore } from "@/store/useModelStore";
import { useForm, Controller } from "react-hook-form";

type PluginFormData = Omit<Plugin, 'id' | 'enabled'>;

interface PluginEditDialogProps {
  children: React.ReactNode;
  plugin: Plugin;
}

export function PluginEditDialog({ children, plugin }: PluginEditDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, reset, control } = useForm<PluginFormData>({
    defaultValues: {
      name: plugin.name,
      modelId: plugin.modelId,
      systemPrompt: plugin.systemPrompt,
      userPrompt: plugin.userPrompt,
    },
  });
  
  const { updatePlugin } = usePluginStore();
  const { models } = useModelStore();

  const onSubmit = (data: PluginFormData) => {
    updatePlugin(plugin.id, data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑插件</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">插件名称</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="modelId">使用模型</Label>
            <Controller
              name="modelId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.filter(m => m.enabled).map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">系统提示词</Label>
            <Textarea
              id="systemPrompt"
              rows={4}
              {...register("systemPrompt", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userPrompt">用户提示词</Label>
            <Textarea
              id="userPrompt"
              rows={4}
              {...register("userPrompt", { required: true })}
            />
          </div>

          <Button type="submit" className="w-full">保存</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 