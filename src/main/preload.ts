import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  auth: {
    login: (email: string, password: string) => 
      ipcRenderer.invoke('auth:login', email, password),
    loginAsGuest: () => 
      ipcRenderer.invoke('auth:loginAsGuest'),
    signUp: (email: string, password: string) => 
      ipcRenderer.invoke('auth:signUp', email, password),
    logout: () => 
      ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => 
      ipcRenderer.invoke('auth:getCurrentUser'),
  },

  // Fonts (includes both fetching and activation)
  fonts: {
    list: () => 
      ipcRenderer.invoke('fonts:list'),
    getDetails: (fontId: string) => 
      ipcRenderer.invoke('fonts:getDetails', fontId),
    getFile: (fontId: string, weight: string) => 
      ipcRenderer.invoke('fonts:getFile', fontId, weight),
    activate: (fontId: string, weight: string) => 
      ipcRenderer.invoke('fonts:activate', fontId, weight),
    deactivate: (fontId: string, weight: string) => 
      ipcRenderer.invoke('fonts:deactivate', fontId, weight),
    isActive: (fontId: string, weight: string) => 
      ipcRenderer.invoke('fonts:isActive', fontId, weight),
    getActive: () => 
      ipcRenderer.invoke('fonts:getActive'),
  },
});

// Type definitions for the exposed API
export interface ElectronAPI {
  auth: {
    login: (email: string, password: string) => Promise<{ success: boolean; user?: { email: string }; error?: string }>;
    loginAsGuest: () => Promise<{ success: boolean; user?: { email: string }; error?: string }>;
    signUp: (email: string, password: string) => Promise<{ success: boolean; user?: { email: string }; error?: string }>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<{ email: string } | null>;
  };
  fonts: {
    list: () => Promise<FontFamily[]>;
    getDetails: (fontId: string) => Promise<FontFamily>;
    getFile: (fontId: string, weight: string) => Promise<ArrayBuffer>;
    activate: (fontId: string, weight: string) => Promise<{ success: boolean; error?: string }>;
    deactivate: (fontId: string, weight: string) => Promise<{ success: boolean; error?: string }>;
    isActive: (fontId: string, weight: string) => Promise<boolean>;
    getActive: () => Promise<ActiveFont[]>;
  };
}

export interface FontFamily {
  id: string;
  name: string;
  designer: string;
  description: string;
  category: string;
  weights: { weight: string; file: string }[];
  sampleText: string;
}

export interface ActiveFont {
  fontId: string;
  weight: string;
  tempPath: string;
  registryName: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
