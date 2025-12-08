#!/bin/bash
set -e  # stop if anything fails

PROJECT_DIR=~/cookboek
BACKEND_DIR=$PROJECT_DIR/backend
FRONTEND_DIST=$PROJECT_DIR/frontend/dist
BACKEND_PUBLIC=$BACKEND_DIR/public

echo "=== Starting deployment on $(date) ==="

# Step 1: Update backend dependencies
if [ -d "$BACKEND_DIR" ]; then
  echo "--- Installing backend dependencies ---"
  cd $BACKEND_DIR
  npm install --omit=dev
fi

# Step 2: Deploy frontend build into backend/public
if [ -d "$FRONTEND_DIST" ]; then
  echo "--- Copying frontend build into backend/public ---"
  rm -rf $BACKEND_PUBLIC/dist
  mkdir -p $BACKEND_PUBLIC
  cp -r $FRONTEND_DIST $BACKEND_PUBLIC/
fi

# Step 3: Restart backend with pm2
if command -v pm2 > /dev/null; then
  echo "--- Restarting backend with pm2 ---"
  pm2 restart backend || pm2 start dist/index.js --name backend
else
  echo "⚠️ pm2 not found. Please install it with: npm install -g pm2"
fi

echo "=== Deployment finished ==="
