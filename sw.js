// Service worker unique d'AWE Ritual (portée racine : accueil + v1/ à v6/ = une seule app installée).
// Code (HTML/CSS/JS) : réseau d'abord, repli sur le cache après 4 s ou hors ligne.
// Icônes, polices, SDK Firebase : cache d'abord.
// ⚠️ CACHE_NAME est mis à jour automatiquement par .github/workflows/auto-version.yml à chaque push.

const CACHE_NAME = 'awe-ritual-r1';
const CACHE_PREFIX = 'awe-ritual-';
const DELAI_RESEAU_MS = 4000;

const CODE = [
  './', './index.html', './style.css', './app.js', './commun.js',
  './v1/', './v1/index.html', './v1/style.css', './v1/app.js',
  './v2/', './v2/index.html', './v2/style.css', './v2/app.js',
  './ciel.js',
  './v3/', './v3/index.html', './v3/style.css', './v3/app.js',
  './v4/', './v4/index.html', './v4/style.css', './v4/app.js',
  './v5/', './v5/index.html', './v5/style.css', './v5/app.js',
  './v6/', './v6/index.html', './v6/style.css', './v6/app.js'
];
const ANNEXES = [
  './manifest.json', './icones/icone-192.png', './icones/icone-512.png',
  './icones/icone-512-maskable.png', './icones/apple-touch-icon.png'
];
const SDK = [
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js'
];

// Chaque fichier est mis en cache individuellement : un seul 404 ne doit jamais tout annuler.
function mettreEnCache(cache, url, options) {
  return fetch(new Request(url, Object.assign({ cache: 'reload' }, options || {})))
    .then((r) => { if (r && (r.ok || r.type === 'opaque')) return cache.put(cleCache(url), r); })
    .catch(() => {});
}
function cleCache(u) {
  const url = new URL(typeof u === 'string' ? u : u.url, self.location.href);
  if (url.origin === self.location.origin) url.search = ''; // app.js?v=… et app.js = même entrée
  return url.href;
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.all([
    ...CODE.map((u) => mettreEnCache(cache, u)),
    ...ANNEXES.map((u) => mettreEnCache(cache, u)),
    ...SDK.map((u) => mettreEnCache(cache, u, { mode: 'no-cors' }))
  ])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cles) => Promise.all(
    cles.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME).map((k) => caches.delete(k))
  )));
  self.clients.claim();
});

function pageSecours() {
  return new Response(
    '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>AWE Ritual</title>' +
    '<style>html,body{height:100%;margin:0;background:#070917;color:#f1ecff;font-family:-apple-system,system-ui,sans-serif;' +
    'display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box}' +
    'p{color:rgba(241,236,255,.64);font-size:15px;line-height:1.5}button{min-height:48px;padding:0 24px;border-radius:999px;border:0;' +
    'background:#f2c46d;color:#1a1430;font-size:16px;font-weight:600}</style></head><body><div>' +
    '<h1 style="font-size:22px;margin:0 0 8px">Pas de réseau</h1><p>AWE Ritual n\'a pas encore de copie hors ligne sur cet appareil.</p>' +
    '<button onclick="location.reload()">Réessayer</button></div></body></html>',
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

function reseauPuisCache(requete) {
  return new Promise((resolve) => {
    let fini = false;
    const finir = (r) => { if (!fini) { fini = true; resolve(r); } };
    const repli = () => caches.match(cleCache(requete)).then((r) => r || (requete.mode === 'navigate' ? pageSecours() : Response.error()));
    const minuteur = setTimeout(() => repli().then(finir), DELAI_RESEAU_MS);
    fetch(new Request(requete.url, { cache: 'no-cache' })).then((rep) => {
      clearTimeout(minuteur);
      if (rep && rep.status === 200) { const copie = rep.clone(); caches.open(CACHE_NAME).then((c) => c.put(cleCache(requete), copie)); }
      finir(rep);
    }).catch(() => { clearTimeout(minuteur); repli().then(finir); });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // SDK Firebase et polices Google : cache d'abord.
  if (SDK.includes(req.url) || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(caches.match(req.url).then((c) => c || fetch(req).then((r) => {
      if (r && (r.ok || r.type === 'opaque')) { const copie = r.clone(); caches.open(CACHE_NAME).then((ca) => ca.put(req.url, copie)); }
      return r;
    })));
    return;
  }
  if (url.origin !== self.location.origin) return; // Firebase Auth, Firestore… jamais interceptés

  if (req.mode === 'navigate' || /\.(html|css|js)$/.test(url.pathname) || url.pathname.endsWith('/')) {
    event.respondWith(reseauPuisCache(req));
    return;
  }
  event.respondWith(caches.match(cleCache(req)).then((c) => c || fetch(req)));
});
