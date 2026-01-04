import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import * as fontService from './font-service';

/**
 * Font Activator - Session-Based Font Management
 * 
 * Temporarily activates fonts while the app is running.
 * Fonts are downloaded to temp directory and registered to Windows.
 * All fonts are deactivated and cleaned up when app closes.
 * 
 * Key differences from permanent installation:
 * - Uses temp directory: os.tmpdir()/abugida-fonts/
 * - Tracks in memory (Map), not persistent storage
 * - Cleanup on app exit (deactivateAll)
 * - Per-user registry (HKCU) - no admin required
 */

const execAsync = promisify(exec);

export interface ActiveFont {
  fontId: string;
  weight: string;
  tempPath: string;
  registryName: string;
}

interface ActivationResult {
  success: boolean;
  error?: string;
}

// Registry key path for user fonts
const FONTS_REGISTRY_KEY = 'HKCU\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts';

// In-memory tracking of active fonts (session-only)
const activeFonts = new Map<string, ActiveFont>();

// Temp directory for this session
let tempDir: string | null = null;

/**
 * Get or create the temp directory for font files
 */
function getTempDir(): string {
  if (!tempDir) {
    tempDir = path.join(os.tmpdir(), 'abugida-fonts');
  }
  return tempDir;
}

/**
 * Generate a unique key for tracking fonts
 */
function getFontKey(fontId: string, weight: string): string {
  return `${fontId}:${weight}`;
}

/**
 * Get the temp filename for a font
 * Uses unique timestamp to avoid file locking issues
 */
function getTempFontFilename(fontId: string, weight: string): string {
  const timestamp = Date.now();
  return `${fontId}-${weight}-${timestamp}.ttf`;
}

/**
 * Activate a font (download to temp + register to Windows)
 */
export async function activate(fontId: string, weight: string): Promise<ActivationResult> {
  const key = getFontKey(fontId, weight);
  
  // Check if already active
  if (activeFonts.has(key)) {
    return { success: true };
  }
  
  try {
    // Get font metadata for display name
    const fontDetails = await fontService.getFontDetails(fontId);
    const displayName = fontService.getFontDisplayName(fontDetails.name, weight);
    
    // Download font file from Supabase
    const fontData = await fontService.getFontFile(fontId, weight);
    
    // Ensure temp directory exists
    const tempDirectory = getTempDir();
    await fs.mkdir(tempDirectory, { recursive: true });
    
    // Write font file to temp directory with unique filename to avoid locks
    let fontFilename = getTempFontFilename(fontId, weight);
    let fontPath = path.join(tempDirectory, fontFilename);
    
    // Write the font file directly (unique filename avoids conflicts)
    // Use retry logic as fallback for any file system issues
    let retries = 3;
    let lastError: Error | null = null;
    while (retries > 0) {
      try {
        await fs.writeFile(fontPath, fontData); // Write with unique filename (avoids locks)
        break; // Success, exit retry loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const errorMsg = lastError.message;
        
        if (errorMsg.includes('EBUSY') || errorMsg.includes('resource busy') || errorMsg.includes('locked') || errorMsg.includes('EEXIST')) {
          retries--;
          if (retries > 0) {
            // Generate new unique filename for retry
            const newFontFilename = getTempFontFilename(fontId, weight);
            const newFontPath = path.join(tempDirectory, newFontFilename);
            fontPath = newFontPath; // Update path for next attempt
            await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay
          }
        } else {
          // Not a locking/exists error, don't retry
          throw lastError;
        }
      }
    }
    
    if (retries === 0 && lastError) {
      throw lastError;
    }
    
    // Register to Windows registry
    // The value format is: "Font Display Name (TrueType)" = "full-path-to-font.ttf"
    const registryName = `${displayName} (TrueType)`;
    const command = `reg add "${FONTS_REGISTRY_KEY}" /v "${registryName}" /t REG_SZ /d "${fontPath}" /f`;
    
    await execAsync(command);
    
    // Track in memory
    activeFonts.set(key, {
      fontId,
      weight,
      tempPath: fontPath,
      registryName,
    });
    
    // Font activated successfully
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error during activation';
    console.error('Font activation error:', error);
    return { success: false, error };
  }
}

/**
 * Deactivate a font (unregister from Windows + delete temp file)
 */
export async function deactivate(fontId: string, weight: string): Promise<ActivationResult> {
  const key = getFontKey(fontId, weight);
  const activeFont = activeFonts.get(key);
  
  if (!activeFont) {
    return { success: true }; // Not active, nothing to do
  }
  
  try {
    // Remove from Windows registry
    const command = `reg delete "${FONTS_REGISTRY_KEY}" /v "${activeFont.registryName}" /f`;
    
    try {
      await execAsync(command);
    } catch {
      // Registry entry might not exist, continue with cleanup
    }
    
    // Delete temp file
    try {
      await fs.unlink(activeFont.tempPath);
    } catch {
      // File might not exist
    }
    
    // Remove from memory tracking
    activeFonts.delete(key);
    
    // Font deactivated successfully
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error during deactivation';
    console.error('Font deactivation error:', error);
    return { success: false, error };
  }
}

/**
 * Deactivate all fonts and clean up temp directory
 * Called on app exit
 */
export async function deactivateAll(): Promise<void> {
  // Deactivate all fonts on cleanup
  
  // Deactivate each font
  const promises = Array.from(activeFonts.values()).map(font => 
    deactivate(font.fontId, font.weight)
  );
  
  await Promise.all(promises);
  
  // Clean up temp directory
  if (tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      // Temp directory cleaned
    } catch (err) {
      console.error('Error cleaning up temp directory:', err);
    }
  }
  
  activeFonts.clear();
}

/**
 * Check if a font is currently active
 */
export function isActive(fontId: string, weight: string): boolean {
  const key = getFontKey(fontId, weight);
  return activeFonts.has(key);
}

/**
 * Get list of all active fonts
 */
export function getActiveFonts(): ActiveFont[] {
  return Array.from(activeFonts.values());
}

