import React, { useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, MoveHorizontal } from 'lucide-react';

interface ImagePreviewProps {
  content: string;
  onClose: () => void;
}

export function ImagePreview({ content, onClose }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 5;
  const SCALE_STEP = 0.1;

  const handleZoom = useCallback((delta: number, mouseX?: number, mouseY?: number) => {
    setScale(prevScale => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prevScale + delta * SCALE_STEP));
      
      // 如果提供了鼠标位置，则以鼠标位置为中心进行缩放
      if (mouseX !== undefined && mouseY !== undefined) {
        const container = document.querySelector('.image-preview-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const x = mouseX - rect.left;
          const y = mouseY - rect.top;

          setPosition(prev => {
            const scaleChange = newScale - prevScale;
            return {
              x: prev.x - (x - rect.width / 2) * scaleChange / prevScale,
              y: prev.y - (y - rect.height / 2) * scaleChange / prevScale
            };
          });
        }
      }
      
      return newScale;
    });
  }, []);

  const handleZoomIn = () => handleZoom(1);
  const handleZoomOut = () => handleZoom(-1);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY);
    handleZoom(delta, e.clientX, e.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="relative bg-background rounded-lg w-[90vw] h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 工具栏 */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            title="放大 (滚轮向上)"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            title="缩小 (滚轮向下)"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            title="重置大小和位置"
          >
            <MoveHorizontal size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
            title="关闭 (ESC)"
          >
            <X size={16} />
          </button>
        </div>

        {/* 图片容器 */}
        <div 
          className="flex-1 overflow-hidden cursor-move image-preview-container"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.2s',
            }}
          >
            <div 
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>

        {/* 缩放信息 */}
        <div className="absolute bottom-2 left-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
} 