# macOS Build Guide

This guide explains how to build Pocket for macOS and create a distributable .app bundle and DMG installer.

## Prerequisites

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### 2. Install Xcode Command Line Tools
```bash
xcode-select --install
```

## Building the Executable

### Quick Build (Debug)
```bash
cargo build
```
Output: `target/debug/pocket`

### Optimized Build (Release)
```bash
cargo build --release
```
Output: `target/release/pocket`

The release build is:
- **Smaller** (~5-8 MB)
- **Faster** (full optimizations)
- **Stripped** (no debug symbols)
- **Universal binary ready**

### Test the Executable
```bash
./target/release/pocket
```

## Creating a macOS App Bundle

macOS apps are distributed as `.app` bundles with proper structure and metadata.

### Option 1: cargo-bundle (Recommended)

#### Install cargo-bundle
```bash
cargo install cargo-bundle
```

#### Configure Bundle in Cargo.toml
The bundle configuration is already set up in `Cargo.toml`.

#### Build App Bundle
```bash
cargo bundle --release
```

Output: `target/release/bundle/osx/Pocket.app`

#### Test the App
```bash
open target/release/bundle/osx/Pocket.app
```

### Option 2: Manual Bundle Creation

If you prefer manual control:

```bash
# Build release binary first
cargo build --release

# Run the bundling script
./scripts/create-macos-bundle.sh
```

Output: `dist/Pocket.app`

## Creating a DMG Installer

DMG files are the standard way to distribute macOS apps.

### Using create-dmg

#### Install create-dmg
```bash
brew install create-dmg
```

#### Create DMG
```bash
# First create the app bundle
cargo bundle --release

# Then create DMG
./scripts/create-dmg.sh
```

Output: `dist/Pocket-0.1.0.dmg`

### What Users See
1. Download `Pocket-0.1.0.dmg`
2. Double-click to mount
3. Drag Pocket to Applications folder
4. Launch from Applications

## Universal Binary (Intel + Apple Silicon)

Build for both Intel and Apple Silicon Macs:

### Install Targets
```bash
rustup target add x86_64-apple-darwin
rustup target add aarch64-apple-darwin
```

### Build for Both Architectures
```bash
cargo build --release --target x86_64-apple-darwin
cargo build --release --target aarch64-apple-darwin
```

### Create Universal Binary
```bash
lipo -create \
  target/x86_64-apple-darwin/release/pocket \
  target/aarch64-apple-darwin/release/pocket \
  -output target/release/pocket-universal

# Verify it's universal
file target/release/pocket-universal
# Should show: Mach-O universal binary with 2 architectures
```

### Bundle Universal Binary
```bash
# Copy universal binary to release folder
cp target/release/pocket-universal target/release/pocket

# Create app bundle
cargo bundle --release
```

## App Notarization (For Distribution)

To avoid "unidentified developer" warnings:

### 1. Get Developer Certificate
- Enroll in Apple Developer Program ($99/year)
- Download certificates in Xcode

### 2. Sign the App
```bash
# Sign the app bundle
codesign --force --deep --sign "Developer ID Application: Your Name" \
  target/release/bundle/osx/Pocket.app

# Verify signature
codesign -v target/release/bundle/osx/Pocket.app
```

### 3. Create Signed DMG
```bash
./scripts/create-dmg.sh

# Sign the DMG
codesign --force --sign "Developer ID Application: Your Name" \
  dist/Pocket-0.1.0.dmg
```

### 4. Notarize with Apple
```bash
# Store credentials
xcrun notarytool store-credentials "notary-profile" \
  --apple-id "your@email.com" \
  --team-id "YOUR_TEAM_ID" \
  --password "app-specific-password"

# Submit for notarization
xcrun notarytool submit dist/Pocket-0.1.0.dmg \
  --keychain-profile "notary-profile" \
  --wait

# Staple the notarization
xcrun stapler staple dist/Pocket-0.1.0.dmg
```

### 5. Verify Notarization
```bash
spctl -a -v dist/Pocket-0.1.0.dmg
```

## File Locations

Pocket stores its encrypted vault in:
```
~/Library/Application Support/pocket/
```

This is the standard macOS location for app data.

## Distribution Checklist

- [ ] Build universal binary (Intel + Apple Silicon)
- [ ] Create app bundle with proper metadata
- [ ] Test on Intel Mac
- [ ] Test on Apple Silicon Mac
- [ ] Create DMG installer
- [ ] Sign app and DMG (if distributing widely)
- [ ] Notarize with Apple (if distributing widely)
- [ ] Test DMG installation on clean Mac

## Common Issues

### "App is damaged and can't be opened"
This happens with unsigned apps from the internet.

**For users:**
```bash
# Remove quarantine attribute
xattr -cr /Applications/Pocket.app
```

**For developers:**
Sign and notarize your app.

### "Command Line Tools not found"
```bash
xcode-select --install
sudo xcode-select --reset
```

### Binary won't run on other Macs
Build a universal binary or distribute both architectures.

### Missing Icon
The icon is set in `Info.plist` and should be in the bundle's `Resources` folder.

## Automated Building

The GitHub Actions workflow automatically builds for macOS on every release tag.

To trigger:
```bash
git tag v0.1.0
git push origin v0.1.0
```

This creates:
- `pocket-0.1.0-macos-x64.tar.gz` (Intel)
- Can be extended for universal binary

## Quick Commands Reference

```bash
# Build release
cargo build --release

# Create app bundle
cargo bundle --release

# Create DMG
./scripts/create-dmg.sh

# Universal binary
rustup target add x86_64-apple-darwin aarch64-apple-darwin
cargo build --release --target x86_64-apple-darwin
cargo build --release --target aarch64-apple-darwin
lipo -create \
  target/x86_64-apple-darwin/release/pocket \
  target/aarch64-apple-darwin/release/pocket \
  -output target/release/pocket-universal

# Sign app
codesign --force --deep --sign "Developer ID" Pocket.app

# Notarize
xcrun notarytool submit Pocket.dmg --keychain-profile "profile" --wait
xcrun stapler staple Pocket.dmg
```

## Support

For build issues:
- Rust installation: `rustc --version`
- Xcode tools: `xcode-select -p`
- Check architecture: `uname -m` (x86_64 or arm64)

## Summary

**Simplest distribution:**
```bash
cargo build --release
# Share target/release/pocket
```

**macOS app bundle:**
```bash
cargo bundle --release
# Share target/release/bundle/osx/Pocket.app
```

**Professional distribution:**
```bash
cargo bundle --release
./scripts/create-dmg.sh
# Share dist/Pocket-0.1.0.dmg
```
