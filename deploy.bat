@echo off
setlocal

set "MESSAGE=%~1"
if "%MESSAGE%"=="" set "MESSAGE=Update content"

echo --- Iller5 Deployment Helper ---

:: 1. Run Bundler
echo 1. Running Bundler...
python scripts/bundle.py
if %ERRORLEVEL% NEQ 0 (
    echo Error: Bundler failed. Fix errors before pushing.
    exit /b %ERRORLEVEL%
)

:: 2. Git Operations
echo 2. Adding files...
git add .

echo 3. Committing...
git commit -m "%MESSAGE%"

echo 4. Pushing to GitHub...
git push origin main

echo --- Success! ---
echo GitHub Actions will now build and deploy your site.
echo Check progress here: https://github.com/okface/iller5/actions
