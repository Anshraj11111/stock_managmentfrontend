# PWA Icons Setup Guide

## Required Icons

You need to create the following icon files and place them in this `public` directory:

### 1. pwa-192x192.png
- **Size**: 192x192 pixels
- **Format**: PNG
- **Purpose**: Standard display on Android home screens and app drawer
- **Design**: Your app logo/icon with transparent or solid background

### 2. pwa-512x512.png
- **Size**: 512x512 pixels
- **Format**: PNG
- **Purpose**: High-resolution displays and splash screens
- **Design**: Same as 192x192 but higher resolution

### 3. apple-touch-icon.png
- **Size**: 180x180 pixels (recommended)
- **Format**: PNG
- **Purpose**: iOS home screen icon
- **Design**: Your app logo (iOS will add rounded corners automatically)

### 4. favicon.ico
- **Size**: 32x32 or 16x16 pixels
- **Format**: ICO
- **Purpose**: Browser tab icon
- **Design**: Simplified version of your logo

### 5. masked-icon.svg (Optional)
- **Format**: SVG
- **Purpose**: Safari pinned tab icon
- **Design**: Monochrome SVG version of your logo

## How to Create Icons

### Option 1: Use an Online Tool
1. Visit https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your logo (at least 512x512 PNG)
3. Download the generated icon pack
4. Copy the required files to this directory

### Option 2: Use Design Software
1. Open your logo in Photoshop, Figma, or GIMP
2. Resize to each required dimension
3. Export as PNG with transparency (if desired)
4. Save files with the exact names listed above

### Option 3: Quick Placeholder (For Testing)
If you just want to test PWA functionality quickly:
1. Create a simple colored square in any image editor
2. Add text "SM" (for Stock Manager) in the center
3. Export at each required size
4. Use a solid background color matching your theme (#4F46E5 - indigo)

## Design Tips

- **Keep it simple**: Icons should be recognizable at small sizes
- **Use solid backgrounds**: Transparent backgrounds work, but solid colors often look better
- **High contrast**: Ensure your logo stands out against various backgrounds
- **Safe zone**: Keep important elements within 80% of the icon area (avoid edges)
- **Test on devices**: Check how icons look on actual Android and iOS devices

## Verification

After creating the icons, verify they work:
1. Run `npm run dev` in the frontend directory
2. Open Chrome DevTools → Application → Manifest
3. Check that all icons are listed and load correctly
4. Look for any warnings or errors

## Current Status

⚠️ **Icons Not Yet Created**

Please create the icons and place them in this directory before deploying the PWA.
