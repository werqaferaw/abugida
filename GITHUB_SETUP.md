# Publishing to GitHub

## Step 1: Create Repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `abugida-font-manager`
3. Description: `Amharic Font Manager for Windows - Desktop app for managing Ethiopian fonts`
4. **Keep it Public** (or Private if you prefer)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push Your Code

GitHub will show you commands. Use these:

```bash
cd "C:\Users\lames\OneDrive\Desktop\abugida"

# Add GitHub as remote
git remote add origin https://github.com/YOUR-USERNAME/abugida-font-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 3: Verify

Check that these files are on GitHub:
- ✅ README.md (with nice formatting)
- ✅ All source code
- ✅ Font files
- ✅ Documentation
- ❌ `.env` file (should NOT be there - it's in .gitignore)
- ❌ `node_modules/` (should NOT be there)
- ❌ `dist/` and `release/` (should NOT be there)

## Step 4: Share with Your Friend

Send them the GitHub link:
```
https://github.com/YOUR-USERNAME/abugida-font-manager
```

They can:
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`

Or download a release (see next step).

## Step 5: Create a Release (Optional)

To share the built app:

1. Go to your repo on GitHub
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `Abugida Font Manager v1.0.0 - MVP`
5. Description:
   ```markdown
   ## First Release - MVP
   
   Amharic Font Manager for Windows
   
   ### Features
   - Font preview with Amharic text
   - One-click install/uninstall
   - Native Windows UI
   - Includes Bela Hidase Qedmo font
   
   ### Installation
   1. Download `Abugida-Font-Manager-win.zip`
   2. Extract and run `Abugida Font Manager.exe`
   
   ### Requirements
   - Windows 10 (1809+) or Windows 11
   ```
6. **Attach files:**
   - Zip the `release/win-unpacked/` folder
   - Name it `Abugida-Font-Manager-win.zip`
   - Drag and drop to the release
7. Click "Publish release"

## Security Notes

✅ **Safe to commit:**
- Source code
- Font files (if you have rights to distribute)
- Documentation
- Configuration templates (`env.example`)

❌ **Never commit:**
- `.env` file (contains your Supabase keys)
- `node_modules/`
- Build artifacts (`dist/`, `release/`)
- Personal API keys or secrets

Your `.gitignore` is already configured correctly!

## Updating the Repo

When you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

---

**Your repo is ready to share! 🚀**

