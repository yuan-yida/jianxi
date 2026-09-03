#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --prefer-offline --loglevel debug --reporter=append-only

echo "Building frontend with Vite..."
pnpm vite build

echo "Bundling server with tsup..."
pnpm tsup server/server.ts --format cjs --platform node --target node20 --outDir dist-server --no-splitting --no-minify --external vite --external "@vitejs/plugin-vue" --external "@vue/compiler-sfc"

# 复制 .env 到部署目录（.env 在 .gitignore 中，不会通过 git 提交）
if [ -f "${COZE_WORKSPACE_PATH}/.env" ]; then
  cp "${COZE_WORKSPACE_PATH}/.env" "${COZE_WORKSPACE_PATH}/dist-server/.env"
  echo ".env copied to dist-server/"
fi

echo "Build completed successfully!"
