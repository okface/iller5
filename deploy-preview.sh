#!/bin/bash
# Deploy Helper Script for Iller5 Preview Branch
# Usage: ./deploy-preview.sh "Your commit message"

MESSAGE="${1:-Update preview content}"

echo "--- Iller5 Preview Deployment Helper ---"
echo "Branch: copilot/add-subject-picking-functionality"

# 1. Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "copilot/add-subject-picking-functionality" ]; then
    echo "Error: You must be on the copilot/add-subject-picking-functionality branch"
    echo "Current branch: $CURRENT_BRANCH"
    echo "Run: git checkout copilot/add-subject-picking-functionality"
    exit 1
fi

# 2. Run Bundler locally (sanity check)
echo "1. Running Bundler..."
python scripts/bundle.py
if [ $? -ne 0 ]; then
    echo "Error: Bundler failed. Fix errors before pushing."
    exit 1
fi

# 3. Git Operations
echo "2. Adding files..."
git add .

echo "3. Committing..."
git commit -m "$MESSAGE"

echo "4. Pushing to GitHub..."
git push origin copilot/add-subject-picking-functionality

echo "--- Success! ---"
echo "GitHub Actions will now build and deploy your preview site."
echo "The preview will be available at a separate URL once configured."
echo "Check progress here: https://github.com/okface/iller5/actions"
echo ""
echo "See DEPLOY-PREVIEW.md for instructions on accessing the preview site."
