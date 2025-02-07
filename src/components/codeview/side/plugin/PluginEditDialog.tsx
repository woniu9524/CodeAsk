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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const onSubmit = (data: PluginFormData) => {
    updatePlugin(plugin.id, data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('codeview.plugin.edit')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('codeview.plugin.name')}</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="modelId">{t('codeview.plugin.model')}</Label>
            <Controller
              name="modelId"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('codeview.plugin.selectModel')} />
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
            <Label htmlFor="systemPrompt">{t('codeview.plugin.systemPrompt')}</Label>
            <Textarea
              id="systemPrompt"
              rows={10}
              {...register("systemPrompt", { required: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userPrompt">{t('codeview.plugin.userPrompt')}</Label>
            <Textarea
              id="userPrompt"
              rows={6}
              {...register("userPrompt", { required: true })}
            />
          </div>

          <Button type="submit" className="w-full">{t('codeview.plugin.save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 