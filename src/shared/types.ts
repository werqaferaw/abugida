/**
 * Shared Types
 * 
 * Type definitions shared between main and renderer processes.
 * This prevents type duplication and keeps types in sync.
 */

export interface FontWeight {
  weight: string;
  file: string;
}

export interface FontFamily {
  id: string;
  name: string;
  designer: string;
  description: string;
  category: string;
  weights: FontWeight[];
  sampleText: string;
}

export interface User {
  email: string;
}

export interface ActiveFont {
  fontId: string;
  weight: string;
  tempPath: string;
  registryName: string;
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

