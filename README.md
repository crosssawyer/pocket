# Pocket

A minimalist, secure password manager with a retro-inspired aesthetic.

Built with Rust and egui, Pocket provides military-grade encryption in a beautifully minimal interface inspired by vintage electronics.

## Features

- **Military-Grade Security**: AES-256-GCM encryption with Argon2 key derivation
- **Retro-Minimal Design**: Clean interface with warm tones inspired by vintage CRT displays
- **Completely Local**: All data stored encrypted on your machine, never transmitted
- **Zero Knowledge**: Master password never stored, only used for key derivation
- **Cross-Platform**: Built with Rust and egui for native performance on Linux, macOS, and Windows

## Security

- Master password never stored, only used for key derivation
- AES-256-GCM encryption for all stored data
- Argon2 for secure key derivation
- Secure memory wiping with zeroize
- All data stored locally, never transmitted

## Installation

### Download Pre-built Binary
Check the [Releases](https://github.com/crosssawyer/pocket/releases) page for:
- **Windows**: `pocket-setup-x.x.x.exe` (installer) or `pocket-x.x.x-windows-x64.exe` (portable)
- **macOS**: `pocket-x.x.x-macos-universal.tar.gz` (Intel + Apple Silicon)
- **Linux**: `pocket-x.x.x-linux-x64.tar.gz`

### Build from Source

**Prerequisites:**
- [Rust](https://rustup.rs/) (latest stable)
- On Linux: `libgtk-3-dev libxcb-render0-dev libxcb-shape0-dev libxcb-xfixes0-dev libxkbcommon-dev`
- On Windows: Visual Studio Build Tools with C++ support

**Build:**
```bash
cargo build --release
```

**Run:**
```bash
cargo run --release
```

### Platform-Specific Builds

#### Windows Executable and Installer

For detailed Windows build instructions including creating an installer, see [WINDOWS_BUILD.md](WINDOWS_BUILD.md).

**Quick Windows build:**
```powershell
cargo build --release
# Executable: target\release\pocket.exe
```

**Create installer:**
1. Build release: `cargo build --release`
2. Open `installer.iss` in [Inno Setup](https://jrsoftware.org/isdl.php)
3. Click "Compile"
4. Installer: `installer-output/pocket-setup-0.1.0.exe`

#### macOS App Bundle and DMG

For detailed macOS build instructions including creating app bundles and DMG installers, see [MACOS_BUILD.md](MACOS_BUILD.md).

**Quick macOS universal binary:**
```bash
./scripts/build-universal.sh
# Binary: target/release/pocket (Intel + Apple Silicon)
```

**Create app bundle:**
```bash
cargo install cargo-bundle
cargo bundle --release
# App: target/release/bundle/osx/Pocket.app
```

**Create DMG installer:**
```bash
./scripts/create-macos-bundle.sh  # Creates app bundle
./scripts/create-dmg.sh           # Creates DMG installer
# DMG: dist/Pocket-0.1.0.dmg
```

## Design Philosophy

Pocket combines security with simplicity. The interface draws inspiration from vintage electronics, featuring warm tones and clean typography that evoke the aesthetic of classic design while maintaining modern usability.