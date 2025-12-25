# Distribution Guide

## Building for Distribution

### 1. Build the installer

```bash
npm run package
```

This creates a Windows installer in the `release/` folder.

### 2. Test the installer

- Install it on your machine
- Verify fonts load correctly
- Test install/uninstall functionality

### 3. Share with users

Send them the `.exe` file from `release/` folder. They just:
1. Double-click the installer
2. Follow the wizard
3. Run "Abugida Font Manager" from Start Menu

## What Gets Included

✅ **App files** - All compiled code  
✅ **Local fonts** - The `font-repo/families/` folder  
✅ **Dependencies** - All npm packages bundled  
❌ **`.env` file** - Not included (intentional for security)

## How It Works Without Supabase

The app automatically falls back to local fonts when:
- No `.env` file is present
- Supabase is not configured
- Network errors occur

Users get:
- ✅ Font preview from local files
- ✅ Install/uninstall functionality
- ✅ Full app experience
- ❌ No cloud sync (that's for later)

## System Requirements

- Windows 10 (1809 or later) or Windows 11
- 200 MB disk space
- No admin rights needed (per-user installation)

## Known Limitations

1. **Fonts are bundled** - Each font family is ~2-3MB
2. **No auto-updates** - Manual reinstall required
3. **Per-user fonts** - Installs to user's local fonts directory
4. **No telemetry** - Can't track usage without backend

## Future: Adding Supabase to Production

When ready for cloud features:

1. User creates account on Supabase
2. Admin uploads fonts to Supabase Storage
3. Users download fonts on-demand
4. Add authentication flows
5. Enable font subscriptions

For MVP, local-only is perfect!

