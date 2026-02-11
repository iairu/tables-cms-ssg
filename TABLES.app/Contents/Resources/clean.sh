#!/bin/bash
# clean.sh — Remove Gatsby build artifacts to force a full rebuild on next launch

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CMS_DIR="$SCRIPT_DIR/cms-site"

echo "Cleaning Gatsby build artifacts..."

# Remove built static files
if [ -d "$CMS_DIR/public" ]; then
  rm -rf "$CMS_DIR/public"
  echo "  ✓ Removed public/"
else
  echo "  - public/ not found (already clean)"
fi

# Remove Gatsby cache
if [ -d "$CMS_DIR/.cache" ]; then
  rm -rf "$CMS_DIR/.cache"
  echo "  ✓ Removed .cache/"
else
  echo "  - .cache/ not found (already clean)"
fi

echo "Done. Next launch will trigger a full gatsby build."
