// Offline-Speicher der EGS-IB-App. Bei JEDER neuen Version CACHE hochzaehlen (gleich wie APP_VERSION in index.html),
// dann laden die Handys beim naechsten Oeffnen mit Empfang die neuen Dateien.
const CACHE = "egs-ib-1.1";
const IMAGES = ["acrel_addr", "acrel_ct", "acrel_pass", "acrel_save", "aerosol", "batt_ein", "batt_stecker", "bms_a5b5", "dongle",
  "eastron", "logo", "meter_pinout", "netz", "pe_grid", "potausgleich", "router_wan", "schrank", "wandler_richtung",
  "wr_klemmen_pos4", "wr_klemmen_pos7", "wr_klemmen_pos8", "wr_ports", "wr_uebersicht", "wr_uebersicht_ohne"];
const SHELL = ["./", "index.html", "manifest.webmanifest", "img/icon-192.png", "img/icon-512.png", "img/apple-touch-icon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"].concat(IMAGES.map(n => "img/" + n + ".jpg"));

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// App-Seite: zuerst Netz (neueste Version), ohne Netz aus dem Speicher. Alles andere: zuerst Speicher.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === "opaque") { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  })));
});
