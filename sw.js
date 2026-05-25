// KILL-SWITCH SW. See v2/sw.js for full explanation. Any browser still
// holding the old SW will install this on the next navigation, which will
// delete every cache, unregister itself, and reload all clients.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) { /* ignore */ }
    try {
      await self.registration.unregister();
    } catch (e) { /* ignore */ }
    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const c of clients) {
        try { c.navigate(c.url); } catch (e) { /* ignore */ }
      }
    } catch (e) { /* ignore */ }
  })());
});

// Pass-through: do not intercept any fetch.
