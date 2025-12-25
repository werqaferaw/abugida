# Abugida - Amharic Font Manager

A professional Windows desktop application for managing Amharic fonts. Browse, preview, and install Ethiopian fonts with a native Windows experience.

![Windows](https://img.shields.io/badge/Windows-10%2F11-0078D6?logo=windows)
![Electron](https://img.shields.io/badge/Electron-33.x-47848F?logo=electron)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)

## ✨ Features

- **🎨 Font Preview** - Live Amharic text preview with custom input
- **⚡ One-Click Install** - Install fonts without admin privileges
- **🗑️ Clean Uninstall** - Remove fonts completely from your system
- **🌐 Cloud Ready** - Optional Supabase backend for font distribution
- **💻 Native Windows UI** - Professional look with native menus and controls
- **📦 Portable** - No installation required, runs from any folder

## 🚀 Quick Start

### For Users

1. Download the latest release from [Releases](../../releases)
2. Extract the zip file
3. Run `Abugida Font Manager.exe`
4. Sign in and start managing fonts!

### For Developers

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Package for distribution
npm run package
```

## 🏗️ Architecture

The app is built with a clean three-layer architecture designed for future cloud migration:

```
┌─────────────────────────────────────┐
│     React UI (Renderer Process)     │
├─────────────────────────────────────┤
│      Font Service Abstraction       │
│  (Local files OR Supabase Storage)  │
├─────────────────────────────────────┤
│    Windows Font System Integration  │
└─────────────────────────────────────┘
```

### Key Design Principles

- **Service Abstraction**: All font access goes through a service layer
- **Future-Proof**: Swap local files for cloud storage without touching UI
- **Windows Native**: Per-user font installation, native menus, system integration

## 📁 Project Structure

```
abugida/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── services/
│   │   │   ├── font-service.ts      # Font abstraction layer
│   │   │   ├── font-installer.ts    # Windows font operations
│   │   │   ├── auth-service.ts      # Authentication
│   │   │   └── supabase-client.ts   # Supabase integration
│   │   └── index.ts
│   └── renderer/                # React frontend
│       ├── components/
│       └── styles/
├── font-repo/
│   └── families/                # Local font storage
└── supabase/
    └── schema.sql               # Database schema
```

## 🔧 Technology Stack

- **Electron** - Desktop app framework
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast development server
- **Supabase** - Optional backend (PostgreSQL + Storage + Auth)

## 🌐 Supabase Backend (Required for Production)

**For Production:** Supabase is the core backend - fonts are served from cloud storage on-demand.

**For Development:** Local fonts work as fallback for testing without Supabase.

### Production Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/schema.sql`
3. Upload fonts to Supabase Storage
4. Configure the app with your Supabase credentials

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

### Architecture

```
User Opens App
    ↓
Sign In (Supabase Auth) ← REQUIRED
    ↓
Fetch Font List (Supabase DB)
    ↓
Preview Font (Download from Supabase Storage)
    ↓
Install to Windows
```

Fonts are NEVER bundled - they're downloaded on-demand from your Supabase Storage.

## 📦 Adding New Fonts

1. Create a folder in `font-repo/families/` with a unique ID
2. Add your `.ttf` font files
3. Create `metadata.json`:

```json
{
  "id": "your-font-id",
  "name": "Display Name",
  "designer": "Designer Name",
  "description": "Font description",
  "category": "display",
  "weights": [
    { "weight": "Regular", "file": "Regular.ttf" },
    { "weight": "Bold", "file": "Bold.ttf" }
  ],
  "sampleText": "ሰላም ዓለም"
}
```

## 🎯 Roadmap

- [x] Font preview with Amharic text
- [x] Per-user font installation
- [x] Windows native UI
- [x] Supabase backend integration
- [ ] Font search and filtering
- [ ] Font collections/favorites
- [ ] Auto-updates
- [ ] Font licensing/subscriptions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Credits

- **Bela Hidase Qedmo** font by Abel Daniel (Belagraph)
- Built with love for the Ethiopian developer community

---

**Made with ❤️ for Amharic typography**
