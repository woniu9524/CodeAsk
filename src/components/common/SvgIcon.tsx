import React from 'react';
import { FileIcon } from 'lucide-react';

interface SvgIconProps {
  name: string; // 文件名
  className?: string;
  size?: number | string;
  color?: string;
  style?: React.CSSProperties;
  rotate?: number; // 旋转角度
  spin?: boolean; // 是否旋转动画
  onClick?: () => void;
}

export default function SvgIcon({
  name,
  className = '',
  size = 24,
  style,
  rotate,
  spin,
  onClick,
}: SvgIconProps) {
  const [svgUrl, setSvgUrl] = React.useState<string>('');
  const [loadError, setLoadError] = React.useState(false);

  React.useEffect(() => {
    // Reset error state
    setLoadError(false);
    setSvgUrl('');

    // Only attempt to load if name is provided
    if (!name) {
      setLoadError(true);
      return;
    }

    // Dynamic import with error handling
    import(`../assets/icons/${name}.svg`)
      .then((module) => {
        setSvgUrl(module.default);
      })
      .catch((error) => {
        console.warn(`Icon not found: ${name}, using default file icon`);
        setLoadError(true);
      });
  }, [name]);

  const spinStyle = spin ? { animation: 'spin 1s linear infinite' } : {};
  const rotateStyle = rotate ? { transform: `rotate(${rotate}deg)` } : {};
  const combinedStyle = { ...style, ...spinStyle, ...rotateStyle };

  // Show FileIcon as fallback
  if (loadError || !svgUrl) {
    return <FileIcon className={className} style={combinedStyle} width={size} height={size} onClick={onClick} />;
  }

  return (
    <img
      src={svgUrl}
      className={className}
      width={size}
      height={size}
      style={combinedStyle}
      onClick={onClick}
      alt={`${name} icon`}
    />
  );
}
