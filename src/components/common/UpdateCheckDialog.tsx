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

// 定义更新信息的接口，描述每个版本的更新详情
interface UpdateInfo {
  version: string;        // 版本号
  release_date: string;   // 发布日期
  changes: {              // 变更日志
    type: string;         // 变更类型（如 Feature, Fix）
    description: string;  // 变更描述
    color: string;        // 用于显示的颜色
  }[];
  download_link: string;  // 下载链接
}

// 组件属性接口
interface Props {
  open: boolean;                       // 对话框是否打开
  onOpenChange: (open: boolean) => void; // 对话框开关状态变更回调
  currentVersion: string;               // 当前应用版本
  updateLogs: UpdateInfo[];             // 更新日志数组
}

// 更新检查对话框组件
export default function UpdateCheckDialog({ 
  open, 
  onOpenChange, 
  currentVersion, 
  updateLogs 
}: Props) {
  // 使用国际化翻译钩子
  const { t } = useTranslation();
  
  // 获取最新版本号，如果没有更新日志则使用当前版本
  const latestVersion = updateLogs[0]?.version || currentVersion;
  
  // 判断是否有可用更新
  const hasUpdate = latestVersion !== currentVersion;
  
  // 筛选出比当前版本更新的日志
  const relevantLogs = updateLogs.filter(log => {
    return log.version > currentVersion;
  });

  // 处理下载最新版本的函数
  const handleDownload = async () => {
    // 如果存在下载链接，则打开外部链接
    if (updateLogs[0]?.download_link) {
      await openExternalUrl(updateLogs[0].download_link);
    }
  };

  return (
    // 使用可配置的对话框组件
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[60vh] overflow-y-auto">
        <DialogHeader>
          {/* 对话框标题，使用国际化翻译 */}
          <DialogTitle>{t('dialog.updateCheck.title')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 版本信息区域 */}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              {/* 显示当前版本和最新版本 */}
              <p>{t('dialog.updateCheck.currentVersion')}: {currentVersion}</p>
              <p>{t('dialog.updateCheck.latestVersion')}: {latestVersion}</p>
            </div>
            
            {/* 如果有更新，显示下载按钮 */}
            {hasUpdate && (
              <Button onClick={handleDownload} variant="default">
                {t('dialog.updateCheck.download')}
              </Button>
            )}
          </div>
          
          {/* 如果没有更新，显示已是最新版本的提示 */}
          {!hasUpdate && (
            <p className="text-green-500">{t('dialog.updateCheck.upToDate')}</p>
          )}

          {/* 如果有更新，显示详细的更新日志 */}
          {hasUpdate && (
            <div className="space-y-4">
              <h3 className="font-semibold">{t('dialog.updateCheck.changelog')}</h3>
              {/* 遍历相关的更新日志 */}
              {relevantLogs.map((log, index) => (
                <div key={index} className="border rounded-lg p-4">
                  {/* 显示版本号和发布日期 */}
                  <div className="font-medium mb-2">
                    {log.version} - {log.release_date}
                  </div>
                  
                  {/* 显示具体的变更内容 */}
                  <div className="space-y-2">
                    {log.changes.map((change, changeIndex) => (
                      <div
                        key={changeIndex}
                        className="flex items-start gap-2"
                      >
                        {/* 变更类型标签，使用不同颜色区分 */}
                        <span
                          className="px-2 py-1 rounded text-sm"
                          style={{ backgroundColor: change.color + '20', color: change.color }}
                        >
                          {change.type}
                        </span>
                        {/* 变更描述 */}
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