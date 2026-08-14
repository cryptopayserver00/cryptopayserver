#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/app/cryptopayserver"
SERVICE_NAME="cryptopayserver"

echo "==> Deploy started at $(date)"
cd "$APP_DIR"

echo "==> git pull"
git pull

echo "==> yarn install"
yarn

echo "==> prisma generate"
yarn prisma generate

echo "==> yarn build"
yarn build

echo "==> prisma migrate deploy"
yarn prisma migrate deploy

echo "==> restart service: $SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME"

echo "==> service status"
sudo systemctl --no-pager --full status "$SERVICE_NAME" || true

echo "==> Deploy finished at $(date)"