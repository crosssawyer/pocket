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

The project includes GitHub Actions workflows for automated draft releases.

1. Ensure GitHub Actions has permission to create releases:
   - Repo Settings → Actions → General → Workflow permissions → select **Read and write permissions**

2. Update the app version (these should match):
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`

3. Create and push a version tag (the workflow triggers on tags matching `v*`):
```bash
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

4. Find the draft release in GitHub Releases and publish it.

### Re-running a Release Build
- Preferred: bump the version and push a new tag (e.g. `v0.1.1`).
- Or: GitHub → Actions → `Release` → **Run workflow** and enter the existing tag (example: `v0.1.0`).

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
