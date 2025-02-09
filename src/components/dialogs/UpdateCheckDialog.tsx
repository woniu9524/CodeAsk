import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { openExternalUrl } from "@/helpers/window_helpers";

interface UpdateInfo {
  version: string;
  release_date: string;
  changes: {
    type: string;
    description: string;
    color: string;
  }[];
  download_link: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVersion: string;
  updateLogs: UpdateInfo[];
}

export default function UpdateCheckDialog({ open, onOpenChange, currentVersion, updateLogs }: Props) {
  const { t } = useTranslation();
  
  const latestVersion = updateLogs[0]?.version || currentVersion;
  const hasUpdate = latestVersion !== currentVersion;
  
  // Filter logs between current version and latest version
  const relevantLogs = updateLogs.filter(log => {
    return log.version > currentVersion;
  });

  const handleDownload = async () => {
    if (updateLogs[0]?.download_link) {
      await openExternalUrl(updateLogs[0].download_link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[60vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('dialog.updateCheck.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p>{t('dialog.updateCheck.currentVersion')}: {currentVersion}</p>
              <p>{t('dialog.updateCheck.latestVersion')}: {latestVersion}</p>
            </div>
            {hasUpdate && (
              <Button onClick={handleDownload} variant="default">
                {t('dialog.updateCheck.download')}
              </Button>
            )}
          </div>
          
          {!hasUpdate && (
            <p className="text-green-500">{t('dialog.updateCheck.upToDate')}</p>
          )}

          {hasUpdate && (
            <div className="space-y-4">
              <h3 className="font-semibold">{t('dialog.updateCheck.changelog')}</h3>
              {relevantLogs.map((log, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-medium mb-2">
                    {log.version} - {log.release_date}
                  </div>
                  <div className="space-y-2">
                    {log.changes.map((change, changeIndex) => (
                      <div
                        key={changeIndex}
                        className="flex items-start gap-2"
                      >
                        <span
                          className="px-2 py-1 rounded text-sm"
                          style={{ backgroundColor: change.color + '20', color: change.color }}
                        >
                          {change.type}
                        </span>
                        <span>{change.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 