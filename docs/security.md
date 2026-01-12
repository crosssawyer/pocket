# Security

## Encryption

Pocket uses industry-standard encryption to protect your passwords:

### Key Derivation
- **Algorithm**: Argon2id
- **Salt**: 16 bytes, randomly generated per vault
- **Output**: 256-bit key

### Data Encryption
- **Algorithm**: AES-256-GCM
- **Nonce**: 12 bytes, randomly generated per encryption
- **Authentication**: Built into GCM mode

## Data Storage

- All passwords are encrypted before being written to disk
- The vault file is stored in your user data directory:
  - **macOS**: `~/Library/Application Support/com.pocket.app/`
  - **Windows**: `%APPDATA%\com.pocket.app\`
  - **Linux**: `~/.local/share/pocket/`

## Master Password

Your master password:
- Is never stored anywhere
- Is used only to derive the encryption key
- Must be at least 8 characters (longer is better)
- Cannot be recovered if forgotten

## Best Practices

1. Use a strong, unique master password
2. Don't share your master password
3. Back up your vault file regularly
4. Keep the app updated
