import React, { useEffect, useState } from "react";
import { readTextFile } from "@/helpers/file_helpers";
import { join } from "@/utils/path";
import { useTranslation } from "react-i18next";
import { GlobalAnalysisResult } from "@/store/useGlobalAnalysisExecutionStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownPreview } from "@/components/codeview/preview/MarkdownPreview";
import { useFileStore } from "@/store/useFileStore";

interface GlobalAnalysisData {
  globalAnalysis?: {
    results?: Record<string, GlobalAnalysisResult>;
  };
}

export default function GlobalAnalysisPage() {
  const { t } = useTranslation();
  const { currentFolderPath } = useFileStore();
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
          const results = Object.values(data.globalAnalysis.results);
          if (results.length > 0) {
            // Sort by timestamp and get the latest result
            const latestResult = results.sort((a, b) => b.timestamp - a.timestamp)[0];
            setSummary(latestResult.summary);
          } else {
            setSummary(t("codeview.globalAnalysis.noResults"));
          }
        } else {
          setSummary(t("codeview.globalAnalysis.noData"));
        }
      } catch (err) {
        console.error("Failed to load global analysis data:", err);
        setError(t("codeview.globalAnalysis.loadError"));
      }
    }
    loadAnalysisData();
  }, [t, currentFolderPath]);

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
