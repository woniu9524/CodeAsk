import React, { useEffect } from 'react';
import mermaid from 'mermaid';

interface MermaidBlockProps {
  children: React.ReactNode;
}

export function MermaidBlock({ children }: MermaidBlockProps) {
  const [id] = React.useState(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`);
  
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);
  
  return (
    <div className="my-4">
      <div className="mermaid" id={id}>
        {String(children)}
      </div>
    </div>
  );
} 