import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

/**
 * State Manager
 * 
 * Persists minimal application state:
 * - Current user session
 * 
 * NOTE: Activated fonts are NOT persisted - they're session-only
 * and tracked in memory by the font-activator service.
 * 
 * State is stored in %APPDATA%/abugida/state.json
 */

interface User {
  email: string;
}

interface AppState {
  user: User | null;
}

const DEFAULT_STATE: AppState = {
  user: null,
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
