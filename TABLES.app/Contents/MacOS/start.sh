#!/bin/bash

# Get the directory where the script resides
CURRENTPATH=$(cd "$(dirname "$0")" && pwd)

# Define internal paths relative to the executable location
# Based on your previous setup, binaries are in 'support-bin'
BIN_DIR="$CURRENTPATH/support-bin/npm_source/bin"
NODE="$BIN_DIR/node"
NPM="$BIN_DIR/npm-cli.js"

# Ensure we are in the directory where package.json lives 
# (Likely Contents/Resources or the MacOS folder itself depending on your build)
cd "$CURRENTPATH"

# 1. Run NPM Install in the background (Optional: redirect logs to a file for debugging)
# We use & to background it, but for Electron, you might want install to finish first.
"$NODE" "$NPM" install --no-audit --no-fund > /dev/null 2>&1

# 2. Launch the app using NPM Start
# Using 'exec' replaces the shell script process with the Node process.
# This prevents a "zombie" shell script from hanging around and 
# ensures the app closes properly when the process is terminated.
exec "$NODE" "$NPM" start