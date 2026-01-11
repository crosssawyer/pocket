# Architecture

Pocket is built with a clean, modular architecture that separates concerns and prioritizes code readability and security.

## Project Structure

```
pocket/
├── src/
│   ├── crypto.rs      # Encryption and key derivation
│   ├── models.rs      # Data models and structures
│   ├── storage.rs     # Persistent storage layer
│   ├── ui/
│   │   ├── app.rs     # Main application UI
│   │   ├── theme.rs   # Retro-minimal visual theme
│   │   └── mod.rs     # UI module exports
│   └── main.rs        # Application entry point
├── Cargo.toml         # Dependencies and project metadata
└── README.md
```

## Core Modules

### crypto.rs
Handles all cryptographic operations:
- **Key Derivation**: Uses Argon2 to derive encryption keys from master password
- **Encryption**: AES-256-GCM for authenticated encryption
- **Secure Random**: OS-level randomness for nonces and salts
- **Memory Safety**: Automatic zeroing of sensitive data

### models.rs
Defines the data structures:
- **PasswordEntry**: Individual password record with metadata
- **Vault**: Collection of password entries
- **Security**: Auto-zeroing of passwords in memory on drop

### storage.rs
Manages persistent storage:
- **Encrypted Storage**: All data written to disk is encrypted
- **Salt Management**: Persistent salt for key derivation
- **Error Handling**: Comprehensive error messages
- **Cross-Platform**: Uses platform-appropriate data directories

### ui/
Implements the user interface:
- **app.rs**: Main application logic and view routing
- **theme.rs**: Retro-minimal color palette and styling
- **Immediate Mode**: Built with egui for responsive, declarative UI

## Security Design

### Defense in Depth
1. **Password Never Stored**: Master password only exists in memory during session
2. **Strong Key Derivation**: Argon2 makes brute force attacks computationally expensive
3. **Authenticated Encryption**: AES-GCM prevents tampering and provides authenticity
4. **Memory Wiping**: Sensitive data zeroed from memory when no longer needed
5. **Local Only**: No network communication, all data stays on your machine

### Encryption Flow
```
Master Password → Argon2 → 256-bit Key → AES-256-GCM → Encrypted Vault
```

## Design Philosophy

### Clean Code Principles
- **Single Responsibility**: Each module has one clear purpose
- **Readable**: Code written to be understood by humans first
- **Type Safety**: Leverages Rust's type system for correctness
- **Error Handling**: Explicit error types and comprehensive error messages

### Minimal Interface
- **Retro Aesthetic**: Warm tones inspired by vintage electronics
- **Zero Clutter**: Only essential elements visible
- **Clear Hierarchy**: Visual weight guides user attention
- **Responsive**: Immediate feedback for all interactions

## Future Enhancements

Potential areas for expansion while maintaining clean architecture:
- Password generation with customizable strength
- Import/export functionality
- Password strength analysis
- Duplicate password detection
- Backup and sync (with end-to-end encryption)
- Browser extension integration
- Biometric authentication
