import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModelStore, ModelConfig } from "@/store/useModelStore";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const onSubmit = (data: ModelFormData) => {
    updateModel(model.id, data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('codeview.model.edit')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('codeview.model.name')}</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">{t('codeview.model.apiKey')}</Label>
            <Input id="apiKey" type="password" {...register("apiKey", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseUrl">{t('codeview.model.baseUrl')}</Label>
            <Input id="baseUrl" {...register("baseUrl", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">{t('codeview.model.temperature')}</Label>
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
            <Label htmlFor="maxContextTokens">{t('codeview.model.maxContextTokens')}</Label>
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
            <Label htmlFor="maxOutputTokens">{t('codeview.model.maxOutputTokens')}</Label>
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
            <Label htmlFor="concurrency">{t('codeview.model.concurrency')}</Label>
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
          <Button type="submit" className="w-full">{t('codeview.model.save')}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 