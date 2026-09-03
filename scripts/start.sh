#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

PORT=5000
DEPLOY_RUN_PORT="${DEPLOY_RUN_PORT:-$PORT}"


start_service() {
    cd "${COZE_WORKSPACE_PATH}"
    # 将构建时复制的 .env 从 dist-server 恢复到项目根目录，供 dotenv/config 加载
    if [ -f "${COZE_WORKSPACE_PATH}/dist-server/.env" ] && [ ! -f "${COZE_WORKSPACE_PATH}/.env" ]; then
      cp "${COZE_WORKSPACE_PATH}/dist-server/.env" "${COZE_WORKSPACE_PATH}/.env"
    fi
    echo "Starting express production server on port ${DEPLOY_RUN_PORT}..."
    PORT=$DEPLOY_RUN_PORT node dist-server/server.js
}

echo "Starting express production server on port ${DEPLOY_RUN_PORT}..."
start_service
