// Service worker sederhana: selalu ambil versi terbaru kalau online,
// pakai salinan tersimpan kalau offline. Data ke Google (Apps Script) tidak disimpan.
// Naikkan nama CACHE setiap rilis baru.
const CACHE = "myxinyuan-v9";
const FILE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", function (e) {
  // Simpan file satu per satu. Kalau ada yang tidak ditemukan, dilewati saja
  // supaya pemasangan aplikasi tidak ikut gagal.
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FILE.map(function (f) { return c.add(f).catch(function () {}); }));
  }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (nama) {
    return Promise.all(nama.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res.ok) {
        const salinan = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, salinan); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match("./index.html"); });
    })
  );
});
