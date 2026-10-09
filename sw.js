const STATIC_CACHE = "annovatech-static-v3";
const RUNTIME_CACHE = "annovatech-runtime-v3";

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
  "/assets/js/portfolio-filter.js",
  "/assets/js/main.js",
  "/assets/js/faq.js",
  "/assets/js/counters.js",
  "/assets/js/slider.js",
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

// Only known root pages are equivalent to Netlify's clean URLs.
const NAVIGATION_ALIASES = {
  "/": "/index.html",
  "/index.html": "/",
  "/contacto": "/contacto.html",
  "/contacto.html": "/contacto",
  "/servicios": "/servicios.html",
  "/servicios.html": "/servicios",
  "/portafolio": "/portafolio.html",
  "/portafolio.html": "/portafolio",
  "/blog": "/blog.html",
  "/blog.html": "/blog"
};

async function matchStoredResponse(request, url, isNavigation) {
  const candidates = [request];
  const alias = isNavigation && NAVIGATION_ALIASES[url.pathname];

  if (alias) {
    const aliasUrl = new URL(url);
    aliasUrl.pathname = alias;
    candidates.push(aliasUrl.href);

    // Queryless fallback is limited to known precached navigation pages.
    if (url.search && (APP_SHELL.includes(url.pathname) || APP_SHELL.includes(alias))) {
      const pageUrl = new URL(url);
      pageUrl.search = "";
      aliasUrl.search = "";
      candidates.push(pageUrl.href, aliasUrl.href);
    }
  }

  for (const cacheName of [RUNTIME_CACHE, STATIC_CACHE]) {
    for (const candidate of candidates) {
      try {
        const response = await caches.match(candidate, { cacheName });
        if (response) return response;
      } catch (error) {
        // A failed cache lookup must not prevent trying the other cache.
      }
    }
  }

  return Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === "navigate";
  const isStaticAsset =
    /\.(?:css|js|png|svg|webp|jpg|jpeg|gif|woff2?)$/i.test(url.pathname) ||
    url.pathname === "/manifest.webmanifest";

  if (!isNavigation && !isStaticAsset) return;

  const networkResponse = fetch(request);
  const cacheUpdate = networkResponse.then(async (response) => {
    if (!response.ok) return;

    // Clone before opening storage; the original response remains deliverable.
    const responseClone = response.clone();
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, responseClone);
  }).catch(() => {
    // Network and storage rejections are handled without blocking the response.
  });

  // Register synchronously, while the fetch event handler is still running.
  event.waitUntil(cacheUpdate);
  event.respondWith(
    networkResponse.catch(() => matchStoredResponse(request, url, isNavigation))
  );
});
