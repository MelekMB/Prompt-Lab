#!/bin/bash
set -e

cleanup() {
  echo "[dev] Shutting down..."
  kill -- -$$ 2>/dev/null || true
}
trap cleanup TERM INT

# Build the API server
echo "[dev] Building API server..."
pnpm --filter @workspace/api-server run build

# Start API server on port 8082 in the background
echo "[dev] Starting API server on port 8082..."
PORT=8082 NODE_ENV=development node --enable-source-maps \
  /home/runner/workspace/artifacts/api-server/dist/index.mjs &

# Small delay so the API server is ready before Vite proxy needs it
sleep 2

# Start Vite dev server in the foreground (opens port 8080 — the monitored port)
echo "[dev] Starting Vite dev server on port $PORT..."
pnpm run vite-dev
