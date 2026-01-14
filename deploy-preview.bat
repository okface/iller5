@echo off
setlocal

set "MESSAGE=%~1"
if "%MESSAGE%"=="" set "MESSAGE=Update preview content"

echo --- Iller5 Preview Deployment Helper ---
echo Branch: copilot/deploy-github-pages-app

:: 1. Check current branch
for /f "delims=" %%i in ('git branch --show-current') do set "CURRENT_BRANCH=%%i"

if /I not "%CURRENT_BRANCH%"=="copilot/deploy-github-pages-app" (
    echo Error: You must be on the copilot/deploy-github-pages-app branch
    echo Current branch: %CURRENT_BRANCH%
    echo Run: git checkout copilot/deploy-github-pages-app
    exit /b 1
)

:: 2. Run Bundler
echo 1. Running Bundler...
python scripts/bundle.py
if %ERRORLEVEL% NEQ 0 (
    echo Error: Bundler failed. Fix errors before pushing.
    exit /b %ERRORLEVEL%
)

:: 3. Git Operations
echo 2. Adding files...
git add .

echo 3. Committing...
git commit -m "%MESSAGE%"

echo 4. Pushing to GitHub...
git push origin copilot/deploy-github-pages-app

echo --- Success! ---
echo GitHub Actions will now build and deploy your preview site.
echo The preview will be available at a separate URL once configured.
echo Check progress here: https://github.com/okface/iller5/actions
echo.
echo See DEPLOY-PREVIEW.md for instructions on accessing the preview site.
