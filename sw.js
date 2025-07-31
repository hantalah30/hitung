const CACHE_NAME = "penghitung-cache-v1";
// Daftar file yang akan di-cache untuk penggunaan offline
const urlsToCache = [
  "/",
  "/index.html",
  "/hitung.html",
  "/script-index.js",
  "/script-hitung.js",
  "/firebase-config.js",
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
      // Jika file ada di cache, kembalikan dari cache
      if (response) {
        return response;
      }
      // Jika tidak, ambil dari network
      return fetch(event.request);
    })
  );
});
