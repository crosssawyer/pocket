#!/bin/bash
# Script to create a macOS .app bundle manually

set -e

APP_NAME="Pocket"
VERSION="0.1.0"
BUNDLE_ID="com.pocket.password-manager"
BINARY_NAME="pocket"
DIST_DIR="dist"
APP_DIR="${DIST_DIR}/${APP_NAME}.app"

echo "🔨 Building release binary..."
cargo build --release

echo "📦 Creating app bundle structure..."
rm -rf "${APP_DIR}"
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources"

echo "📋 Copying binary..."
cp "target/release/${BINARY_NAME}" "${APP_DIR}/Contents/MacOS/${APP_NAME}"
chmod +x "${APP_DIR}/Contents/MacOS/${APP_NAME}"

echo "📝 Creating Info.plist..."
cat > "${APP_DIR}/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>en</string>
    <key>CFBundleExecutable</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>${VERSION}</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2026 Pocket Team</string>
    <key>CFBundleDisplayName</key>
    <string>Pocket</string>
    <key>CFBundleGetInfoString</key>
    <string>A minimalist, secure password manager</string>
    <key>LSApplicationCategoryType</key>
    <string>public.app-category.utilities</string>
</dict>
</plist>
EOF

# Copy icon if it exists
if [ -f "assets/icon.icns" ]; then
    echo "🎨 Copying icon..."
    cp "assets/icon.icns" "${APP_DIR}/Contents/Resources/icon.icns"
fi

# Copy documentation
echo "📄 Copying documentation..."
cp README.md "${APP_DIR}/Contents/Resources/"
cp LICENSE "${APP_DIR}/Contents/Resources/"

echo "✅ App bundle created: ${APP_DIR}"
echo "🚀 Test with: open ${APP_DIR}"
