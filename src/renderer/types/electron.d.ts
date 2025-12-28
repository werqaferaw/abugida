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

export interface ActivationResult {
  success: boolean;
  error?: string;
}

export interface ActiveFont {
  fontId: string;
  weight: string;
  tempPath: string;
  registryName: string;
}

export interface ElectronAPI {
  auth: {
    login: (email: string, password: string) => Promise<AuthResult>;
    loginAsGuest: () => Promise<AuthResult>;
    signUp: (email: string, password: string) => Promise<AuthResult>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<User | null>;
  };
  fonts: {
    list: () => Promise<FontFamily[]>;
    getDetails: (fontId: string) => Promise<FontFamily>;
    getFile: (fontId: string, weight: string) => Promise<ArrayBuffer>;
    activate: (fontId: string, weight: string) => Promise<ActivationResult>;
    deactivate: (fontId: string, weight: string) => Promise<ActivationResult>;
    isActive: (fontId: string, weight: string) => Promise<boolean>;
    getActive: () => Promise<ActiveFont[]>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
