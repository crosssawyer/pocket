#!/bin/bash
# Script to create a DMG installer for macOS

set -e

APP_NAME="Pocket"
VERSION="0.1.0"
DIST_DIR="dist"
APP_BUNDLE="${DIST_DIR}/${APP_NAME}.app"
DMG_NAME="${APP_NAME}-${VERSION}.dmg"
DMG_PATH="${DIST_DIR}/${DMG_NAME}"

# Check if app bundle exists
if [ ! -d "${APP_BUNDLE}" ]; then
    echo "❌ App bundle not found: ${APP_BUNDLE}"
    echo "📦 Creating app bundle first..."
    ./scripts/create-macos-bundle.sh
fi

echo "💿 Creating DMG installer..."

# Remove old DMG if it exists
rm -f "${DMG_PATH}"

# Check if create-dmg is installed
if command -v create-dmg &> /dev/null; then
    echo "Using create-dmg tool..."

    create-dmg \
        --volname "${APP_NAME}" \
        --volicon "assets/icon.icns" \
        --window-pos 200 120 \
        --window-size 600 400 \
        --icon-size 100 \
        --icon "${APP_NAME}.app" 175 120 \
        --hide-extension "${APP_NAME}.app" \
        --app-drop-link 425 120 \
        --no-internet-enable \
        "${DMG_PATH}" \
        "${APP_BUNDLE}" \
        2>/dev/null || true

    echo "✅ DMG created with create-dmg: ${DMG_PATH}"
else
    echo "⚠️  create-dmg not found, using hdiutil..."
    echo "💡 Install create-dmg with: brew install create-dmg"
    echo ""

    # Create temporary directory for DMG contents
    TMP_DIR="${DIST_DIR}/dmg-temp"
    rm -rf "${TMP_DIR}"
    mkdir -p "${TMP_DIR}"

    # Copy app bundle
    cp -R "${APP_BUNDLE}" "${TMP_DIR}/"

    # Create symbolic link to Applications
    ln -s /Applications "${TMP_DIR}/Applications"

    # Create DMG
    hdiutil create -volname "${APP_NAME}" \
        -srcfolder "${TMP_DIR}" \
        -ov -format UDZO \
        "${DMG_PATH}"

    # Cleanup
    rm -rf "${TMP_DIR}"

    echo "✅ DMG created with hdiutil: ${DMG_PATH}"
fi

# Get DMG size
DMG_SIZE=$(du -h "${DMG_PATH}" | cut -f1)
echo "📊 DMG size: ${DMG_SIZE}"

echo ""
echo "🎉 DMG installer ready for distribution!"
echo "📍 Location: ${DMG_PATH}"
echo ""
echo "🧪 Test installation:"
echo "   1. Double-click ${DMG_NAME}"
echo "   2. Drag ${APP_NAME} to Applications"
echo "   3. Open from Applications folder"
