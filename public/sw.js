const APP_SHELL_CACHE = "lab-tracking-shell-v1";
const ASSET_CACHE = "lab-tracking-assets-v1";
const PRECACHE_URLS = [
  "/",
  "/item-logs",
  "/add-items",
  "/register-borrower",
  "/scan",
  "/borrower-logs",
  "/settings",
  "/offline",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => ![APP_SHELL_CACHE, ASSET_CACHE].includes(cacheName))
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(APP_SHELL_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("/item-logs")) ||
            (await caches.match("/offline"))
          );
        }),
    );

    return;
  }

  if (["script", "style", "image", "font", "manifest"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        const response = await fetch(request);
        const responseClone = response.clone();

        caches.open(ASSET_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      }),
    );
  }
});
