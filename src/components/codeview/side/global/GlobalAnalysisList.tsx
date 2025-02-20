import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalAnalysisStore } from '@/store/useGlobalAnalysisStore';
import { useModelStore } from '@/store/useModelStore';
import { Button } from '@/components/ui/button';
import { PlusCircle, PlayCircle, Pencil, Trash2, Box, User, Sparkles } from 'lucide-react';
import { GlobalAnalysisConfigDialog } from './GlobalAnalysisConfigDialog';
import { GlobalAnalysisExecuteDialog } from './GlobalAnalysisExecuteDialog';
import { GlobalAnalysisEditDialog } from './GlobalAnalysisEditDialog';
import { GlobalAnalysisPromptTemplatesDialog } from './GlobalAnalysisPromptTemplatesDialog';
import { useNavigate } from '@tanstack/react-router';

export default function GlobalAnalysisList() {
  const { t } = useTranslation();
  const { analyses, deleteAnalysis } = useGlobalAnalysisStore();
  const { models } = useModelStore();
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 py-1">
        <h2 className="text-sm font-semibold">
          {t('codeview.sidebar.globalAnalysis')}
        </h2>
        <div className="flex items-center gap-1">
          <GlobalAnalysisPromptTemplatesDialog>
            <Button variant="ghost" size="icon" className="h-7 w-7" title={t('codeview.globalAnalysis.promptTemplates')}>
              <Sparkles className="h-4 w-4" />
            </Button>
          </GlobalAnalysisPromptTemplatesDialog>
          <GlobalAnalysisConfigDialog>
            <Button variant="ghost" size="icon" className="h-7 w-7" title={t('codeview.globalAnalysis.add')}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          </GlobalAnalysisConfigDialog>
        </div>
      </div>

      <div className="space-y-1">
        {analyses.map((analysis) => {
          const singlePageModel = models.find((m) => m.id === analysis.singlePageAnalysis.modelId);
          const summaryModel = models.find((m) => m.id === analysis.summaryAnalysis.modelId);
          
          return (
            <div
              key={analysis.id}
              className="group flex items-center justify-between px-2 py-1 hover:bg-accent/50 rounded-md cursor-pointer"
              onClick={() => navigate({ 
                to: "/global-analysis",
                search: { 
                  analysisId: analysis.id, 
                  refresh: Date.now().toString()
                },
                replace: true 
              })}
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate flex items-center gap-1">
                  {analysis.isProjectAnalysis ? (
                    <div title={t('codeview.globalAnalysis.projectAnalysis')}>
                      <Box className="h-4 w-4 text-blue-500" />
                    </div>
                  ) : (
                    <div title={t('codeview.globalAnalysis.myAnalysis')}>
                      <User className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                  {analysis.name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {t('codeview.globalAnalysis.models', {
                    single: singlePageModel?.name || t('codeview.globalAnalysis.unknownModel'),
                    summary: summaryModel?.name || t('codeview.globalAnalysis.unknownModel')
                  })}
                </div>
              </div>
              <div className="flex items-center gap-0.5 ml-2">
                <div className="hidden group-hover:flex gap-0.5">
                  <GlobalAnalysisExecuteDialog analysisId={analysis.id} analysisName={analysis.name}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  </GlobalAnalysisExecuteDialog>
                  <GlobalAnalysisEditDialog analysis={analysis}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      title={t('codeview.globalAnalysis.edit')}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </GlobalAnalysisEditDialog>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAnalysis(analysis.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 