/**
 * 读取文本文件内容
 * @param filePath 文件路径
 * @returns 文件内容
 */
export async function readTextFile(filePath: string): Promise<string> {
  // @ts-ignore
  return await window.fileAPI.readTextFile(filePath);
}

/**
 * 写入文本文件
 * @param filePath 文件路径
 * @param content 文件内容
 */
export async function writeTextFile(filePath: string, content: string): Promise<void> {
  // @ts-ignore
  await window.fileAPI.writeTextFile(filePath, content);
}

/**
 * 获取文件的哈希值
 * @param filePath 文件路径
 * @returns 文件的 SHA-256 哈希值
 */
export async function getFileHash(filePath: string): Promise<string> {
  // @ts-ignore
  return await window.fileAPI.getFileHash(filePath);
} 