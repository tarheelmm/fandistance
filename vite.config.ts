import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Every file under public/, as paths relative to the site root. */
function publicFiles(dir = 'public'): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? publicFiles(full) : [relative('public', full).split('\\').join('/')];
  });
}

/**
 * Emits sw.js with the full build precached, so the installed app opens offline.
 * The cache name is a hash of the file list, so each deploy replaces the old cache.
 */
function offlineServiceWorker(): Plugin {
  return {
    name: 'fd-offline-sw',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = ['./', 'index.html', ...Object.keys(bundle), ...publicFiles()].filter((f, i, all) => f !== 'sw.js' && all.indexOf(f) === i);
      const version = createHash('sha1').update(files.join('|')).digest('hex').slice(0, 10);
      const source = `const CACHE = 'fd-${version}';
const PRECACHE = ${JSON.stringify(files.map((f) => (f === './' ? f : `./${f}`)))};

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('fd-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // Network first for the page so a new deploy shows up; the cached shell keeps it working offline.
    event.respondWith(fetch(req).catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))));
    return;
  }
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), offlineServiceWorker()],
  server: { port: 5173 },
  preview: { port: 4173 },
});
