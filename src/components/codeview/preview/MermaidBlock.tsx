import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, Download } from 'lucide-react';
import { ImagePreview } from '@/components/common/ImagePreview';

interface MermaidBlockProps {
  children: React.ReactNode;
}

export function MermaidBlock({ children }: MermaidBlockProps) {
  const [id] = React.useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomedSvg, setZoomedSvg] = useState<string>('');
  
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  const handleZoom = () => {
    const svgElement = document.getElementById(id)?.querySelector('svg');
    if (svgElement) {
      // Clone the SVG and set its dimensions to 100%
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      clonedSvg.style.width = '100%';
      clonedSvg.style.height = '100%';
      setZoomedSvg(clonedSvg.outerHTML);
      setIsZoomed(true);
    }
  };

  const handleSave = async () => {
    try {
      const svgElement = document.getElementById(id)?.querySelector('svg');
      if (!svgElement) return;

      // Get SVG content
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(svgBlob);
      downloadLink.download = `mermaid-diagram-${new Date().getTime()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadLink.href);
    } catch (error) {
      console.error('Error saving diagram:', error);
    }
  };
  
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleZoom}
          className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          title="查看图表"
        >
          <Maximize2 size={14} />
        </button>
        <button
          onClick={handleSave}
          className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          title="保存为SVG"
        >
          <Download size={14} />
        </button>
      </div>
      
      {isZoomed && (
        <ImagePreview 
          content={zoomedSvg}
          onClose={() => setIsZoomed(false)}
        />
      )}

      <div className="my-4 border border-border rounded-lg p-4 bg-muted">
        <div className="mermaid" id={id}>
          {String(children)}
        </div>
      </div>
    </div>
  );
} 