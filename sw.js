// Service Worker para INSSO Admin
const CACHE_NAME = 'insso-admin-v1';
const ASSETS_TO_CACHE = [
    'index.html',
    'manifest.json',
    'logo-insso.png'
];

// Instalación
self.addEventListener('install', event => {
    console.log('✅ Service Worker INSSO Admin - Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cacheando assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación
self.addEventListener('activate', event => {
    console.log('✅ Service Worker INSSO Admin - Activado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar peticiones (offline)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        return response;
                    })
                    .catch(() => {
                        return caches.match('index.html');
                    });
            })
    );
});
