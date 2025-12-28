# Architecture & Technical Design

## Overview

Abugida is a **font hosting platform** (not a font manager) designed for session-based font activation. Fonts are streamed from Supabase cloud storage and temporarily activated while the app runs, similar to Adobe Fonts or Monotype's SkyFonts.

## Architecture Model: Monotype-Style MVP

```
┌─────────────────────────────────────────┐
│   User's Machine                        │
│                                         │
│   ┌─────────────────────────────┐      │
│   │  Abugida App (~5MB)         │      │
│   │  - React UI                 │      │
│   │  - Font Activator           │      │
│   │  - Supabase Client          │      │
│   └──────────┬──────────────────┘      │
│              │                          │
│   ┌──────────▼──────────────────┐      │
│   │  Temp Cache                 │      │
│   │  C:\Users\..\Temp\          │      │
│   │  abugida-fonts\             │      │
│   │  (auto-cleaned on exit)     │      │
│   └──────────┬──────────────────┘      │
│              │                          │
│   ┌──────────▼──────────────────┐      │
│   │  Windows Registry (HKCU)    │      │
│   │  Per-user font activation   │      │
│   └─────────────────────────────┘      │
└─────────────────────────────────────────┘
               │
               │ HTTPS
               ↓
┌─────────────────────────────────────────┐
│   Supabase Cloud (REQUIRED)            │
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

## Core Principles

### 1. Zero Local Storage
- **No permanent font storage** - All fonts from Supabase
- **Temp cache only** - Downloaded to `os.tmpdir()` during session
- **Auto cleanup** - Temp files deleted on app exit
- **No font-repo/** - Removed from codebase entirely

### 2. Session-Based Activation
- Fonts active **only while app runs**
- In-memory tracking (Map, not disk)
- Automatic deactivation on app close
- No persistent state for activated fonts

### 3. Cloud-First (No Fallback)
- Supabase is **REQUIRED** - no local fallback
- App won't run without Supabase configuration
- All fonts fetched from cloud on-demand
- Internet connection required

### 4. Adobe Integration
- Fonts registered to Windows per-user registry
- Appear in Adobe Photoshop, Illustrator, InDesign, etc.
- No admin rights required (HKCU registry)
- Fonts disappear when app closes

## Data Flow

### User Authentication
```
App Start
    ↓
Check Supabase Session
    ↓
    ├─ Valid → Show Font Library
    └─ Invalid → Show Login Screen
         ↓
    Supabase Auth
         ↓
    Store User in Local State
```

### Browse Fonts
```
User Opens Library
    ↓
Fetch from Supabase PostgreSQL
    (font_families + font_weights)
    ↓
Display in UI Grid
```

### Activate Font
```
User Clicks "Activate"
    ↓
Download .ttf from Supabase Storage
    ↓
Write to: C:\Users\...\Temp\abugida-fonts\
    ↓
Register to Windows Registry (HKCU)
    ↓
Track in Memory Map
    ↓
Font Available in Adobe Apps
```

### App Exit
```
User Closes App
    ↓
before-quit Event
    ↓
Deactivate All Fonts
    ↓
    ├─ Remove Registry Entries
    ├─ Delete Temp Files
    └─ Clear Memory Map
    ↓
App Quits
```

## Technical Architecture (6 Layers)

### Layer 1: Presentation (React)
**Location:** `src/renderer/components/`

**Components:**
- `LoginScreen.tsx` - Supabase authentication
- `FontLibrary.tsx` - Browse cloud fonts
- `FontDetail.tsx` - Activate/deactivate fonts
- `ActivatedFonts.tsx` - View session-active fonts

**Responsibilities:**
- User interaction
- Display font previews
- Activation state management
- Error boundaries

### Layer 2: IPC Bridge (Preload)
**Location:** `src/main/preload.ts`

**Exposed API:**
```typescript
window.electronAPI = {
  auth: { login, signUp, logout, getCurrentUser },
  fonts: {
    list, getDetails, getFile,
    activate, deactivate, isActive, getActive
  }
}
```

**Security:** Context isolation enabled

### Layer 3: IPC Handlers
**Location:** `src/main/ipc-handlers.ts`

**Routes IPC calls to services:**
- `auth:*` → auth-service
- `fonts:*` → font-service + font-activator

### Layer 4: Service Layer (Business Logic)
**Location:** `src/main/services/`

#### font-service.ts
- Fetches fonts from Supabase (ONLY source)
- No local fallback
- Throws error if Supabase not configured

#### font-activator.ts (NEW)
- Session-based font management
- Downloads to temp directory
- Windows registry manipulation
- In-memory tracking (Map)
- Cleanup on exit

#### auth-service.ts
- Supabase Auth (REQUIRED)
- No mock auth fallback
- Syncs user to local state

#### state-manager.ts
- Minimal persistent state (user only)
- No activated fonts tracking
- Stored in %APPDATA%

### Layer 5: Data Access
**Remote:** Supabase (ONLY source)
- PostgreSQL: font metadata
- Storage: font files
- Auth: user sessions

**Local:** state.json (user only)

### Layer 6: System Integration
**Windows Registry:**
```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts
```

**Temp Directory:**
```
C:\Users\{username}\AppData\Local\Temp\abugida-fonts\
```

## Key Files

### New Files (Created)
- `src/main/services/font-activator.ts` - Session-based activation
- `src/shared/types.ts` - Shared type definitions
- `src/renderer/hooks/useFontLoader.ts` - Memory-safe font loading
- `src/renderer/components/ErrorBoundary.tsx` - Error handling
- `src/renderer/components/ActivatedFonts.tsx` - Active fonts view

### Deleted Files (Removed)
- `font-repo/` - Entire directory (no local fonts)
- `src/renderer/components/Header.tsx` - Unused component
- `src/renderer/components/InstalledFonts.tsx` - Replaced by ActivatedFonts
- `src/main/services/font-installer.ts` - Replaced by font-activator

### Refactored Files
- `src/main/services/font-service.ts` - Supabase only, no fallback
- `src/main/services/auth-service.ts` - No mock auth
- `src/main/services/state-manager.ts` - User only, no fonts
- `src/main/ipc-handlers.ts` - Activate/deactivate handlers
- `src/main/index.ts` - Cleanup lifecycle
- All UI components - Install → Activate terminology

## Memory Management

### Font Loading (Renderer)
**Problem:** Blob URLs leaked memory

**Solution:** `useFontLoader` hook
- Tracks blob URLs
- Revokes on unmount
- Cancellation support

### Font Activation (Main)
**Session Tracking:**
```typescript
Map<string, ActiveFont> // In-memory only
```

**Cleanup:**
- `app.on('before-quit')` → deactivateAll()
- Unregister from registry
- Delete temp files
- Clear map

## Error Handling

### React Error Boundaries
- Wraps main app views
- Prevents full app crashes
- Shows fallback UI

### Service Layer
- Consistent error format: `{ success, error }`
- Supabase errors handled gracefully
- Clear user-facing messages

## Security

### Authentication
- Supabase Auth (required)
- Session persistence
- Auto token refresh

### Font Access
- User must be authenticated
- Supabase RLS policies
- Session-based activation

### System Integration
- Per-user registry (no admin)
- Temp directory (user-writable)
- No system-wide changes

## Performance

### On-Demand Loading
- Fonts downloaded when activated
- Metadata cached in UI
- Lazy font preview loading

### Temp Cache
- Single session lifetime
- Automatic cleanup
- No disk space accumulation

## Future Enhancements

### Potential Features
1. **Offline Mode** - Cache fonts for offline use
2. **Font Collections** - Group fonts by project
3. **Premium Fonts** - Paid font licensing
4. **Team Management** - Share fonts across organization
5. **Usage Analytics** - Track font activation metrics
6. **Auto-Activation** - Activate fonts by project/app
7. **Font Sync** - Sync active fonts across devices

### Monetization Ready
- Add `is_premium` flag to fonts
- Create purchases table
- Update RLS policies
- Integrate payment provider

## Comparison to Traditional Font Managers

| Feature | Traditional Manager | Abugida (Hosting Platform) |
|---------|--------------------|-----------------------------|
| Font Storage | Permanent local copy | Temp cache (session only) |
| Installation | System-wide | Session-based activation |
| Internet | Optional | Required |
| Backend | None | Supabase (required) |
| Licensing | One-time purchase | Subscription-ready |
| Use Case | Personal library | Cloud font hosting |
| Similar To | FontExplorer, MainType | Adobe Fonts, Monotype |

## Development Workflow

### Setup
```bash
npm install
cp env.example .env
# Add Supabase credentials to .env
npm run dev
```

### Build
```bash
npm run build    # Compile TypeScript
npm run package  # Create distributable
```

### Testing
1. Login → See cloud fonts
2. Activate font → Check Adobe apps
3. Close app → Font disappears
4. Reopen → Font still gone

## Deployment Checklist

### Backend (Supabase)
- ✅ Create Supabase project
- ✅ Run schema.sql
- ✅ Create `fonts` storage bucket
- ✅ Upload font files
- ✅ Configure RLS policies
- ✅ Test authentication

### Desktop App
- ✅ Build: `npm run build`
- ✅ Package: `npm run package`
- ✅ Test on clean Windows install
- ✅ Verify cleanup on exit
- ✅ Create installer (optional)
- ✅ Code sign (production)
- ✅ Create GitHub release

### Configuration
- ✅ Embed Supabase URL (or distribute separately)
- ✅ Document setup process
- ✅ Provide test account

## Maintenance

### Regular Tasks
- Monitor Supabase usage
- Update font catalog
- Check cleanup working properly
- Review error logs

### Updates
- App updates via Electron auto-updater
- Font updates instant (cloud-based)
- No app rebuild for new fonts

---

**This architecture enables a scalable, cloud-first font hosting platform for Adobe applications.**
