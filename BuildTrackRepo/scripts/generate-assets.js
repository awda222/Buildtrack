/**
 * Generates minimal placeholder PNG assets for Expo
 * Run: node scripts/generate-assets.js
 */
const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 orange PNG (base64)
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const buffer = Buffer.from(PNG_BASE64, 'base64');
['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'].forEach((file) => {
  fs.writeFileSync(path.join(assetsDir, file), buffer);
  console.log(`Created assets/${file}`);
});

console.log('Done! Replace with branded assets for production.');
