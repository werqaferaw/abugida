-- Abugida Font Manager - Supabase Schema
-- Run this in the Supabase SQL Editor (SQL Editor > New Query)

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Font families table
CREATE TABLE IF NOT EXISTS font_families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designer TEXT,
  description TEXT,
  category TEXT DEFAULT 'display',
  sample_text TEXT DEFAULT 'ሰላም ዓለም',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Font weights table  
CREATE TABLE IF NOT EXISTS font_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id TEXT REFERENCES font_families(id) ON DELETE CASCADE,
  weight TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, weight)
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE font_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE font_weights ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Allow anyone (including guests/anonymous) to read font families
CREATE POLICY "Fonts are viewable by everyone" 
  ON font_families FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- Allow anyone (including guests/anonymous) to read font weights
CREATE POLICY "Font weights are viewable by everyone" 
  ON font_weights FOR SELECT 
  TO anon, authenticated 
  USING (true);

-- ============================================
-- 4. CREATE STORAGE BUCKET
-- ============================================
-- Note: Run this separately or create the bucket via the UI
-- Storage > New Bucket > Name: "fonts" > Private

INSERT INTO storage.buckets (id, name, public)
VALUES ('fonts', 'fonts', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. STORAGE RLS POLICY
-- ============================================

-- Allow anyone (including guests/anonymous) to download font files
CREATE POLICY "Anyone can download fonts"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'fonts');

-- ============================================
-- 6. SEED DATA - Bela Hidase Qedmo font
-- ============================================
-- Note: You must upload the font files to the 'fonts' bucket first
-- Then run this to add the metadata

INSERT INTO font_families (id, name, designer, description, category, sample_text)
VALUES (
  'bela-hidase-qedmo',
  'Bela Hidase Qedmo',
  'Abel Daniel (Belagraph)',
  'A beautiful Amharic display typeface with elegant curves and strong presence. Perfect for headlines and branding.',
  'display',
  'ሰላም ዓለም። የአማርኛ ፊደል ቆንጆ ነው።'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  designer = EXCLUDED.designer,
  description = EXCLUDED.description;

INSERT INTO font_weights (family_id, weight, file_path) VALUES
  ('bela-hidase-qedmo', 'Regular', 'bela-hidase-qedmo/Regular.ttf'),
  ('bela-hidase-qedmo', 'Bold', 'bela-hidase-qedmo/Bold.ttf'),
  ('bela-hidase-qedmo', 'ExtraBold', 'bela-hidase-qedmo/ExtraBold.ttf')
ON CONFLICT (family_id, weight) DO UPDATE SET
  file_path = EXCLUDED.file_path;

