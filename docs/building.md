# Building for Release

## Local Build

Build for your current platform:

```bash
npm run tauri:build
```

Output locations:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/` and `nsis/`
- **Linux**: `src-tauri/target/release/bundle/deb/` and `appimage/`

## Universal macOS Build

Build for both Intel and Apple Silicon:

```bash
npm run tauri build -- --target universal-apple-darwin
```

Requires both targets installed:
```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

## GitHub Releases

The project includes GitHub Actions workflows for automated releases:

1. Update the app version (these should match):
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`

2. Create and push a version tag (the `release.yml` workflow triggers on tags matching `v*`):
```bash
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

3. Confirm the workflow ran: GitHub → Actions → `Release` (or run it manually via the `Run workflow` button).

4. The workflow automatically builds for:
   - macOS (Universal binary)
   - Windows (MSI and NSIS installers)
   - Linux (AppImage and DEB)

5. Find the draft release in GitHub Releases and publish it.

## Code Signing

### macOS
Set these environment variables in GitHub secrets:
- `APPLE_CERTIFICATE`: Base64 encoded .p12 certificate
- `APPLE_CERTIFICATE_PASSWORD`: Certificate password
- `APPLE_SIGNING_IDENTITY`: Certificate name
- `APPLE_ID`: Apple ID email
- `APPLE_PASSWORD`: App-specific password

### Windows
Set in GitHub secrets:
- `TAURI_PRIVATE_KEY`: Code signing certificate
- `TAURI_KEY_PASSWORD`: Certificate password
