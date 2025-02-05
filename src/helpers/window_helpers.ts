export async function minimizeWindow() {
  // @ts-ignore
  await window.electronWindow.minimize();
}
export async function maximizeWindow() {
  // @ts-ignore
  await window.electronWindow.maximize();
}
export async function closeWindow() {
  // @ts-ignore
  await window.electronWindow.close();
}

export async function openExternalUrl(url: string) {
  // @ts-ignore
  await window.electronWindow.openExternal(url);
}
