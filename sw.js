const CACHE_NAME = 'chess-saga-cache-v3';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'css/styles.css',
    'css/vfx.css',
    'js/core.js',
    'js/game.js',
    'js/puzzles.js',
    'js/forge.js',
    'js/audio.js',
    'js/vfx.js',
    'js/antimat.js',
    'js/scenarios.js',
    'js/progression.js',
    'js/settings.js',
    // ── Avatars ──────────────────────────────────────────────
    'Visualization/avatars/avatar-shadow.png',
    'Visualization/avatars/avatar-knight.png',
    'Visualization/avatars/avatar-alchemist.png',
    'Visualization/avatars/avatar-mage.png',
    // ── Icons & oracle ───────────────────────────────────────
    'Visualization/icon_oracle.png',
    // ── Pre-existing Visualization icons ─────────────────────
    'Visualization/‼️.png',
    'Visualization/⌛.png',
    'Visualization/⏱️.png',
    'Visualization/☁️.png',
    'Visualization/☣️.png',
    'Visualization/♔.png',
    'Visualization/♕.png',
    'Visualization/♖.png',
    'Visualization/♗.png',
    'Visualization/♘.png',
    'Visualization/♙.png',
    'Visualization/♚.png',
    'Visualization/♛.png',
    'Visualization/♜.png',
    'Visualization/♝.png',
    'Visualization/♞.png',
    'Visualization/♟.png',
    'Visualization/♥️.png',
    'Visualization/⚔️.png',
    'Visualization/⚙️.png',
    'Visualization/⚠️.png',
    'Visualization/⚡.png',
    'Visualization/⛅.png',
    'Visualization/⛏️.png',
    'Visualization/⛓️.png',
    'Visualization/⛪.png',
    'Visualization/⛰️.png',
    'Visualization/✂️.png',
    'Visualization/✏️.png',
    'Visualization/✒️.png',
    'Visualization/✨.png',
    'Visualization/❄️.png',
    'Visualization/❓.png',
    'Visualization/❗.png',
    'Visualization/⬆️.png',
    'Visualization/⬇️.png',
    'Visualization/🌀.png',
    'Visualization/🌋.png',
    'Visualization/🌍.png',
    'Visualization/🌑.png',
    'Visualization/🌨️.png',
    'Visualization/🌫️.png',
    'Visualization/🍴.png',
    'Visualization/🎀.png',
    'Visualization/🎓.png',
    'Visualization/🏃.png',
    'Visualization/🏆.png',
    'Visualization/🏝️.png',
    'Visualization/🏰.png',
    'Visualization/🏳️.png',
    'Visualization/🏹.png',
    'Visualization/🐎.png',
    'Visualization/🐐.png',
    'Visualization/🐢.png',
    'Visualization/🐦‍⬛.png',
    'Visualization/👁️.png',
    'Visualization/👑.png',
    'Visualization/👓.png',
    'Visualization/👟.png',
    'Visualization/👸.png',
    'Visualization/👺.png',
    'Visualization/👻.png',
    'Visualization/👽.png',
    'Visualization/💀.png',
    'Visualization/💎.png',
    'Visualization/💔.png',
    'Visualization/💘.png',
    'Visualization/💡.png',
    'Visualization/💣.png',
    'Visualization/💥.png',
    'Visualization/💧.png',
    'Visualization/💰.png',
    'Visualization/💸.png',
    'Visualization/💾.png',
    'Visualization/📖.png',
    'Visualization/📜.png',
    'Visualization/🔄.png',
    'Visualization/🔆.png',
    'Visualization/🔊.png',
    'Visualization/🔍.png',
    'Visualization/🔥.png',
    'Visualization/🔧.png',
    'Visualization/🔨.png',
    'Visualization/🔪.png',
    'Visualization/🔫.png',
    'Visualization/🔱.png',
    'Visualization/🕊️.png',
    'Visualization/🕯.png',
    'Visualization/🕸️.png',
    'Visualization/🗑️.png',
    'Visualization/🗡️.png',
    'Visualization/🗣️.png',
    'Visualization/🗿.png',
    'Visualization/😈.png',
    'Visualization/😰.png',
    'Visualization/😵.png',
    'Visualization/🚩.png',
    'Visualization/🛡️.png',
    'Visualization/🟣.png',
    'Visualization/🤺.png',
    'Visualization/🥁.png',
    'Visualization/🥇.png',
    'Visualization/🦅.png',
    'Visualization/🧐.png',
    'Visualization/🧩.png',
    'Visualization/🧸.png',
    'Visualization/🩸.png',
    'Visualization/🪓.png',
    'Visualization/🪚.png',
    'Visualization/🪜.png',
    'Visualization/🪨.png',
    'Visualization/🪵.png',
    // ── Newly added icons ────────────────────────────────────
    'Visualization/⏸️.png',
    'Visualization/⚖️.png',
    'Visualization/⚜️.png',
    'Visualization/✉️.png',
    'Visualization/➡️.png',
    'Visualization/⭐.png',
    'Visualization/🌙.png',
    'Visualization/🌹.png',
    'Visualization/🎙️.png',
    'Visualization/🎭.png',
    'Visualization/🎯.png',
    'Visualization/💫.png',
    'Visualization/📂.png',
    'Visualization/🔗.png',
    'Visualization/🔦.png',
    'Visualization/🔮.png',
    'Visualization/🪝.png',
    // ── PWA icons ────────────────────────────────────────────
    'Visualization/icons/site.webmanifest',
    'Visualization/icons/favicon.ico',
    'Visualization/icons/favicon.svg',
    'Visualization/icons/favicon-96x96.png',
    'Visualization/icons/web-app-manifest-192x192.png',
    'Visualization/icons/web-app-manifest-512x512.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching files');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

self.addEventListener('activate', event => {
    const PRESERVED_CACHES = [CACHE_NAME, 'stockfish-cache-v1'];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (!PRESERVED_CACHES.includes(cache)) {
                        console.log('[Service Worker] Deleting old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;

    // Fast return for external CDNs (Tailwind, Chess.js) or Audio/API files to save space
    if (event.request.url.includes('cdn.cloudflare.com') ||
        event.request.url.includes('cloudflare.com') ||
        event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('/audio/')) {
        return;
    }

    const url = event.request.url;
    // Check if the request is for Stockfish-related heavy files
    const isStockfishAsset = url.includes('stockfish') || url.includes('.wasm') || url.includes('.nnue');

    if (isStockfishAsset) {
        event.respondWith(
            caches.open('stockfish-cache-v1').then(cache => {
                return cache.match(event.request).then(response => {
                    // Cache First: return cached file if available
                    if (response) {
                        return response;
                    }
                    // If not in cache, fetch from network and cache it dynamically
                    return fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch(err => {
                        console.warn('[Service Worker] Stockfish resource fetch failed offline:', url);
                    });
                });
            })
        );
        return; // Important: Return early so it doesn't execute the default catch-all logic below
    }

    // Default cache logic for all other assets
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found, else fetch from network
                return response || fetch(event.request).catch(err => {
                    console.warn('[Service Worker] Network request failing offline:', event.request.url);
                });
            })
    );
});
