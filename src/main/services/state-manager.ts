import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

/**
 * State Manager
 * 
 * Persists application state including:
 * - Current user session
 * - List of installed fonts (by fontId + weight)
 * 
 * State is stored in %APPDATA%/abugida/state.json
 */

interface InstalledFont {
  fontId: string;
  weight: string;
  installedAt: string;
}

interface User {
  email: string;
}

interface AppState {
  user: User | null;
  installedFonts: InstalledFont[];
}

const DEFAULT_STATE: AppState = {
  user: null,
  installedFonts: [],
};

let cachedState: AppState | null = null;

function getStatePath(): string {
  return path.join(app.getPath('userData'), 'state.json');
}

async function ensureStateDir(): Promise<void> {
  const dir = path.dirname(getStatePath());
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // Directory already exists
  }
}

export async function loadState(): Promise<AppState> {
  if (cachedState) {
    return cachedState;
  }

  try {
    const content = await fs.readFile(getStatePath(), 'utf-8');
    cachedState = JSON.parse(content) as AppState;
    return cachedState;
  } catch {
    // State file doesn't exist or is invalid, use defaults
    cachedState = { ...DEFAULT_STATE };
    return cachedState;
  }
}

async function saveState(): Promise<void> {
  await ensureStateDir();
  await fs.writeFile(getStatePath(), JSON.stringify(cachedState, null, 2), 'utf-8');
}

// User session management
export async function setUser(user: User | null): Promise<void> {
  const state = await loadState();
  state.user = user;
  await saveState();
}

export async function getUser(): Promise<User | null> {
  const state = await loadState();
  return state.user;
}

// Installed fonts management
export async function addInstalledFont(fontId: string, weight: string): Promise<void> {
  const state = await loadState();
  
  // Check if already tracked
  const exists = state.installedFonts.some(
    f => f.fontId === fontId && f.weight === weight
  );
  
  if (!exists) {
    state.installedFonts.push({
      fontId,
      weight,
      installedAt: new Date().toISOString(),
    });
    await saveState();
  }
}

export async function removeInstalledFont(fontId: string, weight: string): Promise<void> {
  const state = await loadState();
  state.installedFonts = state.installedFonts.filter(
    f => !(f.fontId === fontId && f.weight === weight)
  );
  await saveState();
}

export async function getInstalledFonts(): Promise<InstalledFont[]> {
  const state = await loadState();
  return state.installedFonts;
}

export async function isTrackedAsInstalled(fontId: string, weight: string): Promise<boolean> {
  const state = await loadState();
  return state.installedFonts.some(
    f => f.fontId === fontId && f.weight === weight
  );
}




