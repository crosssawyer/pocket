#!/bin/bash
# Script to build a universal binary for macOS (Intel + Apple Silicon)

set -e

BINARY_NAME="pocket"

echo "🎯 Building universal binary for macOS..."
echo ""

# Check if targets are installed
echo "📦 Checking Rust targets..."
if ! rustup target list | grep -q "x86_64-apple-darwin (installed)"; then
    echo "Installing x86_64-apple-darwin target..."
    rustup target add x86_64-apple-darwin
fi

if ! rustup target list | grep -q "aarch64-apple-darwin (installed)"; then
    echo "Installing aarch64-apple-darwin target..."
    rustup target add aarch64-apple-darwin
fi

echo ""
echo "🔨 Building for Intel (x86_64)..."
cargo build --release --target x86_64-apple-darwin

echo ""
echo "🔨 Building for Apple Silicon (aarch64)..."
cargo build --release --target aarch64-apple-darwin

echo ""
echo "🔗 Creating universal binary..."
mkdir -p target/release

lipo -create \
    target/x86_64-apple-darwin/release/${BINARY_NAME} \
    target/aarch64-apple-darwin/release/${BINARY_NAME} \
    -output target/release/${BINARY_NAME}-universal

# Replace the regular release binary with universal one
cp target/release/${BINARY_NAME}-universal target/release/${BINARY_NAME}

echo ""
echo "✅ Universal binary created!"
echo ""
echo "🔍 Verifying binary..."
file target/release/${BINARY_NAME}
lipo -info target/release/${BINARY_NAME}

# Get sizes
INTEL_SIZE=$(du -h target/x86_64-apple-darwin/release/${BINARY_NAME} | cut -f1)
ARM_SIZE=$(du -h target/aarch64-apple-darwin/release/${BINARY_NAME} | cut -f1)
UNIVERSAL_SIZE=$(du -h target/release/${BINARY_NAME} | cut -f1)

echo ""
echo "📊 Binary sizes:"
echo "   Intel (x86_64):    ${INTEL_SIZE}"
echo "   Apple Silicon:     ${ARM_SIZE}"
echo "   Universal:         ${UNIVERSAL_SIZE}"
echo ""
echo "🎉 Ready to bundle!"
echo "📦 Run: ./scripts/create-macos-bundle.sh"
