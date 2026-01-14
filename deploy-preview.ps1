# Deploy Helper Script for Iller5 Preview Branch
# Usage: ./deploy-preview.ps1 "Your commit message"

param (
    [string]$message = "Update preview content"
)

Write-Host "--- Iller5 Preview Deployment Helper ---" -ForegroundColor Cyan
Write-Host "Branch: copilot/add-subject-picking-functionality" -ForegroundColor Yellow

# 1. Check current branch
$currentBranch = git branch --show-current
if ($currentBranch -ne "copilot/add-subject-picking-functionality") {
    Write-Host "Error: You must be on the copilot/add-subject-picking-functionality branch" -ForegroundColor Red
    Write-Host "Current branch: $currentBranch" -ForegroundColor Red
    Write-Host "Run: git checkout copilot/add-subject-picking-functionality" -ForegroundColor Yellow
    exit 1
}

# 2. Run Bundler locally (just to be safe and sanity check)
Write-Host "1. Running Bundler..." -ForegroundColor Yellow
python scripts/bundle.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Bundler failed. Fix errors before pushing." -ForegroundColor Red
    exit $LASTEXITCODE
}

# 3. Git Operations
Write-Host "2. Adding files..." -ForegroundColor Yellow
git add .

Write-Host "3. Committing..." -ForegroundColor Yellow
git commit -m "$message"

Write-Host "4. Pushing to GitHub..." -ForegroundColor Yellow
git push origin copilot/add-subject-picking-functionality

Write-Host "--- Success! ---" -ForegroundColor Green
Write-Host "GitHub Actions will now build and deploy your preview site."
Write-Host "The preview will be available at a separate URL once configured." -ForegroundColor Cyan
Write-Host "Check progress here: https://github.com/okface/iller5/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "See DEPLOY-PREVIEW.md for instructions on accessing the preview site." -ForegroundColor Yellow
