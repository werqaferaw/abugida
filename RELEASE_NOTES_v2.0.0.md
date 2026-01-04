# Abugida Font Manager v2.0.0 - Release Notes

## 🎉 Major Release: Cloud-Based Font Hosting Platform

**Release Date:** December 2024  
**Version:** 2.0.0  
**Platform:** Windows 10/11 (64-bit)

---

## 🚀 What's New

### Major Architecture Transformation

This release represents a complete transformation from a local font manager to a **cloud-based font hosting platform** (similar to Adobe Fonts or Monotype Mosaic).

#### Key Changes:

- ✅ **Cloud-First Architecture** - All fonts now stream from Supabase cloud storage
- ✅ **Session-Based Activation** - Fonts are temporarily activated only while the app runs
- ✅ **No Local Storage** - Removed all local font files (font-repo folder deleted)
- ✅ **Guest Login** - Test the app without creating an account
- ✅ **Auto Cleanup** - Fonts automatically deactivated when you close the app
- ✅ **Improved Error Handling** - Better user feedback and error messages

---

## 📦 Installation Instructions

### For End Users

1. **Download the Release**
   - Download `Abugida-Font-Manager-v2.0.0-Windows.zip` from the [Releases page](https://github.com/werqaferaw/abugida/releases)

2. **Extract the Archive**
   - Right-click the zip file → "Extract All..."
   - Choose a location (e.g., `C:\Program Files\Abugida` or your Desktop)

3. **Run the Application**
   - Navigate to the extracted folder
   - Double-click `Abugida Font Manager.exe`
   - No installation required - it's a portable application!

4. **First Launch**
   - Sign in with your Supabase account, OR
   - Click "Continue as Guest" to test without authentication
   - Browse and activate fonts from the cloud library

### System Requirements

- **OS:** Windows 10 (64-bit) or Windows 11
- **RAM:** 4 GB minimum (8 GB recommended)
- **Storage:** ~200 MB for the application
- **Internet:** Required (fonts stream from cloud)
- **Admin Rights:** NOT required (per-user activation)

---

## 🎯 How to Use

### Getting Started

1. **Launch the App**
   - Run `Abugida Font Manager.exe`
   - The app will open to the login screen

2. **Sign In Options**
   - **Sign In:** Use your Supabase account credentials
   - **Sign Up:** Create a new account (requires Supabase backend)
   - **Continue as Guest:** Test the app without authentication

3. **Browse Fonts**
   - Click "Font Library" in the sidebar
   - Browse available font families
   - Click on a font card to see details

4. **Activate Fonts**
   - Click "Activate" on any font weight
   - Font is downloaded and registered to Windows
   - Open Adobe Photoshop, Illustrator, or any app that uses Windows fonts
   - The font will appear in the font list!

5. **View Activated Fonts**
   - Click "Activated Fonts" in the sidebar
   - See all fonts currently active in this session
   - Click "Deactivate" to remove a font

6. **Using in Adobe Apps**
   - Keep Abugida running while you work
   - Open Photoshop/Illustrator
   - The activated fonts will appear in the font dropdown
   - Fonts remain active as long as Abugida is running

### Important Notes

⚠️ **Fonts are session-based:**
- Fonts are only active while Abugida is running
- Closing Abugida will deactivate all fonts
- This is by design - fonts are not permanently installed

⚠️ **Internet connection required:**
- Fonts are downloaded on-demand from Supabase
- No offline mode available
- First activation may take a few seconds to download

---

## 🔄 Migration from v1.0.0

If you're upgrading from v1.0.0:

1. **Backup your work** - Any locally stored fonts are no longer used
2. **Uninstall v1.0.0** (if installed) - This version is portable, no uninstall needed
3. **Download v2.0.0** - Get the new release
4. **Sign in** - Use your Supabase credentials (or continue as guest)

**Breaking Changes:**
- ❌ Local font storage removed - all fonts must be in Supabase
- ❌ "Installed Fonts" renamed to "Activated Fonts"
- ❌ Fonts no longer persist after app closes
- ✅ Guest login now available
- ✅ Better error handling

---

## 🐛 Known Issues

1. **Windows Defender Warning**
   - Windows may show a "Windows protected your PC" warning
   - Click "More info" → "Run anyway" (app is not signed)
   - This is normal for unsigned applications

2. **Font Not Appearing in Adobe**
   - Make sure Abugida is still running
   - Restart the Adobe application
   - Check the "Activated Fonts" tab to confirm activation

3. **Network Errors**
   - Ensure you have an active internet connection
   - Check if Supabase backend is accessible
   - Try signing out and back in

---

## 🔧 For Developers

### Building from Source

```bash
# Clone the repository
git clone https://github.com/werqaferaw/abugida.git
cd abugida

# Install dependencies
npm install

# Set up environment
cp env.example .env
# Edit .env with your Supabase credentials

# Run in development
npm run dev

# Build for production
npm run build

# Package release
npm run package
```

### Technical Details

- **Electron:** 33.4.11
- **React:** 18.3.1
- **TypeScript:** 5.7.2
- **Supabase JS:** 2.89.0

See [ARCHITECTURE.md](ARCHITECTURE.md) for full technical documentation.

---

## 📝 Changelog

### v2.0.0 (December 2024)

**Added:**
- Cloud-based font hosting (Supabase Storage)
- Session-based font activation
- Guest login mode
- Auto cleanup on app exit
- Error boundary component
- Memory-safe font loading hook
- Improved error messages

**Changed:**
- Removed local font storage
- Renamed "Installed" to "Activated"
- Fonts no longer persist after app close
- Updated architecture to cloud-first

**Removed:**
- `font-installer.ts` (replaced by `font-activator.ts`)
- `font-repo/` folder (all fonts in cloud)
- Header component (unused)
- Local fallback logic

**Fixed:**
- Supabase RLS policies for anonymous access
- Font file path mismatches
- Memory leaks in font loading
- Type duplication issues

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/werqaferaw/abugida/issues)
- **Documentation:** See [README.md](README.md) and [ARCHITECTURE.md](ARCHITECTURE.md)
- **Supabase Setup:** See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Thank you for using Abugida Font Manager!** 🎨

