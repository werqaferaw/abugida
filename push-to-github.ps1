# Quick GitHub Setup Script
# This will help you push to GitHub in seconds

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Abugida GitHub Publisher" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is configured
$gitEmail = git config user.email
$gitName = git config user.name

if (-not $gitEmail -or -not $gitName) {
    Write-Host "⚠️  Git not configured. Let's fix that:" -ForegroundColor Yellow
    Write-Host ""
    $email = Read-Host "Your email"
    $name = Read-Host "Your name"
    git config --global user.email $email
    git config --global user.name $name
    Write-Host "✓ Git configured!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Step 1: Create GitHub Repo" -ForegroundColor Green
Write-Host "Opening GitHub in your browser..." -ForegroundColor Gray
Start-Sleep -Seconds 1
Start-Process "https://github.com/new"

Write-Host ""
Write-Host "In your browser:" -ForegroundColor Yellow
Write-Host "  1. Name: 'abugida-font-manager'" -ForegroundColor White
Write-Host "  2. Description: 'Amharic Font Manager for Windows'" -ForegroundColor White
Write-Host "  3. Choose Public or Private" -ForegroundColor White
Write-Host "  4. DO NOT check any initialize options (README, .gitignore, license)" -ForegroundColor White
Write-Host "  5. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$ready = Read-Host "Press ENTER after you've created the repo"

Write-Host ""
Write-Host "Step 2: What's your GitHub username?" -ForegroundColor Green
$username = Read-Host "GitHub username"

Write-Host ""
Write-Host "Step 3: Pushing to GitHub..." -ForegroundColor Green

$repoUrl = "https://github.com/$username/abugida-font-manager.git"

try {
    git remote add origin $repoUrl 2>$null
    git branch -M main
    git push -u origin main
    
    Write-Host ""
    Write-Host "✓ SUCCESS! Your code is on GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your repo:" -ForegroundColor Cyan
    Write-Host "  https://github.com/$username/abugida-font-manager" -ForegroundColor White
    Write-Host ""
    
    $openRepo = Read-Host "Open repo in browser? (y/n)"
    if ($openRepo -eq 'y') {
        Start-Process "https://github.com/$username/abugida-font-manager"
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "If 'remote origin already exists', try:" -ForegroundColor Yellow
    Write-Host "  git remote remove origin" -ForegroundColor White
    Write-Host "  Then run this script again" -ForegroundColor White
}

Write-Host ""
Write-Host "All done! Get some rest 🌙" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press ENTER to close"

