self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache-v1').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './favicon.ico',
        './icon-192x192.png',
        './icon-512x512.png',
        './audio/alertalarm.wav'  // Pastikan path ini sesuai dengan struktur folder Anda
      ]);
    }).catch((error) => {
      console.error('Error while caching: ', error);
    })
  );
  // Mengaktifkan service worker segera setelah instalasi
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = ['my-cache-v1'];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Setelah semua cache lama dihapus, klaim semua klien aktif
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada cache yang cocok, gunakan cache. Jika tidak, lakukan fetch
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // Setelah mendapat response dari jaringan, simpan di cache untuk permintaan berikutnya
        return caches.open('my-cache-v1').then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch((error) => {
      console.error('Error fetching resource: ', error);
      throw error;  // Jika terjadi kesalahan, lemparkan error untuk penanganan lebih lanjut
    })
  );
});
