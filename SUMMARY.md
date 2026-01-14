# Parallel GitHub Pages Deployment - Implementation Summary

## Overview

This implementation enables deploying the `copilot/add-subject-picking-functionality` branch to a separate location for testing without affecting the main production site.

## What Was Implemented

### 1. GitHub Actions Workflow
**File:** `.github/workflows/deploy-preview.yml`

A new workflow that:
- Triggers on pushes to `copilot/add-subject-picking-functionality` branch
- Can also be manually triggered via `workflow_dispatch`
- Bundles YAML data using the Python bundler
- Modifies the Vite base path to `/iller5-preview/` during build
- Deploys the built site to the `gh-pages-preview` branch
- Runs independently from the main deployment workflow

### 2. Deployment Scripts
**Files:** `deploy-preview.ps1`, `deploy-preview.sh`

Cross-platform deployment scripts that:
- Verify you're on the correct branch
- Run the bundler to generate `content.json`
- Add, commit, and push changes
- Provide helpful feedback and next steps

**Usage:**
```bash
# Windows
./deploy-preview.ps1 "Your commit message"

# Linux/Mac
./deploy-preview.sh "Your commit message"
```

### 3. Documentation
**Files:** `DEPLOY-PREVIEW.md`, `SETUP-PREVIEW.md`, updated `readme.md`

Comprehensive guides covering:
- How the preview deployment works
- Setup instructions (multiple options)
- How to deploy changes
- How to access the preview site
- Troubleshooting tips
- Merge strategy for promoting preview to main

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    Iller5 Repository                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  main branch                                                │
│  ├─ Push/Merge                                              │
│  └─> deploy.yml                                             │
│      └─> Builds with base: '/iller5/'                       │
│          └─> Deploys to GitHub Pages (main site)            │
│              URL: https://okface.github.io/iller5/          │
│                                                             │
│  copilot/add-subject-picking-functionality branch           │
│  ├─ Push/Merge                                              │
│  └─> deploy-preview.yml                                     │
│      └─> Builds with base: '/iller5-preview/'               │
│          └─> Deploys to gh-pages-preview branch             │
│              URL: (Configure in GitHub Pages settings)      │
│                   https://okface.github.io/iller5-preview/  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Testing the Implementation

### Option 1: Local Testing (Recommended First Step)

1. **Trigger the workflow:**
   ```bash
   git checkout copilot/add-subject-picking-functionality
   git commit --allow-empty -m "Test preview deployment"
   git push origin copilot/add-subject-picking-functionality
   ```

2. **Monitor the workflow:**
   - Go to: https://github.com/okface/iller5/actions
   - Look for the "Deploy Preview Branch (Subject Picking)" workflow
   - Wait for it to complete

3. **Test locally:**
   ```bash
   git fetch origin
   git checkout gh-pages-preview
   npx serve .
   # Open http://localhost:3000/ in your browser
   ```

### Option 2: GitHub Pages Setup (For Live Preview)

With **GitHub Free**, you can only have one active Pages site at a time. You have two approaches:

**A. Temporary Switch for Testing:**
1. Go to: https://github.com/okface/iller5/settings/pages
2. Change "Source" from "GitHub Actions" to "Deploy from a branch"
3. Select branch: `gh-pages-preview` / `(root)`
4. Wait ~1-2 minutes for deployment
5. Access at: https://okface.github.io/iller5/
6. **Important:** Switch back to "GitHub Actions" when done to restore the main site

**B. GitHub Pro/Enterprise (Multiple Pages Sites):**
If you have GitHub Pro/Enterprise, you can set up a second Pages site:
1. Go to repository settings → Pages
2. Add a new GitHub Pages site
3. Configure it to deploy from `gh-pages-preview` branch
4. It will be available at a different URL

## Key Features

✅ **Isolated Deployments**: Main and preview are completely independent
✅ **Automatic Building**: Both workflows run automatically on push
✅ **Different Base Paths**: Ensures assets load correctly on both sites
✅ **Manual Trigger**: Can manually trigger workflows via GitHub UI
✅ **Cross-Platform Scripts**: Deployment scripts for Windows, Linux, and Mac
✅ **Comprehensive Docs**: Multiple documentation files for different use cases

## Files Created/Modified

### New Files:
- `.github/workflows/deploy-preview.yml` - Preview deployment workflow
- `deploy-preview.ps1` - PowerShell deployment script
- `deploy-preview.sh` - Bash deployment script (executable)
- `DEPLOY-PREVIEW.md` - Comprehensive deployment guide
- `SETUP-PREVIEW.md` - Quick setup reference
- `SUMMARY.md` - This file

### Modified Files:
- `readme.md` - Added deployment section with preview info

## Next Steps

1. **Test the workflow** by pushing to the preview branch
2. **Choose a testing approach** (local or GitHub Pages switch)
3. **Review the preview** to ensure the subject-picking functionality works
4. **Merge to main** when satisfied with the preview

## Troubleshooting

### Workflow fails
- Check the Actions tab for detailed error logs
- Ensure all YAML files in `data/` are valid
- Verify `requirements.txt` and `package.json` are up to date

### Preview site doesn't load
- Verify the workflow completed successfully
- Check that you're using the correct URL with the base path
- Clear browser cache or try incognito mode

### Changes not appearing
- Ensure you pushed to the correct branch
- Wait a few minutes for GitHub to process the deployment
- Check that the workflow ran successfully

## Maintenance

### To update the preview base path:
Edit `.github/workflows/deploy-preview.yml`, line 49:
```yaml
sed -i "s|base: '/iller5/'|base: '/your-new-path/'|g" vite.config.js
```

### To deploy to a different branch:
Edit `.github/workflows/deploy-preview.yml`, line 58:
```yaml
publish_branch: your-branch-name
```

## Questions?

See the documentation files for detailed information:
- **Quick reference**: `SETUP-PREVIEW.md`
- **Complete guide**: `DEPLOY-PREVIEW.md`
- **Main docs**: `readme.md` section 6
