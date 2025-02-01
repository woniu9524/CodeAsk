/**
 * 获取路径中的文件名
 * @param filePath 文件路径
 * @returns 文件名
 */
export function basename(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || filePath;
}

/**
 * 获取路径中的目录名
 * @param filePath 文件路径
 * @returns 目录名
 */
export function dirname(filePath: string): string {
  return filePath.split(/[\\/]/).slice(0, -1).join('/');
}

/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 扩展名（包含点号）
 */
export function extname(filePath: string): string {
  const base = basename(filePath);
  const dot = base.lastIndexOf('.');
  return dot === -1 ? '' : base.slice(dot);
}

export default {
  basename,
  dirname,
  extname
}; 