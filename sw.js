// Future Simple: offline mode. Audio is saved the first time it plays (no big download on join).
const VERSION = 'v28';
const CACHE = 'b21-lab-' + VERSION;
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
const AUDIO = [];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE);
    // Audios uno por uno: si alguno falla, el resto igual queda guardado
    for (const f of AUDIO) { try { if (!(await c.match(f))) await c.add(f); } catch (err) {} }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('b21-lab-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

// Safari pide los audios por partes (Range). Se responde con 206 desde la copia guardada.
async function rangeResponse(req, res) {
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  let start = m && m[1] ? parseInt(m[1]) : 0;
  let end = m && m[2] ? parseInt(m[2]) : buf.byteLength - 1;
  end = Math.min(end, buf.byteLength - 1);
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes'
    }
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Tipografias de Google: se guardan la primera vez que cargan
  if (url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com')) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const r = await fetch(req); if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }
      catch (err) { return new Response('', { status: 504 }); }
    }));
    return;
  }
  if (url.origin !== location.origin) return;

  // Audios: primero la copia guardada
  if (url.pathname.includes('/audio/')) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const path = url.pathname;
      let hit = await c.match(path, { ignoreSearch: true }) || await c.match(req.url, { ignoreSearch: true });
      if (!hit) {
        try { const full = await fetch(req.url); if (full.ok) { await c.put(req.url, full.clone()); hit = full; } }
        catch (err) { return new Response('', { status: 504 }); }
      }
      if (!hit) return fetch(req);
      return req.headers.has('range') ? rangeResponse(req, hit) : hit;
    })());
    return;
  }

  // Ilustraciones 3D de Word Wars: se guardan la primera vez
  if (url.pathname.includes('/em/') || url.pathname.endsWith('/dict.json')) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; }
      catch (err) { return new Response('', { status: 504 }); }
    }));
    return;
  }

  // Pagina: intenta la version nueva en linea; sin internet usa la guardada
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      try { const r = await fetch(req); if (r.ok) c.put('index.html', r.clone()); return r; }
      catch (err) { return (await c.match('index.html')) || (await c.match('./')); }
    })());
    return;
  }

  e.respondWith(caches.match(req).then(h => h || fetch(req)));
});
