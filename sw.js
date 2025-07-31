const CACHE_NAME = "penghitung-cache-v1";
// Tambahkan ./ di depan setiap file lokal
const urlsToCache = [
  "./",
  "./hitung",
  "./index.html",
  "./hitung.html",
  "./script-index.js",
  "./script-hitung.js",
  "./firebase-config.js",
  "./manifest.json", // Tambahkan manifest ke cache
  "./icon-192x192.png", // Tambahkan ikon ke cache
  "./icon-512x512.png", // Tambahkan ikon ke cache
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-database-compat.js",
];

// Event 'install': menyimpan file ke cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Event 'fetch': menyajikan file dari cache jika tersedia
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
