import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import * as fontService from './font-service';
import * as stateManager from './state-manager';

/**
 * Windows Font Installer
 * 
 * Installs fonts per-user (no admin required) using:
 * - %LOCALAPPDATA%\Microsoft\Windows\Fonts for font files
 * - HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts for registry
 * 
 * This approach works on Windows 10 1809+ without elevation.
 */

const execAsync = promisify(exec);

interface InstallResult {
  success: boolean;
  error?: string;
}

// Get the Windows per-user fonts directory
function getUserFontsDir(): string {
  return path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts');
}

// Get the font filename as it will be stored in Windows
function getInstalledFontFilename(fontId: string, weight: string): string {
  return `${fontId}-${weight}.ttf`;
}

// Registry key path for user fonts
const FONTS_REGISTRY_KEY = 'HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts';

/**
 * Install a font to Windows (per-user installation)
 */
export async function installFont(fontId: string, weight: string): Promise<InstallResult> {
  try {
    // Get font metadata for display name
    const fontDetails = await fontService.getFontDetails(fontId);
    const displayName = fontService.getFontDisplayName(fontDetails.name, weight);
    
    // Get font file from Font Service
    const fontData = await fontService.getFontFile(fontId, weight);
    
    // Ensure user fonts directory exists
    const fontsDir = getUserFontsDir();
    await fs.mkdir(fontsDir, { recursive: true });
    
    // Write font file to user fonts directory
    const fontFilename = getInstalledFontFilename(fontId, weight);
    const fontPath = path.join(fontsDir, fontFilename);
    await fs.writeFile(fontPath, fontData);
    
    // Add to Windows registry
    // The value format is: "Font Display Name (TrueType)" = "filename.ttf"
    const registryName = `${displayName} (TrueType)`;
    const command = `reg add "${FONTS_REGISTRY_KEY}" /v "${registryName}" /t REG_SZ /d "${fontPath}" /f`;
    
    await execAsync(command);
    
    // Track in state manager
    await stateManager.addInstalledFont(fontId, weight);
    
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error during installation';
    console.error('Font installation error:', error);
    return { success: false, error };
  }
}

/**
 * Uninstall a font from Windows
 */
export async function uninstallFont(fontId: string, weight: string): Promise<InstallResult> {
  try {
    // Get font metadata for registry removal
    const fontDetails = await fontService.getFontDetails(fontId);
    const displayName = fontService.getFontDisplayName(fontDetails.name, weight);
    
    // Remove from Windows registry
    const registryName = `${displayName} (TrueType)`;
    const command = `reg delete "${FONTS_REGISTRY_KEY}" /v "${registryName}" /f`;
    
    try {
      await execAsync(command);
    } catch {
      // Registry entry might not exist, continue with file deletion
    }
    
    // Delete font file from user fonts directory
    const fontsDir = getUserFontsDir();
    const fontFilename = getInstalledFontFilename(fontId, weight);
    const fontPath = path.join(fontsDir, fontFilename);
    
    try {
      await fs.unlink(fontPath);
    } catch {
      // File might not exist
    }
    
    // Remove from state manager
    await stateManager.removeInstalledFont(fontId, weight);
    
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error during uninstallation';
    console.error('Font uninstallation error:', error);
    return { success: false, error };
  }
}

/**
 * Check if a font is currently installed
 */
export async function isInstalled(fontId: string, weight: string): Promise<boolean> {
  // Check both the file existence and our tracked state
  const fontsDir = getUserFontsDir();
  const fontFilename = getInstalledFontFilename(fontId, weight);
  const fontPath = path.join(fontsDir, fontFilename);
  
  try {
    await fs.access(fontPath);
    return true;
  } catch {
    // File doesn't exist, also ensure our state is updated
    const isTracked = await stateManager.isTrackedAsInstalled(fontId, weight);
    if (isTracked) {
      // State says installed but file is gone - clean up state
      await stateManager.removeInstalledFont(fontId, weight);
    }
    return false;
  }
}

/**
 * Get list of all installed fonts
 */
export async function getInstalledFonts(): Promise<{ fontId: string; weight: string }[]> {
  const tracked = await stateManager.getInstalledFonts();
  const verified: { fontId: string; weight: string }[] = [];
  
  // Verify each tracked font still exists
  for (const font of tracked) {
    const installed = await isInstalled(font.fontId, font.weight);
    if (installed) {
      verified.push({ fontId: font.fontId, weight: font.weight });
    }
  }
  
  return verified;
}




