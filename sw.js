const CACHE_NAME = "pechenka-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  // Картинки Печеньки
  "https://i.postimg.cc/TYkSL8ny/neutral.jpg",
  "https://i.postimg.cc/520hn9fm/anger.jpg",
  "https://i.postimg.cc/ZKfgBk6x/sadness.jpg",
  "https://i.postimg.cc/HsWRkWc6/boredom.jpg",
  "https://i.postimg.cc/c412L1tL/happy.jpg"
];

// Установка: кэшируем всё нужное
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// Активация: чистим старые кэши
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Стратегия "кэш в приоритете" — работает оффлайн
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return (
        cached ||
        fetch(e.request)
          .then((response) => {
            // Кладём в кэш то, что удалось скачать (в т.ч. кросс-доменные картинки)
            if (e.request.method === "GET") {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
            }
            return response;
          })
          .catch(() => cached)
      );
    })
  );
});
