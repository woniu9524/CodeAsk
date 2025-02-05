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
    setLoadError(false);
    import(`@/assets/icons/${name}.svg`)
      .then((module) => {
        setSvgUrl(module.default);
      })
      .catch((error) => {
        console.error(`Failed to load icon: ${name}`, error);
        setLoadError(true);
      });
  }, [name]);

  const spinStyle = spin ? { animation: 'spin 1s linear infinite' } : {};
  const rotateStyle = rotate ? { transform: `rotate(${rotate}deg)` } : {};
  const combinedStyle = { ...style, ...spinStyle, ...rotateStyle };

  if (loadError) {
    return <FileIcon className={className} style={combinedStyle} width={size} height={size} onClick={onClick} />;
  }

  return svgUrl ? (
    <img
      src={svgUrl}
      className={className}
      width={size}
      height={size}
      style={combinedStyle}
      onClick={onClick}
      alt={`${name} icon`}
    />
  ) : (
    <FileIcon className={className} style={combinedStyle} width={size} height={size} onClick={onClick} />
  );
}
