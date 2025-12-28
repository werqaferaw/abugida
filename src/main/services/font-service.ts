import { getSupabase, isSupabaseConfigured, FontFamilyWithWeights } from './supabase-client';

/**
 * Font Service - Cloud-Only Implementation
 * 
 * This service fetches fonts exclusively from Supabase.
 * NO local fallback - Supabase configuration is REQUIRED.
 * 
 * Metadata: PostgreSQL database
 * Font files: Supabase Storage
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
// SUPABASE FUNCTIONS (ONLY SOURCE)
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
  
  // For public buckets, use getPublicUrl and fetch directly
  const { data: urlData } = supabase
    .storage
    .from('fonts')
    .getPublicUrl(weightData.file_path);
  
  // Fetch the file directly using the public URL
  const response = await globalThis.fetch(urlData.publicUrl);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Font download error:', response.status, errorText);
    throw new Error(`Failed to download font file: ${weightData.file_path} (${response.status}: ${errorText})`);
  }
  
  // Convert to Buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Get all available font families (Supabase only)
 */
export async function getFonts(): Promise<FontFamily[]> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. This app requires a Supabase backend.\n\n' +
      'Please create a .env file with:\n' +
      '  SUPABASE_URL=your-project-url\n' +
      '  SUPABASE_ANON_KEY=your-anon-key'
    );
  }
  
  return getSupabaseFonts();
}

/**
 * Get details for a specific font family (Supabase only)
 */
export async function getFontDetails(fontId: string): Promise<FontFamily> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. This app requires a Supabase backend.');
  }
  
  return getSupabaseFontDetails(fontId);
}

/**
 * Get the font file binary data (Supabase only)
 */
export async function getFontFile(fontId: string, weight: string): Promise<Buffer> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. This app requires a Supabase backend.');
  }
  
  return getSupabaseFontFile(fontId, weight);
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
