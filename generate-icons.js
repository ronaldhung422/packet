// Simple script to generate placeholder icons for development
// Run with: node generate-icons.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create screenshots directory
const screenshotsDir = path.join(iconsDir, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Icon configurations
const icons = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'pwa-maskable-192x192.png', size: 192, maskable: true },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.ico', size: 32 },
  { name: 'icon-add.png', size: 96 },
  { name: 'icon-places.png', size: 96 },
  { name: 'icon-map.png', size: 96 }
];

// Screenshot configurations
const screenshots = [
  { name: 'iphone-1.png', width: 1170, height: 2532 },
  { name: 'iphone-2.png', width: 1170, height: 2532 },
  { name: 'iphone-3.png', width: 1170, height: 2532 }
];

// Colors
const colors = {
  primary: '#8b5cf6',
  primaryLight: '#a78bfa',
  secondary: '#ec4899',
  secondaryLight: '#f472b6',
  background: '#ffffff',
  text: '#374151'
};

function createIcon(name, size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  if (maskable) {
    // Maskable icon has safe zone
    const safeZone = size * 0.8;
    const padding = (size - safeZone) / 2;
    
    // Draw background with rounded corners for maskable
    ctx.fillStyle = colors.primary;
    roundRect(ctx, padding, padding, safeZone, safeZone, safeZone * 0.2);
    ctx.fill();
    
    // Draw icon in center
    ctx.fillStyle = colors.background;
    ctx.font = `bold ${safeZone * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍜', size / 2, size / 2);
  } else {
    // Regular icon
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, 0, size, size);
    
    // Draw icon
    ctx.fillStyle = colors.background;
    ctx.font = `bold ${size * 0.4}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍜', size / 2, size / 2);
  }
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, name), buffer);
  console.log(`Created: ${name}`);
}

function createScreenshot(name, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, colors.primaryLight);
  gradient.addColorStop(1, colors.secondaryLight);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Mock app content
  const padding = width * 0.1;
  const contentWidth = width - (padding * 2);
  const contentHeight = height - (padding * 2);
  
  // Header area
  ctx.fillStyle = colors.background;
  roundRect(ctx, padding, padding, contentWidth, height * 0.15, 20);
  ctx.fill();
  
  // Title
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 40px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Packet', width / 2, padding + 60);
  
  // Subtitle
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#6b7280';
  ctx.fillText('Food Discovery App', width / 2, padding + 100);
  
  // Content cards
  const cardHeight = contentHeight * 0.2;
  const cardSpacing = 20;
  
  for (let i = 0; i < 3; i++) {
    const y = padding + height * 0.2 + (i * (cardHeight + cardSpacing));
    
    // Card background
    ctx.fillStyle = colors.background;
    roundRect(ctx, padding, y, contentWidth, cardHeight, 15);
    ctx.fill();
    
    // Card content
    ctx.fillStyle = colors.primary;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Restaurant ${i + 1}`, padding + 20, y + 40);
    
    ctx.fillStyle = colors.text;
    ctx.font = '18px sans-serif';
    ctx.fillText('Added by ' + (i % 2 === 0 ? 'Ronald' : 'Kerry'), padding + 20, y + 70);
  }
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(screenshotsDir, name), buffer);
  console.log(`Created screenshot: ${name}`);
}

function roundRect(ctx, x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

// Generate icons
console.log('Generating PWA icons...');
icons.forEach(icon => {
  createIcon(icon.name, icon.size, icon.maskable || false);
});

// Generate screenshots
console.log('\nGenerating screenshots...');
screenshots.forEach(screenshot => {
  createScreenshot(screenshot.name, screenshot.width, screenshot.height);
});

console.log('\n✅ All icons and screenshots generated!');
console.log('\nNote: These are placeholder icons for development.');
console.log('For production, create proper icons with a designer.');