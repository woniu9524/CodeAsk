import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

interface UpdateLogs {
  update_logs: UpdateInfo[];
}

// Helper function to compare version strings
function compareVersions(a: string, b: string) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0;
    const bVal = bParts[i] || 0;
    if (aVal !== bVal) {
      return bVal - aVal; // Sort in descending order (newest first)
    }
  }
  return 0;
}

export function useUpdateCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [updateLogs, setUpdateLogs] = useState<UpdateInfo[]>([]);
  const { i18n } = useTranslation();

  const checkForUpdates = async () => {
    setIsChecking(true);
    try {
      const language = i18n.language;
      const logFileName = language === 'en' ? 'update-logs-en.json' :
                         language === 'jp' ? 'update-logs-jp.json' :
                         'update-logs-zh.json';

      const response = await fetch(
        `https://raw.githubusercontent.com/woniu9524/CodeAsk/main/src/data/update-logs/${logFileName}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch update logs');
      }

      const data: UpdateLogs = await response.json();
      // Sort update logs by version number in descending order (newest first)
      const sortedLogs = [...data.update_logs].sort((a, b) => compareVersions(a.version, b.version));
      setUpdateLogs(sortedLogs);
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isChecking,
    updateLogs,
    checkForUpdates,
  };
}
