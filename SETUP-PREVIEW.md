# Quick Setup Guide for Preview Deployment

This is a quick reference for setting up the parallel deployment of the `copilot/add-subject-picking-functionality` branch.

## What was added:

1. **Workflow file**: `.github/workflows/deploy-preview.yml`
   - Automatically builds and deploys when you push to `copilot/add-subject-picking-functionality`
   - Deploys to `gh-pages-preview` branch with `/iller5-preview/` base path

2. **Deployment scripts**:
   - `deploy-preview.ps1` (Windows PowerShell)
   - `deploy-preview.sh` (Linux/Mac Bash)

3. **Documentation**:
   - `DEPLOY-PREVIEW.md` (comprehensive guide)
   - Updated `readme.md` with deployment info

## Quick Start:

### To deploy the preview branch:

```bash
# Switch to the preview branch
git checkout copilot/add-subject-picking-functionality

# Make your changes, then use the deployment script
./deploy-preview.sh "Your commit message"
```

### To access the preview:

The workflow will build and deploy to the `gh-pages-preview` branch automatically.

**Option 1 - Local testing (easiest):**
```bash
git fetch origin
git checkout gh-pages-preview
npx serve .
# Open http://localhost:3000/
```

**Option 2 - GitHub Pages (requires setup):**
1. Go to: https://github.com/okface/iller5/settings/pages
2. Change Source to "Deploy from a branch"
3. Select branch: `gh-pages-preview`
4. Wait ~1 minute
5. Access at the GitHub Pages URL

See `DEPLOY-PREVIEW.md` for detailed instructions and troubleshooting.

## Files modified/added:

- `.github/workflows/deploy-preview.yml` (new)
- `deploy-preview.ps1` (new)
- `deploy-preview.sh` (new)
- `DEPLOY-PREVIEW.md` (new)
- `readme.md` (updated)

## How it works:

1. You push to `copilot/add-subject-picking-functionality`
2. GitHub Actions triggers the preview workflow
3. Workflow:
   - Bundles YAML data → `content.json`
   - Modifies `vite.config.js` to use `/iller5-preview/` base
   - Builds the Vue app
   - Deploys to `gh-pages-preview` branch
4. The preview is isolated from the main app (which deploys from `main` to `gh-pages`)
