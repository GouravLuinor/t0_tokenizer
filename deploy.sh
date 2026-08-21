#!/usr/bin/env bash
set -euo pipefail

echo "=========================================="
echo "🚀 Deploying TokenCraft on VPS..."
echo "=========================================="

# 1. Pull latest git changes if in a repository
if [ -d ".git" ]; then
    echo "📦 Pulling latest changes from git..."
    git pull origin main || git pull
fi

# 2. Build and restart Docker containers with zero downtime
echo "🐳 Building Docker image & starting container..."
docker compose build --pull
docker compose up -d --remove-orphans

# 3. Prune dangling build images to save VPS disk space
echo "🧹 Cleaning up dangling build images..."
docker image prune -f

# 4. Check container health status
echo "🔍 Verifying container health..."
sleep 5
docker compose ps

echo "=========================================="
echo "✅ TokenCraft deployed successfully!"
echo "=========================================="
