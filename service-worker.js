const CACHE_NAME = 'kids-game-v3';
const ASSETS = [
  './',
  './index.html',
  './numbers.html',
  './colors.html',
  './shapes.html',
  './shared/style.css',
  './shared/voice.js',
  './shared/game-engine.js',
  './icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});