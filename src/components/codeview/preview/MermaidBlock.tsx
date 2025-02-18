import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, Download } from 'lucide-react';
import { ImagePreview } from '@/components/common/ImagePreview';

// Mermaid图表块的属性接口
interface MermaidBlockProps {
  children: React.ReactNode; // 接收Mermaid图表的文本内容
}

export function MermaidBlock({ children }: MermaidBlockProps) {
  // 生成唯一的ID，用于标识每个Mermaid图表
  const [id] = React.useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);
  
  // 控制图表是否放大的状态
  const [isZoomed, setIsZoomed] = useState(false);
  
  // 存储放大后的SVG内容
  const [zoomedSvg, setZoomedSvg] = useState<string>('');
  
  // 在组件挂载后初始化Mermaid
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  // 处理图表放大功能
  const handleZoom = () => {
    // 获取当前Mermaid图表的SVG元素
    const svgElement = document.getElementById(id)?.querySelector('svg');
    if (svgElement) {
      // 克隆SVG元素并设置为100%宽高，以便全屏显示
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      clonedSvg.style.width = '100%';
      clonedSvg.style.height = '100%';
      
      // 更新放大后的SVG内容并显示
      setZoomedSvg(clonedSvg.outerHTML);
      setIsZoomed(true);
    }
  };

  // 处理保存SVG图表功能
  const handleSave = async () => {
    try {
      // 获取当前Mermaid图表的SVG元素
      const svgElement = document.getElementById(id)?.querySelector('svg');
      if (!svgElement) return;

      // 将SVG转换为可下载的Blob对象
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

      // 创建并触发下载链接
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(svgBlob);
      downloadLink.download = `mermaid-diagram-${new Date().getTime()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // 清理下载链接和临时URL
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };
  
  return (
    <div className="relative group">
      {/* 悬停时显示的操作按钮 */}
      <div className="absolute right-2 top-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* 放大按钮 */}
        <button
          onClick={handleZoom}
          className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          title="查看图表"
        >
          <Maximize2 size={14} />
        </button>
        
        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          title="保存为SVG"
        >
          <Download size={14} />
        </button>
      </div>
      
      {/* 图表放大预览组件 */}
      {isZoomed && (
        <ImagePreview 
          content={zoomedSvg}
          onClose={() => setIsZoomed(false)}
        />
      )}

      {/* Mermaid图表容器 */}
      <div className="my-4 border border-border rounded-lg p-4 bg-muted">
        <div className="mermaid" id={id}>
          {String(children)}
        </div>
      </div>
    </div>
  );
} 