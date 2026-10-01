// Service worker de Faltas 2DAM
//
// · Solo maneja peticiones GET de esta web (mismo origen y dentro de su carpeta).
//   Firebase (base de datos y login), Chart.js, las fuentes y cualquier otro
//   origen van directos a la red: aquí ni se tocan.
// · Estrategia "network-first": si hay red se descarga lo último y se guarda en
//   la caché; si no hay red, se sirve lo que haya en la caché.
// · Sube la versión de CACHE cuando cambies la lista de ESTATICOS o quieras
//   forzar que se borre la caché antigua en todos los dispositivos.

const CACHE = "faltas-v1";

// Archivos que se guardan nada más instalar, para que la app abra sin conexión.
// Rutas relativas a la carpeta del service worker (la web puede estar en /nombre-repo/).
const ESTATICOS = [
  "./",
  "index.html",
  "manifest.json",
  "img/logo.png",
  "img/logo-192.png",
  "img/favicon.png",
  "img/apple-touch-icon.png",
  "img/icon-192.png",
  "img/icon-512.png",
  "img/icon-maskable-192.png",
  "img/icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ESTATICOS))
      .then(() => self.skipWaiting())   // la versión nueva entra sin esperar a cerrar pestañas
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(nombres.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())   // controla ya las pestañas abiertas
  );
});

self.addEventListener("fetch", event => {
  const peticion = event.request;
  if (peticion.method !== "GET") return;                          // POST, etc.: a la red
  if (!peticion.url.startsWith(self.registration.scope)) return;  // otro origen u otra web del mismo dominio: a la red

  event.respondWith(
    fetch(peticion)
      .then(respuesta => {
        // Solo se guardan respuestas buenas de nuestro propio origen
        if (respuesta.ok && respuesta.type === "basic") {
          const copia = respuesta.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(peticion, copia)));
        }
        return respuesta;
      })
      .catch(async () => {
        const guardada = await caches.match(peticion, { ignoreSearch: true });
        if (guardada) return guardada;
        // Sin red y sin esa URL en caché: si es una página, se abre la app
        if (peticion.mode === "navigate") return (await caches.match("index.html")) || (await caches.match("./"));
        return Response.error();
      })
  );
});
