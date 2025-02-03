/**
 * 获取路径中的文件名
 * @param filePath 文件路径
 * @returns 文件名
 */
export function basename(filePath: string): string {
  if (!filePath) return '';
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1] || '';
}

/**
 * 获取路径中的目录名
 * @param filePath 文件路径
 * @returns 目录名
 */
export function dirname(filePath: string): string {
  if (!filePath) return '';
  const parts = filePath.split(/[\\/]/);
  return parts.slice(0, -1).join('/') || '';
}

/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 扩展名（包含点号）
 */
export function extname(filePath: string): string {
  if (!filePath) return '';
  const base = basename(filePath);
  const dot = base.lastIndexOf('.');
  return dot === -1 ? '' : base.slice(dot);
}

/**
 * 连接路径片段
 * @param paths 路径片段
 * @returns 连接后的路径
 */
export function join(...paths: string[]): string {
  return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
}

/**
 * 计算相对路径
 * @param from 起始路径（通常是项目根目录）
 * @param to 目标路径
 * @returns 相对路径
 */
export function relative(from: string, to: string): string {
  if (!from || !to) return to || '';
  
  // 标准化路径分隔符
  const fromParts = from.replace(/\\/g, '/').split('/');
  const toParts = to.replace(/\\/g, '/').split('/');

  // 找到第一个不同的部分
  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++;
  }

  // 构建相对路径
  const upCount = fromParts.length - i;
  const relativeParts = [...Array(upCount).fill('..'), ...toParts.slice(i)];
  
  return relativeParts.join('/');
}

export default {
  basename,
  dirname,
  extname,
  join,
  relative
}; 