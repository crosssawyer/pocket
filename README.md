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

## Building

```bash
cargo build --release
```

## Running

```bash
cargo run
```

## Design Philosophy

Pocket combines security with simplicity. The interface draws inspiration from vintage electronics, featuring warm tones and clean typography that evoke the aesthetic of classic design while maintaining modern usability.