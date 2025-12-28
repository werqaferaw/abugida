# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (or use an existing one)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the long key under "Project API keys")

## Step 2: Create .env File

In the project root directory, create a file named `.env` (not `.env.txt`, just `.env`)

Copy the contents from `env.example` and fill in your values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Important:**
- Replace `your-project-id` with your actual project ID
- Replace `your-actual-anon-key-here` with your actual anon key
- No quotes needed around the values
- The `.env` file should be in the same directory as `package.json`

## Step 3: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run** (or press Ctrl+Enter)

This creates the tables and storage bucket needed for fonts.

## Step 4: Upload Font Files

1. In Supabase Dashboard, go to **Storage**
2. Find the `fonts` bucket (created by the schema)
3. Click on it, then click **New folder**
4. Create folder: `bela-hidase-qedmo`
5. Click into that folder
6. Click **Upload file** and upload these files:
   - `Regular.ttf`
   - `Bold.ttf`
   - `ExtraBold.ttf`
   
   (These files are in `font-repo/families/bela-hidase-qedmo/`)

## Step 5: Run the App

```bash
npm run dev
```

The app will automatically detect your `.env` file and connect to Supabase!

## Troubleshooting

**"Supabase configuration not found" error:**
- Make sure the `.env` file exists in the project root (same folder as `package.json`)
- Check that it's named exactly `.env` (not `.env.txt` or `env.txt`)
- Verify the file contents match the format shown above (no extra spaces, one value per line)

**Can't see fonts:**
- Make sure you ran the SQL schema
- Verify font files are uploaded to Storage → fonts bucket
- Check that you're logged in (the app requires authentication)

**Auth not working:**
- In Supabase Dashboard → Authentication → Settings
- Make sure "Enable email signup" is ON
- Check your email confirmation settings









