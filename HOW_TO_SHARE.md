# How to Share the MVP with Your Friend

## ✅ Good News: The App is Built!

The app is fully functional in `release/win-unpacked/`

## Option 1: Share the Folder (Easiest for MVP)

1. **Zip the folder:**
   ```
   release/win-unpacked/
   ```
   
2. **Send the zip** to your friend (via Google Drive, WeTransfer, etc.)

3. **Your friend:**
   - Extracts the zip
   - Runs `Abugida Font Manager.exe`
   - That's it!

## Option 2: Create Installer (If You Want)

The installer build is failing due to Windows permissions. To fix:

1. **Run PowerShell as Administrator**
2. **Navigate to project:**
   ```powershell
   cd "C:\Users\lames\OneDrive\Desktop\abugida"
   ```
3. **Build:**
   ```powershell
   $env:CSC_IDENTITY_AUTO_DISCOVERY='false'
   npm run package
   ```

This creates `release/Abugida Font Manager Setup 1.0.0.exe`

## What Your Friend Gets

✅ **Full working app** - All features functional  
✅ **Local fonts included** - Bela Hidase Qedmo ready to preview/install  
✅ **No installation needed** - Just run the .exe from the folder  
✅ **Works offline** - No internet required  

## System Requirements

- Windows 10 (1809+) or Windows 11
- ~200MB disk space
- No admin rights needed for per-user font installation

## Known Limitations for MVP

- **Not signed** - Windows will show "Unknown publisher" warning (normal for MVP)
- **No auto-update** - Manual reinstall needed for updates
- **Local fonts only** - Supabase integration is optional

## Testing Checklist

Before sharing, verify:
- [ ] App launches without errors
- [ ] Login works (any email/password)
- [ ] Font library shows Bela Hidase Qedmo
- [ ] Preview renders Amharic text correctly
- [ ] Install button works
- [ ] Font appears in Word/Photoshop
- [ ] Uninstall removes the font

## File Size

The zipped folder will be ~120-150MB (includes Electron runtime + fonts)

---

**For MVP, Option 1 (zip folder) is perfectly fine!**

