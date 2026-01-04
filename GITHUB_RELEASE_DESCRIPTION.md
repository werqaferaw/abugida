# Abugida Font Manager v2.0.0

## 🎉 Major Release: Cloud-Based Font Hosting Platform

This release transforms Abugida from a local font manager into a **cloud-based font hosting platform** (similar to Adobe Fonts or Monotype Mosaic).

---

## ✨ What's New

### Major Features

- ☁️ **Cloud-First Architecture** - All fonts stream from Supabase cloud storage
- ⚡ **Session-Based Activation** - Fonts temporarily activated only while app runs
- 🎨 **Adobe Integration** - Activated fonts appear in Photoshop, Illustrator, etc.
- 👤 **Guest Login** - Test the app without creating an account
- 🧹 **Auto Cleanup** - Fonts automatically deactivated on app close
- 🔒 **No Admin Required** - Per-user activation using Windows registry

### Breaking Changes

- ❌ **Local font storage removed** - All fonts must be in Supabase cloud
- ❌ **Fonts no longer persist** - They deactivate when you close the app
- ✅ **Guest mode available** - Click "Continue as Guest" on login screen

---

## 📦 Installation

1. **Download** `Abugida-Font-Manager-v2.0.0-Windows.zip`
2. **Extract** the zip file to any location
3. **Run** `Abugida Font Manager.exe` (no installation needed!)
4. **Sign in** with Supabase account or click "Continue as Guest"

### System Requirements

- Windows 10/11 (64-bit)
- Internet connection (required)
- No admin rights needed

---

## 🚀 Quick Start

1. Launch the app
2. Sign in or continue as guest
3. Browse fonts in the library
4. Click "Activate" on any font
5. Open Adobe Photoshop/Illustrator
6. Font appears in the font dropdown!

**Note:** Keep Abugida running while you work - fonts deactivate when you close the app.

---

## 📝 Full Documentation

- 📖 [Release Notes](RELEASE_NOTES_v2.0.0.md) - Detailed changelog and instructions
- 🏗️ [Architecture](ARCHITECTURE.md) - Technical details
- 🔧 [Supabase Setup](SUPABASE_SETUP.md) - Backend configuration

---

## 🐛 Known Issues

- Windows Defender may show a warning (app is unsigned) - click "Run anyway"
- Fonts must be activated while Abugida is running
- Internet connection required for font downloads

---

## 📊 Changes Summary

**48 files changed:** 1,354 insertions, 998 deletions

**Added:**
- Cloud font hosting
- Session-based activation
- Guest login
- Error boundaries
- Memory-safe font loading

**Removed:**
- Local font storage
- Permanent installation
- Unused components

**Fixed:**
- Supabase RLS policies
- Font file paths
- Memory leaks
- Error handling

---

## 🔗 Links

- **Repository:** https://github.com/werqaferaw/abugida
- **Issues:** https://github.com/werqaferaw/abugida/issues
- **Documentation:** See README.md

---

**Built with ❤️ for the Amharic typography community**

