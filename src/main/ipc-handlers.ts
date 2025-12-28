import { ipcMain } from 'electron';
import * as authService from './services/auth-service';
import * as fontService from './services/font-service';
import * as fontActivator from './services/font-activator';

export function registerIpcHandlers() {
  // Auth handlers
  ipcMain.handle('auth:login', async (_event, email: string, password: string) => {
    return authService.login(email, password);
  });

  ipcMain.handle('auth:loginAsGuest', async () => {
    return authService.loginAsGuest();
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

  // Font activation handlers (replaces install handlers)
  ipcMain.handle('fonts:activate', async (_event, fontId: string, weight: string) => {
    return fontActivator.activate(fontId, weight);
  });

  ipcMain.handle('fonts:deactivate', async (_event, fontId: string, weight: string) => {
    return fontActivator.deactivate(fontId, weight);
  });

  ipcMain.handle('fonts:isActive', async (_event, fontId: string, weight: string) => {
    return fontActivator.isActive(fontId, weight);
  });

  ipcMain.handle('fonts:getActive', async () => {
    return fontActivator.getActiveFonts();
  });
}
