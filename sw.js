// The Fit Geek service worker — makes the site installable and usable offline.
// Strategy: network-first for the app's own files (so new deploys show up
// immediately), falling back to the cached copy only when offline. Supabase
// and other cross-origin/non-GET requests are never cached.
const CACHE = "fitgeek-shell-v1";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./supabase-config.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // never touch Supabase writes
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // leave Supabase/CDN calls alone

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        // Offline: serve a cached copy. ignoreSearch lets app.js?v=123 match
        // the precached app.js. Fall back to the app shell for navigations.
        caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("./index.html"))
      )
  );
});
