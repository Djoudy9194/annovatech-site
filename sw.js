const STATIC_CACHE = "annovatech-static-v2";
const RUNTIME_CACHE = "annovatech-runtime-v2";

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
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) =>
              key.startsWith("annovatech-") &&
              ![STATIC_CACHE, RUNTIME_CACHE].includes(key)
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === "navigate";

  const isStaticAsset =
    /\.(?:css|js|png|svg|webp|jpg|jpeg|gif|woff2?)$/i.test(
      url.pathname
    );

  if (!isNavigation && !isStaticAsset) return;


    event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        if (response.ok) {
          const responseClone = response.clone();

          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(request, responseClone);
        }

        return response;
      } catch (error) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) return cachedResponse;

        if (isNavigation) {
          const fallback = await caches.match("/index.html");
          if (fallback) return fallback;
        }

        return Response.error();
      }
    })()
  );
});
