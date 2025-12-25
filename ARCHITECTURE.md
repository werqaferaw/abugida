# Architecture & Deployment Strategy

## Overview

Abugida is designed as a **cloud-first font distribution platform** with Supabase as the backend.

## Production vs Development

### Production (End Users)

```
┌─────────────────────────────────────────┐
│   User's Machine                        │
│                                         │
│   ┌─────────────────────────────┐      │
│   │  Electron App (~5MB)        │      │
│   │  - React UI                 │      │
│   │  - Font installer           │      │
│   │  - Supabase client          │      │
│   └──────────┬──────────────────┘      │
└──────────────┼──────────────────────────┘
               │
               │ HTTPS
               ↓
┌─────────────────────────────────────────┐
│   Supabase Cloud                        │
│                                         │
│   ┌─────────────────┐                  │
│   │  Auth           │  User login      │
│   └─────────────────┘                  │
│                                         │
│   ┌─────────────────┐                  │
│   │  PostgreSQL     │  Font metadata   │
│   │  - font_families│                  │
│   │  - font_weights │                  │
│   └─────────────────┘                  │
│                                         │
│   ┌─────────────────┐                  │
│   │  Storage        │  Font files      │
│   │  fonts/ bucket  │  (.ttf, .otf)   │
│   └─────────────────┘                  │
└─────────────────────────────────────────┘
```

**Key Points:**
- ✅ App is lightweight (~5MB without fonts)
- ✅ Fonts downloaded on-demand
- ✅ Authentication required
- ✅ Scalable - supports thousands of fonts
- ✅ Easy updates - just upload new fonts to Supabase

### Development (Your Machine)

```
┌─────────────────────────────────────────┐
│   Developer Machine                     │
│                                         │
│   ┌─────────────────────────────┐      │
│   │  Electron App               │      │
│   │  + Local font-repo/         │      │
│   └──────────┬──────────────────┘      │
└──────────────┼──────────────────────────┘
               │
               │ Fallback if no Supabase
               ↓
         Local Files
    (font-repo/families/)
```

**Key Points:**
- ✅ Works without internet
- ✅ No Supabase setup needed for quick testing
- ✅ Local fonts for development
- ⚠️ NOT for production deployment

## Data Flow

### 1. User Authentication
```
App Start → Supabase Auth → Login Screen
                ↓
            Valid Token → Main App
```

### 2. Browse Fonts
```
Main App → Fetch from Supabase DB (font_families + font_weights)
        ↓
     Display in UI
```

### 3. Preview Font
```
User Clicks Font → Download .ttf from Supabase Storage
                ↓
            Load in @font-face
                ↓
            Render Preview
```

### 4. Install Font
```
User Clicks Install → Download .ttf from Supabase Storage
                   ↓
            Copy to Windows Fonts Directory
                   ↓
            Add Registry Entry
                   ↓
            Update Local State
```

## Why This Architecture?

### Pros
1. **Scalable**: Add unlimited fonts without rebuilding app
2. **Small downloads**: Users only get fonts they want
3. **Easy updates**: Upload to Supabase, no app update needed
4. **Metrics**: Track which fonts are popular
5. **Licensing**: Can add paid fonts later with RLS policies
6. **Bandwidth**: Supabase Storage has CDN

### Cons (and solutions)
1. **Requires internet**: Cache downloaded fonts locally (future)
2. **Backend cost**: Supabase free tier is generous, upgrade as needed
3. **Initial setup**: One-time Supabase configuration

## Future: Monetization Ready

```sql
-- Add to font_families table
ALTER TABLE font_families ADD COLUMN is_premium BOOLEAN DEFAULT false;
ALTER TABLE font_families ADD COLUMN price DECIMAL(10,2) DEFAULT 0;

-- Create purchases table
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  font_id TEXT REFERENCES font_families(id),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update RLS policy
CREATE POLICY "Users can only download purchased fonts"
  ON font_weights FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT font_id FROM purchases WHERE user_id = auth.uid()
    )
    OR
    family_id IN (
      SELECT id FROM font_families WHERE is_premium = false
    )
  );
```

## Deployment Checklist

### Backend (Supabase)
- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql`
- [ ] Create Storage bucket: `fonts`
- [ ] Upload font files
- [ ] Configure RLS policies
- [ ] Test authentication

### Desktop App
- [ ] Build: `npm run build`
- [ ] Package: `npm run package`
- [ ] Create installer (optional)
- [ ] Sign code (for production)
- [ ] Create GitHub release
- [ ] Distribute to users

### Configuration
- [ ] Share Supabase URL with users (or embed in app)
- [ ] Document setup process
- [ ] Provide test account credentials

## Local Fonts: Development Only

The `font-repo/families/` directory:
- ✅ Use for development without Supabase
- ✅ Use for testing new fonts before upload
- ❌ Don't bundle in production releases
- ❌ Don't commit large font files to git (use .gitignore)

## Recommended: Build Without Fonts

Update `electron-builder.yml`:
```yaml
extraResources:
  # Remove this for production:
  # - from: font-repo/families
  #   to: font-repo/families
```

This keeps your app small and forces use of Supabase backend.

