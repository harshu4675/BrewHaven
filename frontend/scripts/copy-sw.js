const fs = require("fs");
const path = require("path");

const srcPath = path.join(__dirname, "..", "src", "service-worker.js");
const destPath = path.join(__dirname, "..", "build", "service-worker.js");

console.log("📋 Copying service worker...");
console.log("From:", srcPath);
console.log("To:", destPath);

if (fs.existsSync(srcPath)) {
  // Create build directory if it doesn't exist
  const buildDir = path.dirname(destPath);
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  // Copy file
  fs.copyFileSync(srcPath, destPath);
  console.log("✅ Service worker copied successfully!");
} else {
  console.warn("⚠️ Service worker source file not found at:", srcPath);
  console.log("Creating placeholder...");

  // Create a basic service worker
  const placeholder = `
self.addEventListener('install', () => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker activated');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
`;

  fs.writeFileSync(destPath, placeholder);
  console.log("✅ Placeholder service worker created");
}
