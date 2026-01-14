# Preview Deployment Guide for Iller5

This guide explains how to deploy and access the preview version of Iller5 from the `copilot/add-subject-picking-functionality` branch without affecting the main production site.

## Overview

- **Main App**: Deployed from `main` branch → https://okface.github.io/iller5/
- **Preview App**: Deployed from `copilot/add-subject-picking-functionality` branch → https://okface.github.io/iller5-preview/

Both deployments are completely independent and do not interfere with each other.

## How It Works

The preview deployment uses a separate GitHub workflow (`.github/workflows/deploy-preview.yml`) that:

1. Triggers automatically on pushes to the `copilot/add-subject-picking-functionality` branch
2. Bundles the YAML data files using the Python bundler
3. Builds the Vue app with a different base path (`/iller5-preview/`)
4. Deploys the built files to a separate `gh-pages-preview` branch

## One-Time Setup

To enable the preview site, you need to configure GitHub Pages to serve from the `gh-pages-preview` branch:

### Option 1: Using GitHub's Multiple Pages (Requires GitHub Pro/Enterprise)
If you have GitHub Pro or Enterprise, you can enable multiple GitHub Pages sites per repository.

1. Go to your repository settings: https://github.com/okface/iller5/settings/pages
2. Under "Build and deployment", create a new Pages site
3. Set the source to the `gh-pages-preview` branch
4. The preview will be available at: https://okface.github.io/iller5-preview/

### Option 2: Manual Switching (Free GitHub)
With free GitHub, you can only have one active Pages site at a time. To test the preview:

1. Go to: https://github.com/okface/iller5/settings/pages
2. Under "Build and deployment" > "Source", keep "GitHub Actions" selected
3. The workflow will build and push to `gh-pages-preview` branch
4. When you want to test the preview, temporarily change:
   - Source: "Deploy from a branch"
   - Branch: `gh-pages-preview` / `(root)`
   - Click "Save"
5. Wait ~1 minute, then access: https://okface.github.io/iller5/
6. When done testing, switch back to "GitHub Actions" to restore the main site

### Option 3: Download Build Artifact (Easiest for Testing)
The simplest way to test without changing GitHub Pages settings:

1. Push to the `copilot/add-subject-picking-functionality` branch
2. Go to: https://github.com/okface/iller5/actions
3. Click on the latest "Deploy Preview Branch" workflow run
4. The workflow builds the site (though it deploys to `gh-pages-preview`)
5. You can check out the `gh-pages-preview` branch locally:
   ```bash
   git fetch origin
   git checkout gh-pages-preview
   ```
6. Serve it locally:
   ```bash
   npx serve .
   ```
   or
   ```bash
   python -m http.server 8000
   ```
7. Open: http://localhost:8000/

## Deploying Changes to Preview

### Using the Deployment Script (Recommended)

**Windows (PowerShell):**
```powershell
# Switch to the preview branch
git checkout copilot/add-subject-picking-functionality

# Make your changes, then deploy
./deploy-preview.ps1 "Added new subject picking features"
```

**Linux/Mac (Bash):**
```bash
# Switch to the preview branch
git checkout copilot/add-subject-picking-functionality

# Make your changes, then deploy
./deploy-preview.sh "Added new subject picking features"
```

### Manual Deployment

```bash
# 1. Switch to preview branch
git checkout copilot/add-subject-picking-functionality

# 2. Run the bundler
python scripts/bundle.py

# 3. Commit and push
git add .
git commit -m "Your message"
git push origin copilot/add-subject-picking-functionality

# 4. GitHub Actions will automatically build and deploy
```

## Monitoring Deployments

- **Main deployment**: https://github.com/okface/iller5/actions/workflows/deploy.yml
- **Preview deployment**: https://github.com/okface/iller5/actions/workflows/deploy-preview.yml

## Merging Preview to Main

Once you're satisfied with the preview and want to make it the main site:

```bash
# 1. Switch to main branch
git checkout main

# 2. Merge the preview branch
git merge copilot/add-subject-picking-functionality

# 3. Push to deploy
git push origin main
```

## Troubleshooting

### Preview site shows 404
- Ensure the workflow ran successfully (check Actions tab)
- Verify GitHub Pages is configured correctly
- Wait a few minutes for GitHub to process the deployment

### Changes not appearing
- Check that you pushed to the correct branch: `copilot/add-subject-picking-functionality`
- Verify the workflow completed successfully
- Clear your browser cache or try incognito mode

### Build failures
- Check the workflow logs in the Actions tab
- Ensure all YAML files are correctly formatted
- Run `python scripts/bundle.py` locally to check for errors

## Architecture Notes

The preview deployment uses a different base path (`/iller5-preview/`) which is configured during the build process by modifying `vite.config.js`. This ensures:

1. Asset paths are correct for the preview subdirectory
2. Routing works properly in the deployed preview app
3. The preview doesn't conflict with the main deployment

The main app continues to use `/iller5/` as its base path and deploys from the `main` branch independently.
