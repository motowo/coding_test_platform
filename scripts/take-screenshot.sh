#!/bin/bash

# スクリーンショット取得スクリプト
# Usage: ./scripts/take-screenshot.sh <URL> <basename> [description]

set -e

URL="$1"
BASENAME="$2"
DESCRIPTION="${3:-Screenshot}"

if [ -z "$URL" ] || [ -z "$BASENAME" ]; then
    echo "Usage: $0 <URL> <basename> [description]"
    echo "Example: $0 http://localhost:3000 home_page 'Homepage screenshot'"
    exit 1
fi

echo "=== Taking Screenshot ==="
echo "URL: $URL"
echo "Basename: $BASENAME"
echo "Description: $DESCRIPTION"
echo ""

# Run screenshot script
node simple-screenshot.js "$URL" "$BASENAME"

# Get the latest screenshot
LATEST_SCREENSHOT=$(ls -t screenshot/*_${BASENAME}.png 2>/dev/null | head -1)

if [ -n "$LATEST_SCREENSHOT" ]; then
    echo ""
    echo "=== Screenshot Details ==="
    echo "File: $LATEST_SCREENSHOT"
    echo "Size: $(ls -lh "$LATEST_SCREENSHOT" | awk '{print $5}')"
    echo "Created: $(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$LATEST_SCREENSHOT")"
    echo ""
    echo "✅ Screenshot successfully saved!"
else
    echo "❌ Screenshot file not found"
    exit 1
fi