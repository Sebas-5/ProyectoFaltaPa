# Faltas 2DAM

Página para llevar la cuenta de las faltas de cada módulo. Los datos se guardan en
**Firebase Realtime Database**, así que cuando alguien apunta una falta el resto la ve
al momento sin recargar.

## Cómo funciona

- Todo está en `index.html` (HTML + CSS + JS, sin compilar nada).
- Los datos viven en la base de datos con esta forma:

  ```json
  {
    "faltas": {
      "Sebastian": { "SSG": 2, "PGV": 0, "...": 0 },
      "Matías":    { "SSG": 1, "...": 0 }
    },
    "retrasos": {
      "Sebastian": { "SSG": 1, "PGV": 0, "...": 0 }
    }
  }
  ```

- Los retrasos se cuentan aparte de las faltas (no suman para el límite).
- La página se suscribe a `faltas` y `retrasos` con `onValue`: cualquier cambio en la base de datos
  vuelve a pintar el ranking y los módulos en todos los navegadores abiertos.
- Los botones `+` / `−` usan `runTransaction`, así que si dos personas pulsan a la vez
  no se pierde ningún clic.
- Arriba a la derecha hay un indicador: **En directo** (verde), **Reconectando…**
  (naranja) o **Modo local** (rojo, cuando no hay Firebase configurado y los datos se
  guardan solo en ese navegador, como en la versión original).

## Poner en marcha la base de datos

1. Entra en <https://console.firebase.google.com> y crea un proyecto (p. ej. `faltas-2dam`).
   Google Analytics no hace falta.
2. En el menú **Compilación → Realtime Database** pulsa **Crear base de datos**.
   Elige la ubicación de Europa (`europe-west1`) y empieza en **modo bloqueado**.
3. En la pestaña **Reglas** pega el contenido de `database.rules.json` y pulsa **Publicar**.
4. En **Configuración del proyecto → General → Tus apps** añade una app web (`</>`).
   Firebase te enseña un objeto `firebaseConfig`.
5. Copia esos valores en el `firebaseConfig` que está al principio del `<script>` de
   `index.html`. Comprueba que `databaseURL` está relleno (si no aparece, cópialo de la
   parte de arriba de la pantalla de Realtime Database).
6. Abre `index.html`: el indicador debe ponerse en verde, **En directo**.

> La `apiKey` de Firebase no es secreta: está pensada para ir en el código del
> navegador. Lo que protege los datos son las reglas.

## Reglas de seguridad

`database.rules.json` deja leer a cualquiera y solo permite escribir números entre 0 y
200 en las personas y módulos que existen en la página. No hay usuarios ni contraseñas,
así que cualquiera que tenga el enlace puede cambiar faltas. Si más adelante quieres
que cada uno solo pueda modificar las suyas, el siguiente paso sería añadir
**Firebase Authentication** (por ejemplo, inicio de sesión con Google) y comprobar
`auth.uid` en las reglas.

## Publicar la web

Al ser un único HTML se puede subir a cualquier hosting estático: GitHub Pages,
Firebase Hosting, Netlify, Hostinger…

## Añadir personas o módulos

Edita los arrays `PERSONAS` y `MODULOS` en `index.html` y añade los nuevos nombres o
ids también en `database.rules.json` (y vuelve a publicar las reglas).
