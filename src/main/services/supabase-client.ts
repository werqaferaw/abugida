import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase Client
 * 
 * Initializes and exports a Supabase client configured for the Electron app.
 * Credentials are loaded from environment variables (loaded by dotenv in index.ts)
 */

// Database types
export interface FontFamilyRow {
  id: string;
  name: string;
  designer: string | null;
  description: string | null;
  category: string;
  sample_text: string;
  created_at: string;
}

export interface FontWeightRow {
  id: string;
  family_id: string;
  weight: string;
  file_path: string;
  created_at: string;
}

export interface FontFamilyWithWeights extends FontFamilyRow {
  font_weights: FontWeightRow[];
}

// Supabase configuration
interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let supabaseClient: SupabaseClient | null = null;

/**
 * Load Supabase configuration from environment variables
 */
function loadConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Supabase configuration not found.\n\n' +
      'Please create a .env file in the project root with:\n' +
      '  SUPABASE_URL=https://your-project.supabase.co\n' +
      '  SUPABASE_ANON_KEY=your-anon-key\n\n' +
      'Or set these as environment variables.'
    );
  }

  return { url, anonKey };
}

/**
 * Get or create the Supabase client
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const config = loadConfig();
    supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseClient;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  try {
    loadConfig();
    return true;
  } catch {
    return false;
  }
}

