const STATIC_CACHE = "annovatech-static-v1";
const RUNTIME_CACHE = "annovatech-runtime-v1";
const APP_SHELL = [
  "/",
  "/index.html",
  "/contacto.html",
  "/servicios.html",
  "/portafolio.html",
  "/blog.html",
  "/assets/css/normalize.css",
  "/assets/css/style.css",
  "/assets/css/responsive.css",
  "/assets/css/pages.css",
  "/assets/js/menu.js",
  "/assets/js/home-loader.js",
  "/assets/js/form.js",
  "/assets/js/tracking.js",
  "/manifest.webmanifest",
  "/assets/images/branding/icon-192.png",
  "/assets/images/branding/icon-512.png",
  "/assets/images/branding/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          return cachedResponse || caches.match("/index.html");
        })
    );
    return;
  }

  const isStaticAsset = /\.(?:css|js|png|svg|webp|jpg|jpeg|gif|woff2?)$/i.test(url.pathname);
  if (!isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});