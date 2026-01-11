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
- **Linux**: `pocket-x.x.x-linux-x64.tar.gz`
- **macOS**: `pocket-x.x.x-macos-x64.tar.gz`

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

### Windows Executable and Installer

For detailed Windows build instructions including creating an installer, see [WINDOWS_BUILD.md](WINDOWS_BUILD.md).

**Quick Windows build:**
```powershell
cargo build --release
# Executable: target\release\pocket.exe
```

## Design Philosophy

Pocket combines security with simplicity. The interface draws inspiration from vintage electronics, featuring warm tones and clean typography that evoke the aesthetic of classic design while maintaining modern usability.