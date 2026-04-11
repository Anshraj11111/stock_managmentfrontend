import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'public');

async function optimizeIcons() {
  console.log('🔄 Optimizing PNG icons...\n');

  try {
    // Optimize pwa-192x192.png
    const icon192 = path.join(publicDir, 'pwa-192x192.png');
    if (fs.existsSync(icon192)) {
      await sharp(icon192)
        .resize(192, 192, { fit: 'cover' })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(icon192 + '.tmp');
      
      fs.renameSync(icon192 + '.tmp', icon192);
      const stats192 = fs.statSync(icon192);
      console.log(`✅ Optimized: pwa-192x192.png (${(stats192.size / 1024).toFixed(2)} KB)`);
    }

    // Optimize pwa-512x512.png
    const icon512 = path.join(publicDir, 'pwa-512x512.png');
    if (fs.existsSync(icon512)) {
      await sharp(icon512)
        .resize(512, 512, { fit: 'cover' })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(icon512 + '.tmp');
      
      fs.renameSync(icon512 + '.tmp', icon512);
      const stats512 = fs.statSync(icon512);
      console.log(`✅ Optimized: pwa-512x512.png (${(stats512.size / 1024).toFixed(2)} KB)`);
    }

    // Optimize apple-touch-icon.png
    const appleIcon = path.join(publicDir, 'apple-touch-icon.png');
    if (fs.existsSync(appleIcon)) {
      await sharp(appleIcon)
        .resize(180, 180, { fit: 'cover' })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(appleIcon + '.tmp');
      
      fs.renameSync(appleIcon + '.tmp', appleIcon);
      const statsApple = fs.statSync(appleIcon);
      console.log(`✅ Optimized: apple-touch-icon.png (${(statsApple.size / 1024).toFixed(2)} KB)`);
    }

    console.log('\n✅ Icon optimization complete!');
    
  } catch (error) {
    console.error('❌ Error optimizing icons:', error);
    process.exit(1);
  }
}

optimizeIcons();
