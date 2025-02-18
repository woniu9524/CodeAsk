import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGlobalAnalysisStore, GlobalAnalysis } from "@/store/useGlobalAnalysisStore";
import { useModelStore } from "@/store/useModelStore";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

type GlobalAnalysisFormData = Omit<GlobalAnalysis, 'id' | 'isProjectAnalysis'>;

interface GlobalAnalysisEditDialogProps {
  children: React.ReactNode;
  analysis: GlobalAnalysis;
}

export function GlobalAnalysisEditDialog({ children, analysis }: GlobalAnalysisEditDialogProps) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control } = useForm<GlobalAnalysisFormData>({
    defaultValues: {
      name: analysis.name,
      singlePageAnalysis: {
        modelId: analysis.singlePageAnalysis.modelId,
        prompt: analysis.singlePageAnalysis.prompt,
      },
      summaryAnalysis: {
        modelId: analysis.summaryAnalysis.modelId,
        prompt: analysis.summaryAnalysis.prompt,
      },
    },
  });
  
  const { updateAnalysis } = useGlobalAnalysisStore();
  const { models } = useModelStore();
  const { t } = useTranslation();

  const onSubmit = (data: GlobalAnalysisFormData) => {
    updateAnalysis(analysis.id, {
      ...data,
      isProjectAnalysis: false
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{t('codeview.globalAnalysis.edit')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('codeview.globalAnalysis.name')}</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('codeview.globalAnalysis.singlePage.title')}</Label>
              
              <div className="space-y-2">
                <Label htmlFor="singlePageModelId">{t('codeview.globalAnalysis.singlePage.model')}</Label>
                <Controller
                  name="singlePageAnalysis.modelId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('codeview.globalAnalysis.selectModel')} />
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
                <Label htmlFor="singlePagePrompt">{t('codeview.globalAnalysis.singlePage.prompt')}</Label>
                <Textarea
                  id="singlePagePrompt"
                  rows={6}
                  {...register("singlePageAnalysis.prompt", { required: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('codeview.globalAnalysis.summary.title')}</Label>
              
              <div className="space-y-2">
                <Label htmlFor="summaryModelId">{t('codeview.globalAnalysis.summary.model')}</Label>
                <Controller
                  name="summaryAnalysis.modelId"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('codeview.globalAnalysis.selectModel')} />
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
                <Label htmlFor="summaryPrompt">{t('codeview.globalAnalysis.summary.prompt')}</Label>
                <Textarea
                  id="summaryPrompt"
                  rows={6}
                  {...register("summaryAnalysis.prompt", { required: true })}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {analysis.isProjectAnalysis && (
              <Button 
                type="submit" 
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  const formData = {
                    name: analysis.name,
                    singlePageAnalysis: {
                      modelId: analysis.singlePageAnalysis.modelId,
                      prompt: analysis.singlePageAnalysis.prompt,
                    },
                    summaryAnalysis: {
                      modelId: analysis.summaryAnalysis.modelId,
                      prompt: analysis.summaryAnalysis.prompt,
                    },
                  };
                  updateAnalysis(analysis.id, {
                    ...formData,
                    isProjectAnalysis: false
                  });
                  setOpen(false);
                }}
              >
                {t('codeview.globalAnalysis.convertToMine')}
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {t('codeview.globalAnalysis.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 