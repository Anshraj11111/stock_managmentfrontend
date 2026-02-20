// Simple Node.js script to create placeholder PWA icons
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple SVG that can be used as PNG placeholder
const createSVGIcon = (size, filename) => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  
  <!-- A5x Logo -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- A shape background -->
    <path d="M-${size*0.15},-${size*0.15} L0,-${size*0.25} L${size*0.15},-${size*0.15} L${size*0.12},-${size*0.04} L-${size*0.12},-${size*0.04} Z" 
          fill="rgba(255,255,255,0.2)"/>
    
    <!-- A text -->
    <text x="0" y="-${size*0.08}" 
          font-family="Arial, sans-serif" 
          font-size="${size*0.18}" 
          font-weight="bold" 
          fill="#FFFFFF" 
          text-anchor="middle" 
          dominant-baseline="middle">A</text>
    
    <!-- 5x text -->
    <text x="0" y="${size*0.12}" 
          font-family="Arial, sans-serif" 
          font-size="${size*0.22}" 
          font-weight="bold" 
          fill="#FFFFFF" 
          text-anchor="middle" 
          dominant-baseline="middle">5x</text>
    
    <!-- Decorative circles -->
    <circle cx="-${size*0.23}" cy="-${size*0.19}" r="${size*0.023}" fill="rgba(255,255,255,0.4)"/>
    <circle cx="${size*0.23}" cy="-${size*0.19}" r="${size*0.023}" fill="rgba(255,255,255,0.4)"/>
    <circle cx="-${size*0.27}" cy="${size*0.15}" r="${size*0.023}" fill="rgba(255,255,255,0.4)"/>
    <circle cx="${size*0.27}" cy="${size*0.15}" r="${size*0.023}" fill="rgba(255,255,255,0.4)"/>
    
    <!-- Orbital ring -->
    <ellipse cx="0" cy="-${size*0.04}" rx="${size*0.29}" ry="${size*0.35}" 
             fill="none" 
             stroke="rgba(255,255,255,0.2)" 
             stroke-width="${size*0.012}" 
             stroke-dasharray="${size*0.03},${size*0.02}"/>
  </g>
</svg>`;

  const outputPath = path.join(__dirname, 'public', filename);
  fs.writeFileSync(outputPath, svg);
  console.log(`✅ Created: ${filename}`);
};

// Create icons
console.log('🎨 Creating PWA icons...\n');

try {
  // Ensure public directory exists
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Create all required icons
  createSVGIcon(192, 'pwa-192x192.svg');
  createSVGIcon(512, 'pwa-512x512.svg');
  createSVGIcon(180, 'apple-touch-icon.svg');

  console.log('\n✅ All icons created successfully!');
  console.log('\n📝 Note: These are SVG files. For best compatibility:');
  console.log('   1. Open generate-icons.html in browser');
  console.log('   2. Download PNG versions');
  console.log('   3. Replace SVG files with PNG files');
  console.log('\n🚀 For now, SVG icons will work in most browsers!');
  
} catch (error) {
  console.error('❌ Error creating icons:', error);
}
