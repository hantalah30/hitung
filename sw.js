// Ganti nama cache untuk memicu update
const CACHE_NAME = "penghitung-cache-v2";

// Sesuaikan path dengan URL GitHub Pages Anda
const urlsToCache = [
  "/hitung/",
  "/hitung/index.html",
  "/hitung/hitung.html",
  "/hitung/script-index.js",
  "/hitung/script-hitung.js",
  "/hitung/firebase-config.js",
  "/hitung/manifest.json",
  "/hitung/icon-192x192.png",
  "/hitung/icon-512x512.png",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js",
];

// Event 'install': menyimpan file baru ke cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache and caching new files");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Memaksa service worker baru untuk aktif
});

// Event 'activate': menghapus cache lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Event 'fetch': menyajikan file dari cache jika tersedia, jika tidak ambil dari network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
