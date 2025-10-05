#!/bin/bash

# DayCounter Build Script
# This script builds all platforms: web, Chrome extension, and Android APK

set -e

echo "🚀 Starting DayCounter build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build shared package first
print_status "Building shared package..."
cd shared
npm run build
cd ..

# Build web app
print_status "Building web application..."
cd web
npm run build
print_success "Web app built successfully"
cd ..

# Build Chrome extension
print_status "Building Chrome extension..."
cd extension
npm run build
print_success "Chrome extension built successfully"
cd ..

# Build mobile app (if Expo CLI is available)
if command -v expo &> /dev/null; then
    print_status "Building mobile app..."
    cd mobile
    npm run build
    print_success "Mobile app built successfully"
    cd ..
else
    print_warning "Expo CLI not found. Skipping mobile build."
    print_warning "Install Expo CLI with: npm install -g @expo/cli"
fi

# Create distribution directories
print_status "Creating distribution directories..."
mkdir -p dist/web
mkdir -p dist/extension
mkdir -p dist/mobile

# Copy built files
print_status "Copying built files..."

# Copy web build
cp -r web/dist/* dist/web/ 2>/dev/null || print_warning "Web build not found"

# Copy extension build
cp -r extension/dist/* dist/extension/ 2>/dev/null || print_warning "Extension build not found"

# Copy mobile build
cp -r mobile/dist/* dist/mobile/ 2>/dev/null || print_warning "Mobile build not found"

# Create extension zip
print_status "Creating Chrome extension package..."
cd dist/extension
zip -r ../daycounter-extension.zip . -x "*.DS_Store" "*.git*"
cd ../..
print_success "Chrome extension package created: dist/daycounter-extension.zip"

# Create build info
cat > dist/build-info.txt << EOF
DayCounter Build Information
==========================
Build Date: $(date)
Node Version: $(node -v)
NPM Version: $(npm -v)

Platforms Built:
- Web App: $(test -d dist/web && echo "✅ Built" || echo "❌ Failed")
- Chrome Extension: $(test -f dist/daycounter-extension.zip && echo "✅ Built" || echo "❌ Failed")
- Mobile App: $(test -d dist/mobile && echo "✅ Built" || echo "❌ Failed")

Next Steps:
1. Web App: Deploy dist/web/ to your hosting provider
2. Chrome Extension: Load dist/extension/ as unpacked extension in Chrome
3. Mobile App: Use Expo CLI to build APK: expo build:android
EOF

print_success "Build completed successfully!"
print_status "Build artifacts are in the dist/ directory"
print_status "See dist/build-info.txt for details"

# Display next steps
echo ""
echo "📋 Next Steps:"
echo "1. Web App: Deploy dist/web/ to your hosting provider"
echo "2. Chrome Extension: Load dist/extension/ as unpacked extension in Chrome"
echo "3. Mobile App: Use 'expo build:android' to create APK"
echo ""
echo "📖 For detailed instructions, see README.md"
