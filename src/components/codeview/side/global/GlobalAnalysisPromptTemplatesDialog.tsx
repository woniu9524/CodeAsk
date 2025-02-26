import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalAnalysisStore } from "@/store/useGlobalAnalysisStore";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";
import localTemplates from "@/data/global-analysis-templates.json";

const TEMPLATE_URL = 'https://raw.githubusercontent.com/woniu9524/CodeAsk/main/src/data/global-analysis-templates.json';

interface GlobalAnalysisPromptTemplate {
  name: string;
  singlePageAnalysis: {
    prompt: string;
  };
  summaryAnalysis: {
    prompt: string;
  };
}

interface TemplateData {
  [lang: string]: {
    [templateId: string]: GlobalAnalysisPromptTemplate;
  };
}

interface GlobalAnalysisPromptTemplatesDialogProps {
  children: React.ReactNode;
}

export function GlobalAnalysisPromptTemplatesDialog({ children }: GlobalAnalysisPromptTemplatesDialogProps) {
  const { t } = useTranslation();
  const { addAnalysis } = useGlobalAnalysisStore();
  const [previewTemplate, setPreviewTemplate] = useState<GlobalAnalysisPromptTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(TEMPLATE_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data: TemplateData = await response.json();
        setTemplates(data);
      } catch (err) {
        console.warn('Failed to fetch templates from GitHub, using local templates instead:', err);
        setError(null);
        setTemplates(localTemplates as TemplateData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleAddAnalysis = (templateId: string, template: GlobalAnalysisPromptTemplate) => {
    addAnalysis({
      name: template.name,
      singlePageAnalysis: {
        modelId: "", // 用户需要在添加后配置模型
        prompt: template.singlePageAnalysis.prompt,
      },
      summaryAnalysis: {
        modelId: "", // 用户需要在添加后配置模型
        prompt: template.summaryAnalysis.prompt,
      },
    });
    setOpen(false);
  };

  const handlePreview = (template: GlobalAnalysisPromptTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[1000px] h-[700px] flex flex-col">
          <DialogHeader className="text-center">
            <DialogTitle>{t('codeview.globalAnalysis.promptTemplates')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col items-center mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">
                {error}
              </div>
            ) : (
              <Tabs defaultValue="zh" className="w-full flex flex-col items-center">
                <TabsList>
                  <TabsTrigger value="zh">{t('codeview.promptTemplates.chinese')}</TabsTrigger>
                  <TabsTrigger value="en">{t('codeview.promptTemplates.english')}</TabsTrigger>
                  <TabsTrigger value="ja">{t('codeview.promptTemplates.japanese')}</TabsTrigger>
                </TabsList>

                {Object.entries(templates).map(([lang, langTemplates]) => (
                  <TabsContent key={lang} value={lang} className="w-full mt-4">
                    <ScrollArea className="h-[480px] pr-4">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(langTemplates).map(([templateId, template]) => (
                          <Card key={templateId} className="flex flex-col">
                            <CardContent className="flex-1 p-4">
                              <h3 className="font-medium mb-2">{template.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {template.singlePageAnalysis.prompt}
                              </p>
                            </CardContent>
                            <CardFooter className="flex gap-2 p-4 pt-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 transition-transform hover:scale-105 active:scale-95"
                                onClick={() => handlePreview(template)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {t('codeview.promptTemplates.preview')}
                              </Button>
                              <Button 
                                size="sm"
                                className="flex-1 transition-transform hover:scale-105 active:scale-95"
                                onClick={() => handleAddAnalysis(templateId, template)}
                              >
                                {t('codeview.promptTemplates.use')}
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t('codeview.globalAnalysis.singlePage.prompt')}</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {previewTemplate?.singlePageAnalysis.prompt}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('codeview.globalAnalysis.summary.prompt')}</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {previewTemplate?.summaryAnalysis.prompt}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 