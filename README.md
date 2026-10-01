# Faltas 2DAM

Página para llevar la cuenta de las faltas de cada módulo. Los datos se guardan en
**Firebase Realtime Database**, así que cuando alguien apunta una falta el resto la ve
al momento sin recargar.

## Cómo funciona

- Todo está en `index.html` (HTML + CSS + JS, sin compilar nada). El logo y los iconos están en `img/`.
- Para entrar hay que **registrarse con un código de invitación**. Hay un código por
  persona y solo se puede usar una vez: al registrarte, tu cuenta queda vinculada a
  tus faltas.
- Todos los miembros ven el ranking y las faltas de los demás, pero **cada uno solo
  puede modificar las suyas**. Esto lo comprueban las reglas de la base de datos, no
  solo la página.
- Desde el botón con tu nombre (arriba a la derecha) puedes poner una **foto de
  perfil** y un **nombre visible**. La foto se recorta a 320×320 y se guarda en la
  propia base de datos.
- Los retrasos se cuentan aparte de las faltas (no suman para el límite).
- **Fecha de cada falta**: al pulsar `+` se elige el día de la falta (con atajos a las
  últimas clases de ese módulo). Solo se aceptan días con clase de ese módulo según el
  horario, desde el inicio del curso hasta hoy.
- **Proyección**: con el ritmo que llevas desde que empezaron las clases hasta hoy (por
  ejemplo, 2 faltas en 2 semanas = 1 por semana) se estima cuándo te quedarías sin
  margen en cada módulo ("a este ritmo te quedas sin margen en Desarrollo de interfaces
  a mediados de enero") o con cuántas faltas acabarías el curso.
- **Estadísticas**: tus faltas totales, el módulo más comprometido (con el % del límite
  usado) y los días seguidos sin faltar; una gráfica de barras con las faltas de cada
  mes del curso y la lista "Lo que te queda" con el margen de cada módulo (naranja si
  queda el 25 % o menos, rojo si ya estás en el límite). Se puede ver a cualquier
  miembro del grupo y se actualiza en tiempo real.
- **Muro**: cada falta apuntada aparece en el muro del grupo ("Joaquín ha faltado a
  Desarrollo de interfaces · hace 5 min"). Se puede reaccionar con 😂 💀 👀 🫡 😤 (una vez
  por emoji y persona; al pulsar el contador se ve quién) y comentar (máximo 200
  caracteres). Cada uno borra sus comentarios y el administrador (Sebastian) puede
  borrar cualquiera. El menú muestra cuántas entradas nuevas hay sin leer. Se cargan
  las 20 últimas entradas y 20 más al llegar al final de la lista.

### Calendario y horario del curso

`index.html` tiene dos objetos con el curso:

- `CALENDARIO`: primer y último día de clase, festivos y vacaciones (los usa la
  proyección para contar los días de clase pasados y los que quedan).
- `HORARIO`: cuántas sesiones tiene cada módulo el lunes, martes, miércoles, jueves
  y viernes (sirve para comprobar que el día elegido para una falta tuvo clase de ese
  módulo).

Si cambia alguna fecha o el horario, basta con editarlos ahí.

### Estructura de la base de datos

```text
faltas/{persona}/{modulo}    número de faltas
registro/{persona}/{id}      { modulo, fecha, ts }  una entrada por falta (ts: hora exacta)
muro/{persona}/{id}          reacciones/{emoji}/{persona}: true
                             comentarios/{id}: { autor, texto, ts }
retrasos/{persona}/{modulo}  número de retrasos
perfiles/{persona}           { nombre, foto }
usuarios/{uid}               { persona }        cuenta → persona (solo la lee su dueño)
duenos/{persona}             { uid, codigo }    persona → cuenta (nadie la puede leer)
```

`{persona}` es el id interno: `Sebastian`, `Matías`, `Ian` o `Joaquín`.

El contador de `faltas` y su entrada en `registro` se escriben siempre juntos en una
sola operación. Las faltas apuntadas antes de que existiera el registro se migran
solas con la fecha del día en que cada uno vuelve a entrar en la web.

## Configurar Firebase

1. **Authentication**: en la consola, *Compilación → Authentication → Comenzar →
   Método de acceso*, activa **Correo electrónico/contraseña**.
2. **Reglas**: en *Realtime Database → Reglas* pega el contenido de
   `database.rules.json` **sustituyendo `CODIGO_SEBASTIAN`, `CODIGO_MATIAS`,
   `CODIGO_IAN` y `CODIGO_JOAQUIN` por los códigos reales** y pulsa *Publicar*.

> Los códigos **no** se guardan en este repositorio porque es público. Solo están en
> las reglas publicadas en Firebase, que no se pueden leer desde la web.
> Si cambias las reglas en el futuro, acuérdate de volver a poner los códigos.

### Si alguien se equivoca de cuenta

Para liberar el código de una persona, borra en la pestaña *Datos* los nodos
`duenos/{persona}` y `usuarios/{uid de su cuenta}`, y la cuenta en *Authentication*.
Después podrá registrarse otra vez con el mismo código.

### Contraseña olvidada

En la pantalla de inicio de sesión, *¿Has olvidado la contraseña?* envía un correo
de Firebase para cambiarla.

## App instalable (PWA)

La web se puede instalar en Android, iPhone y ordenador:

- `manifest.json`: nombre, colores e iconos de la app (todas las rutas son relativas,
  porque en GitHub Pages la web vive en `usuario.github.io/ProyectoFaltaPa/`).
- `sw.js`: service worker. Solo maneja peticiones GET de la propia web, con estrategia
  *network-first* (si hay red carga lo último y actualiza la caché; si no, usa la
  caché). Firebase y las fuentes van siempre directos a la red.
- Iconos en `img/`: `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`,
  `icon-maskable-512.png` y `apple-touch-icon.png`.
- Botón **Instalar app** (Chrome/Edge en Android y ordenador) y, en iPhone, un aviso
  con los pasos (Compartir → Añadir a pantalla de inicio).

### Sin conexión

Realtime Database no tiene persistencia en disco en el SDK web, así que:

- La app guarda una copia local de los últimos datos para poder abrirse sin red.
- Las faltas apuntadas sin conexión las envía Firebase al volver la red, **siempre que
  la app siga abierta**. Mientras tanto se muestra el aviso "Sin conexión".
- La sesión la guarda Firebase en el navegador y sigue iniciada al reabrir la app. En
  iPhone la app instalada no comparte datos con Safari: hay que iniciar sesión una vez
  dentro de la app.

### Cuándo subir la versión de la caché

Como la estrategia es *network-first*, los cambios en `index.html`, las imágenes, etc.
llegan solos en cuanto hay red. Sube `CACHE` en `sw.js` (`faltas-v1` → `faltas-v2`…)
cuando añadas, quites o renombres archivos de la lista `ESTATICOS`, o cuando quieras
borrar por completo la caché vieja de todos los dispositivos.

## Publicar la web

Al ser un único HTML se puede subir a cualquier hosting estático: GitHub Pages,
Firebase Hosting, Netlify, Hostinger…

## Añadir personas o módulos

Edita los arrays `PERSONAS` y `MODULOS` en `index.html` y añade los nuevos nombres o
ids también en `database.rules.json`. Una persona nueva necesita además su propio código en la regla de `duenos` (y vuelve a publicar las reglas).
