# Abugida v2.0.0 Release Notes

## 🎉 Major Release: Cloud-Based Font Hosting Platform

This release transforms Abugida from a local font manager into a **cloud-based font hosting platform** similar to Adobe Fonts or Monotype Mosaic.

---

## ✨ What's New

### Session-Based Font Activation
- Fonts are **temporarily activated** while Abugida is running
- Automatically **deactivated when you close** the app
- No permanent changes to your system
- Works with Adobe apps (Illustrator, Photoshop, InDesign) and any Windows application

### Cloud-First Architecture
- All fonts stored in **Supabase cloud storage**
- Instant access to the font library from anywhere
- No local font files needed

### Guest Mode
- **Try without signing up** - click "Continue as Guest"
- Full access to browse and activate fonts
- Perfect for testing and evaluation

---

## 🚀 How to Use

### Installation
1. Download `Abugida-2.0.0-Windows.zip`
2. Extract to any folder
3. Run `Abugida.exe`

### Activating Fonts
1. Click **"Continue as Guest"** (or sign in)
2. Browse the **Font Library**
3. Click on a font to see details
4. Click **"Activate"** on the weights you want
5. Open Adobe Illustrator/Photoshop - the font will appear in the font list!

### Using in Adobe Apps
- Activated fonts appear in the font menu automatically
- If you don't see the font, restart the Adobe app
- Fonts remain available **while Abugida is running**
- When you close Abugida, fonts are removed from the system

---

## 📦 System Requirements

- **OS:** Windows 10 or later (64-bit)
- **Internet:** Required for font downloads
- **Disk Space:** ~150 MB for app, fonts cached temporarily

---

## ⚠️ Important Notes

- **Fonts are session-based** - they're removed when you close Abugida
- **Keep Abugida running** while using fonts in other applications
- **No admin rights required** - fonts are installed per-user

---

## 🔧 Technical Details

- Built with Electron + React + TypeScript
- Backend: Supabase (PostgreSQL + Storage)
- Font activation: Windows per-user font registry (HKCU)
- Temp files stored in: `%TEMP%\abugida-fonts\`

---

## 📝 Changelog from v1.0.0

### Breaking Changes
- Removed local font storage - all fonts from cloud
- Changed from permanent installation to session-based activation
- "Install" renamed to "Activate" throughout

### New Features
- Guest login for testing without authentication
- Improved error handling and user feedback
- Better Adobe app integration guidance

### Removed
- Local font-repo folder
- Permanent font installation
- Offline mode (internet required)

---

## 🐛 Known Issues

- File size is ~100 MB due to Electron/Chromium runtime
- First font activation may take a few seconds (downloading from cloud)
- Some antivirus software may flag unsigned executables

---

## 📬 Feedback

Found a bug or have a suggestion? Open an issue on GitHub!

