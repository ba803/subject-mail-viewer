# ==============================================================================
# Subject Mail Viewer - One-Click GitHub Push Helper
# ==============================================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Subject Mail Viewer - GitHub Push & Deployment Helper" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$existingRemote = git remote get-url origin 2>$null

if ($existingRemote) {
    Write-Host "Found existing remote origin: $existingRemote" -ForegroundColor Green
    $choice = Read-Host "Do you want to push to this repository? (Y/n)"
    if ($choice -eq 'n' -or $choice -eq 'N') {
        $repoUrl = Read-Host "Enter your new GitHub repository URL (e.g. https://github.com/username/repo.git)"
        if ($repoUrl) {
            git remote set-url origin $repoUrl
        }
    }
} else {
    Write-Host "No remote origin configured yet." -ForegroundColor Yellow
    Write-Host "Create a new repository on GitHub: https://github.com/new" -ForegroundColor White
    Write-Host "(Do NOT check 'Initialize with README' or add .gitignore)" -ForegroundColor Gray
    Write-Host ""
    $repoUrl = Read-Host "Paste your GitHub repository URL here (e.g. https://github.com/username/subject-mail-viewer.git)"
    
    if (-not $repoUrl) {
        Write-Host "No URL provided. Exiting..." -ForegroundColor Red
        exit
    }
    
    git remote add origin $repoUrl.Trim()
}

Write-Host ""
Write-Host "Pushing 'main' branch to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host " SUCCESS: Repository pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps for GitHub Pages Deployment:" -ForegroundColor Yellow
    Write-Host "1. Open your repository on GitHub.com" -ForegroundColor White
    Write-Host "2. Go to: Settings -> Pages" -ForegroundColor White
    Write-Host "3. Under 'Build and deployment' -> 'Source', select: GitHub Actions" -ForegroundColor White
    Write-Host "4. Go to the 'Actions' tab to see your deployment running automatically!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed. Please check that you are logged into Git/GitHub and that the repository URL is correct." -ForegroundColor Red
}

