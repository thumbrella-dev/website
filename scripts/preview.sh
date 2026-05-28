#!/bin/bash
set -e

# Preview: astro build --watch + wrangler dev --live-reload
# Ctrl+C kills both processes.

BUILD_PID=""

cleanup() {
    echo ""
    echo "Shutting down..."
    if [ -n "$BUILD_PID" ]; then
        kill $BUILD_PID 2>/dev/null
        wait $BUILD_PID 2>/dev/null
    fi
    exit 0
}
trap cleanup INT TERM

echo "==> Building (watch mode)..."
astro build --mode development --watch &
BUILD_PID=$!

echo "==> Waiting for build output..."
until [ -f dist/server/wrangler.json ] && ls dist/client/_astro/*.css >/dev/null 2>&1; do
    sleep 1
done
sleep 2  # let any remaining writes finish

echo "==> Starting wrangler dev (live reload)..."
echo "    (look for 'Ready on' below — Ctrl+C to stop)"
echo ""
wrangler dev --live-reload --local
