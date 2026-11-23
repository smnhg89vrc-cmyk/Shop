/* 客人點餐頁 Service Worker：永遠先抓最新版，沒網路才用舊的（讓 Android 可以安裝成 APP） */
const CACHE = "pos1-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;   /* 外部網址（ntfy、字型）不處理 */
  if (/\/pos\.html$/i.test(u.pathname)) return;                      /* 收銀頁不處理 */
  e.respondWith(
    fetch(r, { cache: "no-store" })
      .then(res => {
        if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(r, c)).catch(() => {}); }
        return res;
      })
      .catch(() => caches.match(r).then(m => m || Response.error()))
  );
});
