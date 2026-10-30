const sw = self;
const CACHE = 'straider-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-512.png'];
sw.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
    sw.skipWaiting();
});
sw.addEventListener('activate', e => {
    e.waitUntil(caches.keys()
        .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
        .then(() => sw.clients.claim()));
});
sw.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== location.origin)
        return;
    e.respondWith(fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
        .catch(async () => (await caches.match(req)) || (await caches.match('./index.html')) || Response.error()));
});
