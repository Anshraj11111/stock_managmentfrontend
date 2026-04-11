import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

async function convertJPEGtoPNG() {
  console.log('🔄 Converting JPEG icons to PNG format...\n');

  try {
    // Convert pwa-192X192.jpg to pwa-192x192.png
    const icon192Input = path.join(publicDir, 'pwa-192X192.jpg');
    const icon192Output = path.join(publicDir, 'pwa-192x192.png');
    
    if (fs.existsSync(icon192Input)) {
      await sharp(icon192Input)
        .png()
        .toFile(icon192Output);
      console.log('✅ Converted: pwa-192X192.jpg → pwa-192x192.png');
    } else {
      console.log('⚠️  File not found: pwa-192X192.jpg');
    }

    // Convert pwa-512X512.jpg to pwa-512x512.png
    const icon512Input = path.join(publicDir, 'pwa-512X512.jpg');
    const icon512Output = path.join(publicDir, 'pwa-512x512.png');
    
    if (fs.existsSync(icon512Input)) {
      await sharp(icon512Input)
        .png()
        .toFile(icon512Output);
      console.log('✅ Converted: pwa-512X512.jpg → pwa-512x512.png');
    } else {
      console.log('⚠️  File not found: pwa-512X512.jpg');
    }

    // Check if apple-touch-icon.png exists, if not create from 192x192
    const appleTouchIcon = path.join(publicDir, 'apple-touch-icon.png');
    if (!fs.existsSync(appleTouchIcon) && fs.existsSync(icon192Output)) {
      await sharp(icon192Output)
        .resize(180, 180)
        .png()
        .toFile(appleTouchIcon);
      console.log('✅ Created: apple-touch-icon.png (180x180)');
    }

    console.log('\n✅ Icon conversion complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update vite.config.js to reference PNG icons');
    console.log('   2. Update index.html to reference PNG icons');
    console.log('   3. Remove old JPEG files (optional)');
    
  } catch (error) {
    console.error('❌ Error converting icons:', error);
    process.exit(1);
  }
}

convertJPEGtoPNG();
