# Windows Build Guide

This guide explains how to build Pocket for Windows and create a distributable installer.

## Prerequisites

### 1. Install Rust
Download and install Rust from [rustup.rs](https://rustup.rs/)
```powershell
# The installer will add Rust to your PATH
# Verify installation:
rustc --version
cargo --version
```

### 2. Install Visual Studio Build Tools
Rust on Windows requires the Microsoft C++ build tools.

Download **Visual Studio Build Tools** from:
https://visualstudio.microsoft.com/downloads/

During installation, select:
- "Desktop development with C++"
- Windows 10/11 SDK

## Building the Executable

### Quick Build (Debug)
```powershell
cargo build
```
Output: `target/debug/pocket.exe`

### Optimized Build (Release)
```powershell
cargo build --release
```
Output: `target/release/pocket.exe`

The release build is:
- **Smaller** (optimized binary size)
- **Faster** (full optimizations enabled)
- **Stripped** (debug symbols removed)
- **Ready for distribution**

### Test the Executable
```powershell
.\target\release\pocket.exe
```

## Creating a Windows Installer

Pocket includes an Inno Setup script to create a professional Windows installer.

### Option 1: Inno Setup (Recommended)

#### Install Inno Setup
Download from: https://jrsoftware.org/isdl.php

#### Build the Installer
1. **Build the release executable first:**
   ```powershell
   cargo build --release
   ```

2. **Open `installer.iss` in Inno Setup**

3. **Click Build → Compile**

4. **Find your installer:**
   - Location: `installer-output/pocket-setup-0.1.0.exe`
   - Size: ~5-10 MB (includes all dependencies)

#### What the Installer Does
- Installs Pocket to `Program Files`
- Creates Start Menu shortcuts
- Optional desktop icon
- Includes uninstaller
- Professional wizard interface

### Option 2: Portable Executable (No Installer)

For a portable version, just distribute `pocket.exe`:

```powershell
# Build release
cargo build --release

# Copy the exe
copy target\release\pocket.exe pocket-portable.exe
```

Users can run this anywhere without installation. All data is stored in:
```
%LOCALAPPDATA%\pocket\
```

### Option 3: cargo-wix (Advanced)

For MSI installers that integrate with Windows Installer:

```powershell
# Install cargo-wix
cargo install cargo-wix

# Create WiX configuration
cargo wix init

# Build MSI installer
cargo wix
```

## Distribution Checklist

Before distributing your build:

- [ ] Build in release mode: `cargo build --release`
- [ ] Test the executable on a clean Windows machine
- [ ] Verify antivirus doesn't flag it (sometimes happens with new Rust binaries)
- [ ] Include README and LICENSE in installer
- [ ] Sign the executable (optional, for trusted distribution)
- [ ] Create installer with Inno Setup
- [ ] Test the installer on a clean Windows machine

## Code Signing (Optional)

For production distribution, sign your executable:

### Get a Code Signing Certificate
- DigiCert, Sectigo, or other trusted CA
- Costs ~$100-500/year
- Prevents Windows SmartScreen warnings

### Sign with SignTool
```powershell
# Install Windows SDK for SignTool
# Then sign:
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com target\release\pocket.exe
```

## Cross-Compilation from Linux/Mac

You can build Windows executables from Linux or macOS:

### Install Windows Target
```bash
rustup target add x86_64-pc-windows-gnu
```

### Install MinGW
```bash
# Ubuntu/Debian
sudo apt install mingw-w64

# macOS
brew install mingw-w64
```

### Build for Windows
```bash
cargo build --release --target x86_64-pc-windows-gnu
```

Output: `target/x86_64-pc-windows-gnu/release/pocket.exe`

## File Sizes

Typical build sizes:
- **Debug build**: ~50-80 MB (includes debug symbols)
- **Release build**: ~5-8 MB (optimized, stripped)
- **Installer**: ~6-10 MB (includes exe + documentation)

## Troubleshooting

### "VCRUNTIME140.dll not found"
Install Visual C++ Redistributable:
https://aka.ms/vs/17/release/vc_redist.x64.exe

### Large Binary Size
Already optimized with:
- LTO (Link Time Optimization)
- Strip (removes debug symbols)
- opt-level = 3
- codegen-units = 1

Further reduction possible with:
```powershell
cargo install cargo-bloat
cargo bloat --release
```

### Antivirus False Positives
New Rust binaries sometimes trigger false positives. Solutions:
1. Submit to antivirus vendors for whitelisting
2. Code sign the executable
3. Build reputation over time

### Windows Defender SmartScreen
"Windows protected your PC" warning on unsigned apps.
Solutions:
1. Code signing certificate (best)
2. Users can click "More info" → "Run anyway"
3. Build reputation (requires many downloads)

## Automated Builds (CI/CD)

### GitHub Actions Example
Create `.github/workflows/windows-build.yml`:

```yaml
name: Windows Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: Build
        run: cargo build --release
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: pocket-windows
          path: target/release/pocket.exe
```

This automatically builds Windows executables on every release tag.

## Support

For build issues, check:
- Rust installation: `rustc --version`
- Cargo installation: `cargo --version`
- Visual Studio Build Tools installed
- PATH includes cargo bin directory

## Summary

**Simplest distribution:**
```powershell
cargo build --release
# Share target/release/pocket.exe
```

**Professional distribution:**
```powershell
cargo build --release
# Build with Inno Setup
# Share installer-output/pocket-setup-0.1.0.exe
```
