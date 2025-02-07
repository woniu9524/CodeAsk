import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePluginStore } from "@/store/usePluginStore";
import { useTranslation } from "react-i18next";
import { ExternalLink, Eye, Loader2 } from "lucide-react";
import { openExternalUrl } from "@/helpers/window_helpers";
import { toast } from "sonner";

interface PromptTemplate {
  name: string;
  sort: number;
  systemPrompt: string;
  userPrompt: string;
}

interface PromptTemplatesDialogProps {
  children: React.ReactNode;
}

const TEMPLATE_URL = 'https://raw.githubusercontent.com/woniu9524/CodeAsk/main/src/data/prompt-templates.json';

export function PromptTemplatesDialog({ children }: PromptTemplatesDialogProps) {
  const { t } = useTranslation();
  const { addPlugin } = usePluginStore();
  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<Record<string, Record<string, PromptTemplate>>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(TEMPLATE_URL);
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error(t('codeview.promptTemplates.fetchError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [t]);

  const handleAddPlugin = (templateId: string, template: PromptTemplate) => {
    addPlugin({
      name: template.name,
      modelId: "", // 用户需要在添加后配置模型
      systemPrompt: template.systemPrompt,
      userPrompt: template.userPrompt,
    });
    toast.success(t('codeview.promptTemplates.addSuccess'));
    setOpen(false);
  };

  const openGitHubIssues = () => {
    openExternalUrl("https://github.com/woniu9524/CodeAsk/issues");
  };

  const handlePreview = (template: PromptTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[1000px] h-[700px] flex flex-col">
          <DialogHeader className="text-center">
            <DialogTitle>{t('codeview.promptTemplates.title')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col items-center mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <Tabs defaultValue="zh" className="w-full flex flex-col items-center">
                <TabsList>
                  <TabsTrigger value="zh">{t('codeview.promptTemplates.chinese')}</TabsTrigger>
                  <TabsTrigger value="en">{t('codeview.promptTemplates.english')}</TabsTrigger>
                  <TabsTrigger value="ja">{t('codeview.promptTemplates.japanese')}</TabsTrigger>
                </TabsList>

                {Object.entries(templates).map(([lang, langTemplates]) => (
                  <TabsContent key={lang} value={lang} className="w-full mt-4 h-[480px]">
                    <ScrollArea className="h-full pr-4">
                      <div className="grid grid-cols-3 gap-4">
                        {Object.entries<PromptTemplate>(langTemplates)
                          .sort(([, a], [, b]) => a.sort - b.sort)
                          .map(([templateId, template]) => (
                            <Card key={templateId} className="flex flex-col">
                              <CardContent className="flex-1 p-4">
                                <h3 className="font-medium mb-2">{template.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {template.systemPrompt}
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
                                  onClick={() => handleAddPlugin(templateId, template)}
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

          <div className="mt-auto pt-4 px-6 pb-6">
            <Button
              variant="outline"
              className="w-full transition-transform hover:scale-105 active:scale-95"
              onClick={openGitHubIssues}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('codeview.promptTemplates.sharePrompt')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t('codeview.promptTemplates.systemPrompt')}</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {previewTemplate?.systemPrompt}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('codeview.promptTemplates.userPrompt')}</h4>
              <div className="text-sm text-muted-foreground">
                {previewTemplate?.userPrompt}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 