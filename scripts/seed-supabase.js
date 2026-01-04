/**
 * Seed Supabase with font data
 * 
 * This script uploads font files to Supabase Storage and creates
 * the corresponding database entries.
 * 
 * Usage:
 *   1. Create a .env file with SUPABASE_URL and SUPABASE_ANON_KEY
 *   2. Run: node scripts/seed-supabase.js
 * 
 * Note: For uploading files, you may need to use the Supabase dashboard
 * or the service role key (not included for security).
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found');
    console.log('Create a .env file with:');
    console.log('  SUPABASE_URL=https://your-project.supabase.co');
    console.log('  SUPABASE_ANON_KEY=your-anon-key');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  const env = {};

  for (const line of lines) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    if (key && value) {
      env[key.trim()] = value;
    }
  }

  return env;
}

async function main() {
  const env = loadEnv();

  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY required in .env');
    process.exit(1);
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

  console.log('Connected to Supabase');
  console.log('');

  // Read font families from local repository
  const familiesPath = path.join(__dirname, '..', 'font-repo', 'families');
  const families = fs.readdirSync(familiesPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  console.log(`Found ${families.length} font families to seed`);
  console.log('');

  for (const familyId of families) {
    const familyPath = path.join(familiesPath, familyId);
    const metadataPath = path.join(familyPath, 'metadata.json');

    if (!fs.existsSync(metadataPath)) {
      console.log(`Skipping ${familyId}: no metadata.json`);
      continue;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    console.log(`Processing: ${metadata.name}`);

    // Insert font family
    const { error: familyError } = await supabase
      .from('font_families')
      .upsert({
        id: metadata.id,
        name: metadata.name,
        designer: metadata.designer,
        description: metadata.description,
        category: metadata.category,
        sample_text: metadata.sampleText,
      }, { onConflict: 'id' });

    if (familyError) {
      console.error(`  Error inserting family: ${familyError.message}`);
      continue;
    }
    console.log(`  ✓ Family metadata inserted`);

    // Upload font files and insert weights
    for (const weight of metadata.weights) {
      const fontFilePath = path.join(familyPath, weight.file);
      const storagePath = `${familyId}/${weight.file}`;

      if (!fs.existsSync(fontFilePath)) {
        console.log(`  ✗ Font file not found: ${weight.file}`);
        continue;
      }

      // Try to upload file (may fail with anon key due to RLS)
      const fontBuffer = fs.readFileSync(fontFilePath);
      const { error: uploadError } = await supabase
        .storage
        .from('fonts')
        .upload(storagePath, fontBuffer, {
          contentType: 'font/ttf',
          upsert: true,
        });

      if (uploadError) {
        if (uploadError.message.includes('row-level security')) {
          console.log(`  ! Upload requires service role key - upload manually via dashboard`);
        } else {
          console.log(`  ! Upload error: ${uploadError.message}`);
        }
      } else {
        console.log(`  ✓ Uploaded ${weight.file}`);
      }

      // Insert weight record
      const { error: weightError } = await supabase
        .from('font_weights')
        .upsert({
          family_id: metadata.id,
          weight: weight.weight,
          file_path: storagePath,
        }, { onConflict: 'family_id,weight' });

      if (weightError) {
        console.log(`  ! Weight record error: ${weightError.message}`);
      } else {
        console.log(`  ✓ Weight record: ${weight.weight}`);
      }
    }

    console.log('');
  }

  console.log('Done!');
  console.log('');
  console.log('If file uploads failed due to RLS:');
  console.log('1. Go to Supabase Dashboard > Storage > fonts bucket');
  console.log('2. Create folder for each font family (e.g., "bela-hidase-qedmo")');
  console.log('3. Upload the .ttf files manually');
}

main().catch(console.error);












