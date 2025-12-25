import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { getSupabase, isSupabaseConfigured, FontFamilyWithWeights } from './supabase-client';

/**
 * Font Service Abstraction
 * 
 * This is the ONLY module that knows where fonts are stored.
 * The rest of the app accesses fonts exclusively through these functions.
 * 
 * When Supabase is configured:
 * - Metadata is fetched from PostgreSQL database
 * - Font files are downloaded from Supabase Storage
 * 
 * When Supabase is NOT configured (local development):
 * - Falls back to reading from local font-repo/families/
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

// ============================================
// LOCAL FALLBACK FUNCTIONS
// ============================================

function getLocalFontRepoPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'font-repo', 'families');
  } else {
    return path.join(__dirname, '..', '..', '..', 'font-repo', 'families');
  }
}

async function getLocalFonts(): Promise<FontFamily[]> {
  const familiesPath = getLocalFontRepoPath();
  
  try {
    const entries = await fs.readdir(familiesPath, { withFileTypes: true });
    const families: FontFamily[] = [];
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const metadataPath = path.join(familiesPath, entry.name, 'metadata.json');
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent) as FontFamily;
          families.push(metadata);
        } catch (err) {
          console.warn(`Skipping font family ${entry.name}: no valid metadata.json`);
        }
      }
    }
    
    return families.sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Error reading local font families:', err);
    return [];
  }
}

async function getLocalFontDetails(fontId: string): Promise<FontFamily> {
  const familiesPath = getLocalFontRepoPath();
  const metadataPath = path.join(familiesPath, fontId, 'metadata.json');
  
  try {
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(metadataContent) as FontFamily;
  } catch (err) {
    throw new Error(`Font family not found: ${fontId}`);
  }
}

async function getLocalFontFile(fontId: string, weight: string): Promise<Buffer> {
  const familiesPath = getLocalFontRepoPath();
  const metadata = await getLocalFontDetails(fontId);
  const weightInfo = metadata.weights.find(w => w.weight === weight);
  
  if (!weightInfo) {
    throw new Error(`Weight "${weight}" not found for font "${fontId}"`);
  }
  
  const fontPath = path.join(familiesPath, fontId, weightInfo.file);
  
  try {
    return await fs.readFile(fontPath);
  } catch (err) {
    throw new Error(`Font file not found: ${fontPath}`);
  }
}

// ============================================
// SUPABASE FUNCTIONS
// ============================================

function mapSupabaseToFontFamily(row: FontFamilyWithWeights): FontFamily {
  return {
    id: row.id,
    name: row.name,
    designer: row.designer || 'Unknown',
    description: row.description || '',
    category: row.category,
    weights: row.font_weights.map(w => ({
      weight: w.weight,
      file: w.file_path,
    })),
    sampleText: row.sample_text,
  };
}

async function getSupabaseFonts(): Promise<FontFamily[]> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('font_families')
    .select(`
      *,
      font_weights (*)
    `)
    .order('name');
  
  if (error) {
    console.error('Supabase query error:', error);
    throw new Error('Failed to fetch fonts from server');
  }
  
  return (data as FontFamilyWithWeights[]).map(mapSupabaseToFontFamily);
}

async function getSupabaseFontDetails(fontId: string): Promise<FontFamily> {
  const supabase = getSupabase();
  
  const { data, error } = await supabase
    .from('font_families')
    .select(`
      *,
      font_weights (*)
    `)
    .eq('id', fontId)
    .single();
  
  if (error) {
    console.error('Supabase query error:', error);
    throw new Error(`Font family not found: ${fontId}`);
  }
  
  return mapSupabaseToFontFamily(data as FontFamilyWithWeights);
}

async function getSupabaseFontFile(fontId: string, weight: string): Promise<Buffer> {
  const supabase = getSupabase();
  
  // First get the file path from the database
  const { data: weightData, error: weightError } = await supabase
    .from('font_weights')
    .select('file_path')
    .eq('family_id', fontId)
    .eq('weight', weight)
    .single();
  
  if (weightError || !weightData) {
    throw new Error(`Weight "${weight}" not found for font "${fontId}"`);
  }
  
  // Download the font file from storage
  const { data, error } = await supabase
    .storage
    .from('fonts')
    .download(weightData.file_path);
  
  if (error) {
    console.error('Supabase storage error:', error);
    throw new Error(`Failed to download font file: ${weightData.file_path}`);
  }
  
  // Convert Blob to Buffer
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Get all available font families
 */
export async function getFonts(): Promise<FontFamily[]> {
  if (isSupabaseConfigured()) {
    try {
      return await getSupabaseFonts();
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local:', err);
    }
  }
  return getLocalFonts();
}

/**
 * Get details for a specific font family
 */
export async function getFontDetails(fontId: string): Promise<FontFamily> {
  if (isSupabaseConfigured()) {
    try {
      return await getSupabaseFontDetails(fontId);
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local:', err);
    }
  }
  return getLocalFontDetails(fontId);
}

/**
 * Get the font file binary data
 */
export async function getFontFile(fontId: string, weight: string): Promise<Buffer> {
  if (isSupabaseConfigured()) {
    try {
      return await getSupabaseFontFile(fontId, weight);
    } catch (err) {
      console.warn('Supabase download failed, falling back to local:', err);
    }
  }
  return getLocalFontFile(fontId, weight);
}

/**
 * Get the display name for a font (used for Windows registry)
 */
export function getFontDisplayName(fontName: string, weight: string): string {
  if (weight === 'Regular') {
    return fontName;
  }
  return `${fontName} ${weight}`;
}
