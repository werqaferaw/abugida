# Installation Guide - Abugida Font Manager v2.0.0

## 📥 Quick Installation (End Users)

### Step 1: Download

1. Go to the [Releases page](https://github.com/werqaferaw/abugida/releases)
2. Download `Abugida-Font-Manager-v2.0.0-Windows.zip`
3. The file is approximately 150-200 MB

### Step 2: Extract

1. Right-click the downloaded zip file
2. Select "Extract All..."
3. Choose a location:
   - **Recommended:** `C:\Program Files\Abugida` (create the folder first)
   - **Alternative:** Your Desktop or Documents folder
4. Click "Extract"

### Step 3: Run

1. Navigate to the extracted folder
2. Double-click `Abugida Font Manager.exe`
3. **First Launch:** Windows Defender may show a warning (app is unsigned)
   - Click "More info"
   - Click "Run anyway"
   - This is normal for unsigned applications

### Step 4: First Use

1. **Sign In Options:**
   - **Sign In:** Use your Supabase account (if you have one)
   - **Sign Up:** Create a new account (requires Supabase backend)
   - **Continue as Guest:** Test without authentication

2. **Browse Fonts:**
   - Click "Font Library" in the sidebar
   - Browse available fonts
   - Click on a font to see details

3. **Activate Fonts:**
   - Click "Activate" on any font weight
   - Font downloads and registers to Windows
   - Open Adobe apps - font appears in font list!

---

## 🖥️ System Requirements

### Minimum Requirements

- **Operating System:** Windows 10 (64-bit) or Windows 11
- **RAM:** 4 GB
- **Storage:** 200 MB free space
- **Internet:** Required (always-on for cloud fonts)
- **Admin Rights:** NOT required

### Recommended

- **RAM:** 8 GB or more
- **Storage:** 500 MB free space
- **Internet:** Stable broadband connection

---

## 🔧 Advanced Installation

### Portable Installation

The application is **portable** - no installation required. You can:

1. Extract to a USB drive
2. Run from any location
3. Move the folder without breaking the app

### Custom Location

You can install Abugida anywhere:

```
C:\Program Files\Abugida\
C:\Users\YourName\Desktop\Abugida\
D:\Applications\Abugida\
```

**Note:** Avoid system-protected folders like `C:\Windows\` or `C:\Program Files (x86)\`

### Creating a Desktop Shortcut

1. Right-click `Abugida Font Manager.exe`
2. Select "Create shortcut"
3. Drag the shortcut to your Desktop
4. (Optional) Rename it to "Abugida"

---

## 🚨 Troubleshooting Installation

### Windows Defender Warning

**Problem:** "Windows protected your PC" warning appears

**Solution:**
1. Click "More info"
2. Click "Run anyway"
3. The app is safe - it's just not code-signed
4. You can add an exception in Windows Defender if needed

### "App can't run on this PC"

**Problem:** Error message about compatibility

**Solution:**
- Ensure you're on Windows 10 (64-bit) or Windows 11
- Check that you downloaded the Windows version
- Try running as administrator (right-click → "Run as administrator")

### App Won't Start

**Problem:** Double-clicking does nothing

**Solution:**
1. Check Windows Event Viewer for errors
2. Try running from Command Prompt:
   ```cmd
   cd "C:\path\to\Abugida"
   "Abugida Font Manager.exe"
   ```
3. Check if antivirus is blocking it
4. Ensure all files were extracted correctly

### Missing Files Error

**Problem:** "Cannot find module" or file errors

**Solution:**
- Re-download the zip file
- Extract again (make sure all files extract)
- Don't delete any files from the extracted folder

---

## 🔄 Updating from Previous Version

### From v1.0.0

1. **Backup:** Save any work or settings (if applicable)
2. **Uninstall v1.0.0:** Use Windows Settings → Apps (if installed)
3. **Download v2.0.0:** Get the new release
4. **Extract:** Follow installation steps above
5. **Note:** v2.0.0 is a major rewrite - local fonts won't work

### From v2.0.0 Beta

1. **Close** the old version
2. **Delete** the old folder (optional)
3. **Download** the new release
4. **Extract** and run

---

## ✅ Verification

After installation, verify everything works:

1. ✅ App launches without errors
2. ✅ Login screen appears
3. ✅ Can browse font library (or see "No fonts" message)
4. ✅ Can activate a font (if fonts are available)
5. ✅ Font appears in Adobe apps (if activated)

---

## 🆘 Need Help?

- **Documentation:** See [README.md](README.md)
- **Issues:** [GitHub Issues](https://github.com/werqaferaw/abugida/issues)
- **Release Notes:** [RELEASE_NOTES_v2.0.0.md](RELEASE_NOTES_v2.0.0.md)

---

## 📝 Uninstallation

Since this is a portable app:

1. **Close** the application
2. **Delete** the folder where you extracted it
3. **Done!** No registry entries or system files to clean

**Note:** Fonts activated during sessions are automatically cleaned up when you close the app.

---

**Installation complete! Enjoy using Abugida Font Manager! 🎨**

