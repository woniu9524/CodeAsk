import React, { useEffect, useState } from "react";
import { readTextFile } from "@/helpers/file_helpers";
import { join } from "@/utils/path";
import { useTranslation } from "react-i18next";
import { GlobalAnalysisResult } from "@/store/useGlobalAnalysisExecutionStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownPreview } from "@/components/codeview/preview/MarkdownPreview";
import { useFileStore } from "@/store/useFileStore";
import { useSearch } from '@tanstack/react-router';

interface GlobalAnalysisData {
  globalAnalysis?: {
    results?: Record<string, GlobalAnalysisResult>;
  };
}

export default function GlobalAnalysisPage() {
  const { t } = useTranslation();
  const { currentFolderPath } = useFileStore();
  const { analysisId, refresh } = useSearch({ from: '/global-analysis' });
  const [summary, setSummary] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function loadAnalysisData() {
      if (!currentFolderPath) {
        setSummary(t("codeview.globalAnalysis.noProject"));
        return;
      }

      try {
        const dataFilePath = join(currentFolderPath, ".codeaskdata");
        const content = await readTextFile(dataFilePath);
        const data: GlobalAnalysisData = JSON.parse(content);

        if (data.globalAnalysis?.results) {
          if (analysisId && data.globalAnalysis.results[analysisId]) {
            // 如果指定了analysisId，直接从results对象中获取
            setSummary(data.globalAnalysis.results[analysisId].summary);
          } else {
            // 否则获取最新的分析结果
            const results = Object.entries(data.globalAnalysis.results);
            if (results.length > 0) {
              const latestResult = results.reduce((latest, current) => {
                return latest[1].timestamp > current[1].timestamp ? latest : current;
              })[1];
              setSummary(latestResult.summary);
            } else {
              setSummary(t("codeview.globalAnalysis.execute.noResults"));
            }
          }
        } else {
          setSummary(t("codeview.globalAnalysis.execute.noData"));
        }
      } catch (err) {
        console.error("Failed to load global analysis data:", err);
        setError(t("codeview.globalAnalysis.execute.loadError"));
      }
    }
    loadAnalysisData();
  }, [t, currentFolderPath, analysisId, refresh]);

  return (
    <ScrollArea className="h-[calc(100vh-2rem)]">
      <div className="container mx-auto p-6 space-y-6">
        {error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          <div className="grid gap-6">
            <MarkdownPreview content={summary} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
