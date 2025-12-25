export interface FontFamily {
  id: string;
  name: string;
  designer: string;
  description: string;
  category: string;
  weights: { weight: string; file: string }[];
  sampleText: string;
}

export interface User {
  email: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface InstallResult {
  success: boolean;
  error?: string;
}

export interface InstalledFont {
  fontId: string;
  weight: string;
}

export interface ElectronAPI {
  auth: {
    login: (email: string, password: string) => Promise<AuthResult>;
    signUp: (email: string, password: string) => Promise<AuthResult>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<User | null>;
  };
  fonts: {
    list: () => Promise<FontFamily[]>;
    getDetails: (fontId: string) => Promise<FontFamily>;
    getFile: (fontId: string, weight: string) => Promise<ArrayBuffer>;
  };
  install: {
    install: (fontId: string, weight: string) => Promise<InstallResult>;
    uninstall: (fontId: string, weight: string) => Promise<InstallResult>;
    isInstalled: (fontId: string, weight: string) => Promise<boolean>;
    list: () => Promise<InstalledFont[]>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
