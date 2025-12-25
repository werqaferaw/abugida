import { ipcMain } from 'electron';
import * as authService from './services/auth-service';
import * as fontService from './services/font-service';
import * as fontInstaller from './services/font-installer';

export function registerIpcHandlers() {
  // Auth handlers
  ipcMain.handle('auth:login', async (_event, email: string, password: string) => {
    return authService.login(email, password);
  });

  ipcMain.handle('auth:signUp', async (_event, email: string, password: string) => {
    return authService.signUp(email, password);
  });

  ipcMain.handle('auth:logout', async () => {
    return authService.logout();
  });

  ipcMain.handle('auth:getCurrentUser', async () => {
    return authService.getCurrentUser();
  });

  // Font handlers
  ipcMain.handle('fonts:list', async () => {
    return fontService.getFonts();
  });

  ipcMain.handle('fonts:getDetails', async (_event, fontId: string) => {
    return fontService.getFontDetails(fontId);
  });

  ipcMain.handle('fonts:getFile', async (_event, fontId: string, weight: string) => {
    const buffer = await fontService.getFontFile(fontId, weight);
    // Convert Buffer to ArrayBuffer for IPC transfer
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  });

  // Install handlers
  ipcMain.handle('install:install', async (_event, fontId: string, weight: string) => {
    return fontInstaller.installFont(fontId, weight);
  });

  ipcMain.handle('install:uninstall', async (_event, fontId: string, weight: string) => {
    return fontInstaller.uninstallFont(fontId, weight);
  });

  ipcMain.handle('install:isInstalled', async (_event, fontId: string, weight: string) => {
    return fontInstaller.isInstalled(fontId, weight);
  });

  ipcMain.handle('install:list', async () => {
    return fontInstaller.getInstalledFonts();
  });
}
