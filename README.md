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
- **Proyección**: con las faltas que llevas y los días de clase que han pasado se
  calcula tu ritmo y se estima cuándo te quedarías sin margen en cada módulo (por
  ejemplo, "a este ritmo te quedas sin margen en Interfaces a mediados de enero") o
  con cuántas faltas acabarías el curso. Se supone que las faltas se reparten por
  igual entre todos los días lectivos.

### Calendario del curso

La proyección usa el objeto `CALENDARIO` de `index.html`: primer y último día de
clase, festivos y vacaciones. Si alguna fecha no coincide con la de vuestro centro,
basta con cambiarla ahí.

### Estructura de la base de datos

```text
faltas/{persona}/{modulo}    número de faltas
retrasos/{persona}/{modulo}  número de retrasos
perfiles/{persona}           { nombre, foto }
usuarios/{uid}               { persona }        cuenta → persona (solo la lee su dueño)
duenos/{persona}             { uid, codigo }    persona → cuenta (nadie la puede leer)
```

`{persona}` es el id interno: `Sebastian`, `Matías`, `Ian` o `Joaquín`.

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

## Publicar la web

Al ser un único HTML se puede subir a cualquier hosting estático: GitHub Pages,
Firebase Hosting, Netlify, Hostinger…

## Añadir personas o módulos

Edita los arrays `PERSONAS` y `MODULOS` en `index.html` y añade los nuevos nombres o
ids también en `database.rules.json`. Una persona nueva necesita además su propio código en la regla de `duenos` (y vuelve a publicar las reglas).
