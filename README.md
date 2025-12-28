# Abugida - Font Hosting Platform

A professional Windows desktop application for hosting and activating Amharic fonts. Stream fonts from the cloud to Adobe applications (Photoshop, Illustrator) without permanent installation.

![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?logo=windows)
![Electron](https://img.shields.io/badge/Electron-33.x-47848F?logo=electron)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

## ✨ Features

- **☁️ Cloud-Based Font Hosting** - Stream fonts from Supabase on-demand
- **⚡ Session-Based Activation** - Fonts active only while app runs
- **🎨 Adobe Integration** - Fonts appear in Photoshop, Illustrator, etc.
- **🔒 Secure Authentication** - Supabase Auth with user management
- **💻 No Admin Rights** - Per-user activation using Windows registry
- **🧹 Auto Cleanup** - Fonts automatically deactivated on app close

## 🏗️ Architecture (Monotype-Style MVP)

This is a **font hosting platform**, not a traditional font manager. Fonts are temporarily activated from cloud storage while the app runs.

```
User Opens Abugida
    ↓
Sign In (Supabase Auth) ← REQUIRED
    ↓
Browse Font Catalog (from Supabase)
    ↓
Activate Font → Download to temp → Register to Windows
    ↓
Open Photoshop/Illustrator → Font available
    ↓
Close Abugida → Fonts deactivated + temp files deleted
```

### Key Principles

1. **Zero Local Storage** - No fonts persist on disk (except temp cache)
2. **Session-Based** - Fonts active only while Abugida runs
3. **Cloud-First** - Supabase is the only source (REQUIRED)
4. **Adobe Integration** - Fonts visible in Adobe apps via Windows font registry
5. **Temporary Activation** - Like Adobe Fonts or Monotype's service

## 🚀 Quick Start

### For Users

1. Download the latest release from [Releases](../../releases)
2. Extract the zip file
3. Run `Abugida Font Manager.exe`
4. Sign in with your Supabase account
5. Activate fonts - they'll appear in Adobe apps!
6. Close the app when done (fonts auto-deactivate)

### For Developers

```bash
# Install dependencies
npm install

# Set up Supabase (REQUIRED)
# Copy env.example to .env and add your Supabase credentials
cp env.example .env

# Run in development
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package
```

## 🌐 Supabase Backend (REQUIRED)

**This app requires a Supabase backend.** There is no local fallback.

### Setup Instructions

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql`
3. Create a Storage bucket named `fonts`
4. Upload font files to the bucket
5. Configure the app with your Supabase credentials:

```env
# .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

## 📁 Project Structure

```
abugida/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── services/
│   │   │   ├── font-service.ts      # Fetch fonts from Supabase
│   │   │   ├── font-activator.ts    # Session-based activation
│   │   │   ├── auth-service.ts      # Supabase authentication
│   │   │   └── supabase-client.ts   # Supabase integration
│   │   └── index.ts
│   ├── renderer/                # React frontend
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useFontLoader.ts     # Memory-safe font loading
│   │   └── types/
│   └── shared/
│       └── types.ts                 # Shared type definitions
├── supabase/
│   └── schema.sql               # Database schema
└── scripts/
    └── seed-supabase.js         # Upload fonts to Supabase
```

## 🔧 Technology Stack

- **Electron** - Desktop app framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast development server
- **Supabase** - Backend (PostgreSQL + Storage + Auth)

## 💡 How It Works

### Font Activation Flow

1. **User logs in** → Supabase Auth validates credentials
2. **User browses fonts** → Metadata fetched from PostgreSQL
3. **User activates font** → Download from Supabase Storage to temp directory
4. **Font registered** → Windows registry (HKCU, no admin needed)
5. **Adobe sees font** → Appears in Photoshop, Illustrator, etc.
6. **User closes app** → Fonts unregistered, temp files deleted

### Temporary Font Location

```
C:\Users\{username}\AppData\Local\Temp\abugida-fonts\
```

Cleaned up automatically on app exit.

### Windows Registry

Fonts registered to:
```
HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts
```

Per-user registry (no admin rights required).

## 🎯 Use Cases

- **Graphic Designers** - Access cloud font library in Adobe apps
- **Font Distributors** - Host and license fonts (similar to Adobe Fonts)
- **Teams** - Share brand fonts across organization
- **Print Shops** - Activate client fonts temporarily

## 🔐 Security & Privacy

- ✅ Authentication required (Supabase Auth)
- ✅ Fonts never permanently stored
- ✅ Temp files deleted on exit
- ✅ Per-user activation (no system-wide changes)
- ✅ Session-based access (no persistent licenses)

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! This is an MVP demonstrating:
- Session-based font activation
- Cloud-first font hosting
- Adobe app integration
- Monotype-style architecture

## 🐛 Troubleshooting

### Fonts not appearing in Adobe apps?

1. Make sure Abugida is running (fonts deactivate when app closes)
2. Restart the Adobe application
3. Check if font is activated in the "Activated" tab

### "Supabase not configured" error?

Create a `.env` file with your Supabase credentials. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

### Fonts still showing after closing app?

Run the app again and close it properly. The cleanup happens on graceful shutdown.

## 📚 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture details
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Backend setup guide
- [DISTRIBUTION.md](DISTRIBUTION.md) - Distribution and packaging guide

---

**Built with ❤️ for the Amharic typography community**
