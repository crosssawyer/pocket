# App Icon Assets

## macOS Icon (icon.icns)

To create a proper macOS icon, you need an `.icns` file containing multiple resolutions.

### Quick Method: Using Online Tool

1. Create a 1024x1024 PNG image of your icon
2. Convert to .icns using an online tool like:
   - https://cloudconvert.com/png-to-icns
   - https://iconverticons.com/online/
3. Save as `assets/icon.icns`

### Professional Method: Using iconutil

1. Create a PNG icon at 1024x1024 pixels
2. Create an iconset directory:
   ```bash
   mkdir icon.iconset
   ```

3. Generate all required sizes:
   ```bash
   sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
   sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
   sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
   sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
   sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
   sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
   sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
   sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
   sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
   sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
   ```

4. Convert to .icns:
   ```bash
   iconutil -c icns icon.iconset -o assets/icon.icns
   ```

## Windows Icon (icon.ico)

For Windows, you need a `.ico` file.

### Using ImageMagick:
```bash
brew install imagemagick
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico
```

### Using Online Tool:
1. Upload your PNG to: https://convertio.co/png-ico/
2. Download and save as `assets/icon.ico`

## Icon Design Guidelines

### Style Recommendations for Pocket:
- **Minimalist design** matching the retro aesthetic
- **Simple geometric shapes** (like a pocket, vault, or lock)
- **Warm color palette** (beiges, teals matching the app theme)
- **Clean silhouette** that works at small sizes

### Suggested Concepts:
1. A simple pocket silhouette with a lock
2. A vintage key icon
3. A minimalist vault/safe icon
4. A retro TV-style border with a lock inside

### Technical Requirements:
- **Resolution**: 1024x1024 pixels minimum
- **Format**: PNG with transparency
- **Style**: Simple, recognizable at 16x16 pixels
- **Colors**: Consider both light and dark mode compatibility

## Temporary Solution

If you don't have an icon yet, the app will work fine without one. The scripts will skip icon copying if the file doesn't exist.

To create a simple placeholder:
```bash
# This creates a simple colored square as a temporary icon
# (macOS only)
# brew install imagemagick
convert -size 1024x1024 xc:#4B8C82 assets/icon.png
```

Then convert to .icns using one of the methods above.
