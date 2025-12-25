import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Auth
  auth: {
    login: (email: string, password: string) => 
      ipcRenderer.invoke('auth:login', email, password),
    signUp: (email: string, password: string) => 
      ipcRenderer.invoke('auth:signUp', email, password),
    logout: () => 
      ipcRenderer.invoke('auth:logout'),
    getCurrentUser: () => 
      ipcRenderer.invoke('auth:getCurrentUser'),
  },

  // Fonts
  fonts: {
    list: () => 
      ipcRenderer.invoke('fonts:list'),
    getDetails: (fontId: string) => 
      ipcRenderer.invoke('fonts:getDetails', fontId),
    getFile: (fontId: string, weight: string) => 
      ipcRenderer.invoke('fonts:getFile', fontId, weight),
  },

  // Install
  install: {
    install: (fontId: string, weight: string) => 
      ipcRenderer.invoke('install:install', fontId, weight),
    uninstall: (fontId: string, weight: string) => 
      ipcRenderer.invoke('install:uninstall', fontId, weight),
    isInstalled: (fontId: string, weight: string) => 
      ipcRenderer.invoke('install:isInstalled', fontId, weight),
    list: () => 
      ipcRenderer.invoke('install:list'),
  },
});

// Type definitions for the exposed API
export interface ElectronAPI {
  auth: {
    login: (email: string, password: string) => Promise<{ success: boolean; user?: { email: string }; error?: string }>;
    signUp: (email: string, password: string) => Promise<{ success: boolean; user?: { email: string }; error?: string }>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<{ email: string } | null>;
  };
  fonts: {
    list: () => Promise<FontFamily[]>;
    getDetails: (fontId: string) => Promise<FontFamily>;
    getFile: (fontId: string, weight: string) => Promise<ArrayBuffer>;
  };
  install: {
    install: (fontId: string, weight: string) => Promise<{ success: boolean; error?: string }>;
    uninstall: (fontId: string, weight: string) => Promise<{ success: boolean; error?: string }>;
    isInstalled: (fontId: string, weight: string) => Promise<boolean>;
    list: () => Promise<{ fontId: string; weight: string }[]>;
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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
