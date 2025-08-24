#!/bin/bash

# Load nvm and start the development server
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 20 (or install if not available)
if ! nvm use 20 2>/dev/null; then
    echo "Installing Node.js 20..."
    nvm install 20
    nvm use 20
fi

# Start the development server
echo "Starting development server with Node.js $(node --version)..."
npm run dev
