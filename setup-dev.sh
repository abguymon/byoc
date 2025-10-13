#!/bin/bash

# BYOC Development Environment Setup Script
# This script sets up the development environment using nvm

echo "🍰 Setting up BYOC development environment..."

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if nvm is loaded
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm not found. Please install nvm first."
    echo "Run: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
    exit 1
fi

# Use Node.js 20 (recommended for this project)
echo "📦 Using Node.js 20..."
nvm use 20

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check Node.js and npm versions
echo "🔍 Current versions:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

echo ""
echo "🎉 Development environment ready!"
echo "🚀 Run 'npm run dev' to start the development server"
echo "🌐 The app will be available at http://localhost:4321"
