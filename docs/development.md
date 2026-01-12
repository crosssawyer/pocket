# Development Guide

## Prerequisites

### All Platforms
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) (stable)

### macOS
No additional dependencies required.

### Windows
No additional dependencies required.

### Linux
```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run tauri:dev
```

## Project Structure

```
pocket/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── hooks/              # React hooks
│   ├── styles/             # CSS styles
│   └── types.ts            # TypeScript types
├── src-tauri/              # Rust backend
│   └── src/
│       ├── lib.rs          # Tauri commands
│       ├── crypto.rs       # Encryption utilities
│       └── vault.rs        # Password vault logic
├── docs/                   # Documentation
└── .github/workflows/      # CI/CD workflows
```

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri 2
- **Encryption**: AES-256-GCM with Argon2id key derivation
- **Styling**: Custom CSS with liquid glass design

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend |
| `npm run tauri:dev` | Start Tauri in development |
| `npm run tauri:build` | Build production app |
