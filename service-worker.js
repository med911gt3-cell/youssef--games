const CACHE_NAME = 'kids-game-v1';
const ASSETS = [
  './',
  './index.html',
  './numbers.html',
  './colors.html',
  './shapes.html',
  './shared/style.css',
  './shared/voice.js',
  './shared/game-engine.js'
];

// تحميل الملفات وحفظها فالهاتف
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ملي تفتح التطبيق، يجيب الملفات من الهاتف بلا ما يحتاج نت
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
