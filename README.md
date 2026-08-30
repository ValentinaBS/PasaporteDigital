# Pasaporte Digital · PUMM 2026

Web app que acompaña el recorrido de las participantes por el evento PUMM.
Escanean el QR de cada espacio, se les registra la misión, ven su progreso
y desbloquean insignias. En paralelo, le da al equipo organizador datos de
participación sin carga manual.

**Chicas en Tecnología** · HTML, CSS y JavaScript, sin frameworks ni
herramientas de compilación.

---

## Qué hay en este repo

Esta es la **base compartida**: la configuración, los estilos y la lógica que
usan todas las pantallas. **Las pantallas todavía no están hechas** — se van a
ir creando a partir de las plantillas, y ese es el trabajo que arranca ahora.

La idea es que ninguna tenga que decidir de nuevo cómo se llama una clase, de
dónde sale el violeta de marca o cómo se guarda el progreso. Eso ya está
resuelto y es igual para las cinco.

---

## Cómo arrancar

1. Abrí la carpeta en VS Code (`Archivo → Abrir carpeta`).
2. Instalá **Live Server** (VS Code te la va a ofrecer sola la primera vez,
   porque está en `.vscode/extensions.json`).
3. Clic derecho sobre `index.html` → **Open with Live Server**.

> **Usá siempre Live Server, no el doble clic.**
> Abrir un `.html` con doble clic funciona hoy, pero el navegador lo trata
> distinto que a una página web de verdad. En cuanto agreguemos algo que use
> archivos externos, va a andar en Live Server y fallar con doble clic — y ese
> bug es muy difícil de encontrar si no sabés que existe.

---

## Cómo crear una pantalla

Hay dos plantillas listas para copiar. **No las edites: copialas.**

```
html/_plantilla.html        →  el molde de una pantalla
js/paginas/_plantilla.js    →  el molde de su lógica
```

Los pasos, que están comentados dentro de cada plantilla:

1. Copiá `html/_plantilla.html` y renombralo (ej. `pasaporte.html`).
   Minúscula, sin acentos ni espacios.
2. Cambiá el `<title>` y el `data-pagina` del `<body>`.
3. Escribí tu contenido dentro de `<main>`.
4. ¿Necesitás CSS propio? Creá `css/paginas/pasaporte.css` y agregá su
   `@import` al final de `css/main.css`.
5. ¿Necesitás JS propio? Copiá `js/paginas/_plantilla.js` como
   `js/paginas/pasaporte.js` y descomentá su `<script>` en tu HTML.
6. Borrá de tu copia los comentarios de instrucciones y lo que no uses.

**`html/index.html` ya existe: es la pantalla de registro**, la primera del
recorrido. Está creada pero vacía de contenido — completarla es el primer
trabajo. No la borres ni la renombres: el `index.html` de la raíz redirige ahí
y `js/ui.js` manda ahí a quien todavía no tenga pasaporte.

### Las pantallas que faltan

Ojo con esto: varios de los estados de la lista de producto **no son páginas,
son modales** — "registro exitoso", "ocurrió un error" se resuelven con `PUMM.UI.abrirModal({...})` sobre la pantalla en la
que ya está la persona, no navegando a otro lado. Contando así, los archivos
HTML reales son siete:

| Archivo | Qué es | Estado |
|---|---|---|
| `html/index.html` | Registro de la participante | creada, vacía |
| `html/pasaporte.html` | Mi Pasaporte (pantalla principal) | falta |
| `html/misiones.html` | Listado de misiones | falta |
| `html/logros.html` | Insignias | falta |
| `html/nueva-mision.html` | Adonde apuntan los QR | falta |
| `html/mision-ya-registrada.html` | Repetición de misiones | falta |
| `html/completado.html` | Recorrido completado | falta |

> **Cambio de requerimientos:** la pantalla de activación (código de
> acreditación) salió del flujo. Ahora se entra directo por el registro. Si
> encontrás "activación" mencionada en algún archivo, es una referencia vieja
> — avisá y la limpiamos.

> **Cuidado con la palabra "registro":** en este proyecto significa dos cosas.
> El registro **de la participante** es `html/index.html`, la pantalla inicial.
> El registro **de una misión** es la pantalla del QR, que por eso conviene
> llamar `nueva-mision.html` y no `registro.html`. Mismo cuidado en el JS:
> `registrarMision()` es lo segundo, no lo primero.

---

## Estructura

```
PasaporteDigital/
│
├── index.html              ← redirige a html/index.html
├── README.md
├── .gitignore
├── .vscode/                ← configuración compartida del equipo
│
├── html/
│   ├── index.html          ← pantalla de registro (creada, sin contenido)
│   └── _plantilla.html     ← copiar para crear cada pantalla
│
├── css/
│   ├── main.css            ← el único que se linkea; importa todo lo demás
│   ├── base/                   reset, variables, tipografía, utilidades
│   ├── componentes/            botón, campo, tarjeta, modal, navegación,
│   │                           pantalla plena, progreso, insignia
│   └── paginas/                (vacía — un archivo por pantalla)
│
├── js/
│   ├── config.js               constantes y "perillas" del proyecto
│   ├── datos.js                única puerta de entrada a la información
│   ├── ui.js                   helpers compartidos (modales, formato, URL)
│   ├── app.js                  lo que corre en todas las pantallas
│   └── paginas/
│       └── _plantilla.js   ← copiar para la lógica de cada pantalla
│
├── data/                   ← arrays de datos (misiones, insignias, textos)
│
└── assets/                 ← imágenes, íconos y fuentes
```

---

## Lo que ya está resuelto

### Los cuatro archivos que centralizan todo

| Archivo | Qué centraliza | Qué evita |
|---|---|---|
| `css/base/variables.css` | Colores, tamaños y espacios | Que el violeta de marca esté escrito a mano en 30 lugares |
| `css/main.css` | El orden de carga del CSS | Editar 8 HTML cada vez que se agrega un componente |
| `js/datos.js` | Todo el acceso a la información | Que migrar al backend obligue a tocar las 8 pantallas |
| `data/textos.js` | Los mensajes que lee una participante | Que se escape un "Error 404" en una pantalla |

La regla es la misma en los cuatro: **una decisión, un solo lugar donde vive.**
Si estás por escribir un color, un mensaje o una llamada a `localStorage`
dentro de una pantalla, casi seguro va en uno de estos archivos.

### La paleta ya está cargada y chequeada

`css/base/variables.css` tiene los seis colores del manual PUMM 2026 más una
tabla de qué combinaciones se pueden usar **para texto**. Vale la pena leerla
antes de elegir un color: el amarillo sobre blanco da 1.6:1 de contraste y es
ilegible, y el cian todavía menos. Los dos son colores de fondo y de acento,
nunca de texto sobre claro.

El evento es presencial y con luz variable. El contraste no es un detalle
estético acá.

### Los componentes que ya existen

En `css/componentes/`, listos para usar desde el HTML:

`.boton` · `.campo` · `.tarjeta` · `.modal` · `.nav` · `.pantalla-plena` ·
`.progreso` · `.insignia`

Y en `css/base/utilidades.css`: `.contenedor` `.pila` `.fila` `.fila-entre`
`.centrado` `.oculto` `.texto-suave` `.solo-lectores` `.franja-ajedrez`

### Los helpers de JS que ya existen

```js
PUMM.UI.$("#id")                    // buscar un elemento
PUMM.UI.$$(".clase")                // buscar varios
PUMM.UI.leerParametro("mision")     // leer la URL
PUMM.UI.abrirModal({ ... })         // abrir un modal
PUMM.UI.formatearHora(iso)          // "2026-08-10T14:32:00Z" → "14:32"
PUMM.UI.exigirRegistro()            // redirigir si todavía no tiene pasaporte

PUMM.Datos.activar(codigo)          // ⚠️ nombre viejo, ver abajo
PUMM.Datos.registrarMision(id)      // "ok" | "repetida" | "desconocida"
PUMM.Datos.obtenerProgreso()        // { hechas, meta, porcentaje, completo }
PUMM.Datos.obtenerRegistros()       // las misiones registradas
PUMM.Datos.obtenerInsignias()       // todas, con .desbloqueada
PUMM.Datos.cerrarSesion()           // borrar todo (útil para probar)
```

⚠️ `js/datos.js` todavía habla de "activar" (`activar()`, `estaActivado()`,
`CLAVE_CODIGO`, `FORMATO_CODIGO`) porque venía de la pantalla de activación.
No lo renombramos todavía a propósito: el nombre correcto depende de qué pide
el registro, y eso es una decisión de producto que falta. Cuando esté, el
cambio es barato justamente por esa capa — se tocan esas funciones y nada más.
La nota completa está arriba de `js/datos.js`.

Para probar, los códigos de acreditación de desarrollo son `PUMM-2026-A1` y
`PUMM-2026-B2` (están en `data/participantes.js`). Cualquier otro tiene que
disparar el modal de código inválido.

---

## Por qué está armado así

### `css/main.css` es el único CSS que se linkea

Cada HTML tiene una sola línea:

```html
<link rel="stylesheet" href="../css/main.css">
```

y ese archivo hace `@import` de todo lo demás, en un orden que importa:
`base/`, después `componentes/`, al final `paginas/`. En CSS, cuando dos
reglas compiten gana la última — así una regla de página puede ajustar un
componente sin peleas de `!important`.

*El costo:* `@import` encadena pedidos y carga un poco más lento que un archivo
único. Con este tamaño no se nota. Si algún día pesa, se concatenan todos en un
solo `main.css` antes de entregar.

### `js/datos.js` es la única puerta a la información

Ninguna pantalla lee ni escribe `localStorage` directamente. Todo pasa por las
funciones de `datos.js`.

Esto existe por uno de los principios que ya acordamos: **el progreso vive en
la base de datos y no en el dispositivo**, para que si una participante cambia
de celular su recorrido la siga. Hoy no hay backend, así que guardamos en el
navegador, pero cuando exista se reescriben solo las funciones de ese archivo
y las pantallas no se tocan.

Si en cambio cada pantalla llamara a `localStorage` por su cuenta, migrar
significaría revisar todos los archivos de `js/paginas/` buscando cada lugar —
y siempre queda uno.

### `data/` son archivos `.js`, no `.json`

Esta es la que más rara se ve y tiene la mejor razón.

Lo natural sería `misiones.json` y leerlo con `fetch()`. **No funciona en
este proyecto:** cuando abrís un archivo con doble clic, la URL es `file:///…`
y el navegador bloquea `fetch()` por seguridad. Tira un error rojo sobre CORS
y la lista queda vacía. Es el bug clásico de este tipo de proyecto y se pierden
horas antes de entender que el código estaba bien.

Un `.js` cargado con `<script>` no tiene esa restricción: anda con doble clic,
con Live Server y subido a WordPress. Cada archivo de `data/` cuelga sus datos
de `window.PUMM`, el único objeto global de toda la app.

### El `index.html` de la raíz

Existe porque los servidores web (y WordPress) buscan un `index.html` en la
raíz: sin él, quien entre al link ve un listado de archivos o un 404.

Ya solo redirige a `html/index.html`, la pantalla de registro. No hay que
tocarlo más.

Redirige en vez de ser la bienvenida para que las ocho pantallas vivan todas en
`html/` y escriban exactamente las mismas rutas. Si la bienvenida estuviera en
la raíz, esa página usaría `css/main.css` y las otras siete `../css/main.css`,
y esa mezcla es la causa número uno de "a mí me anda y a vos no".

### Nomenclatura BEM en el CSS

```css
.tarjeta            /* el bloque */
.tarjeta__titulo    /* una parte del bloque */
.tarjeta--hecha     /* una variante del bloque */
```

Leyendo el nombre de una clase en el HTML sabés en qué archivo CSS está y hasta
dónde llega su efecto. Sin una convención, en dos semanas hay tres clases
`.titulo` peleándose entre sí.

---

## Reglas del equipo

**Rutas — nunca empieces una ruta con `/`.**

```html
✅ ../css/main.css     (desde html/)
✅ css/main.css        (desde la raíz — solo el index.html de afuera)
❌ /css/main.css       ← se rompe al subirlo a una subcarpeta
```

Una ruta con barra inicial busca desde la raíz del dominio. En tu compu
"funciona", pero si el proyecto termina en `chicasentecnologia.org/pumm/`,
`/css/main.css` va a buscar `chicasentecnologia.org/css/main.css` y no
encuentra nada.

**Dónde va cada cosa.**

| Si estás por escribir… | Va en |
|---|---|
| Un color, un tamaño, un espacio | `css/base/variables.css` |
| Un estilo que se usa en 2+ pantallas | `css/componentes/` |
| Un estilo de una sola pantalla | `css/paginas/` |
| Un mensaje que lee una participante | `data/textos.js` |
| Una función que necesitás en 2+ pantallas | `js/ui.js` |
| Algo que lee o guarda información | `js/datos.js` |
| Una URL o constante que cambia entre dev y prod | `js/config.js` |

**Orden de los `<script>`.** Está comentado en `html/_plantilla.html` y es el
mismo en todas las pantallas. Si lo cambiás, rompe: `datos.js` necesita que
`config.js` ya haya corrido.

**Comentarios.** El código de este proyecto explica *por qué*, no *qué*.
`// suma uno al contador` no aporta; `// dvh y no vh porque en iOS la barra del
navegador corta la pantalla` sí. Mantengamos ese criterio.

---

## Lo que sabemos que duele

Cosas que ya sabemos que no están bien resueltas. Están acá para que nadie
pierda tiempo "descubriéndolas" y para decidirlas a conciencia, no por olvido.

**La navegación va a quedar duplicada en varios HTML.**
Sin herramientas de compilación no hay forma de compartir un pedazo de HTML.
Las opciones eran aceptar la duplicación o inyectar la nav con JavaScript.
Elegimos duplicar: así la pantalla se ve completa apenas carga, sin parpadeo, y
el HTML sigue siendo legible tal cual está. Son 12 líneas que casi no van a
cambiar, y están marcadas con un `⚠️` en la plantilla. **Si cambiás una,
cambialas todas.**

**El panel organizador va a necesitar control de acceso.**
Cuando se construya, no alcanza con esconder el link: tiene que resolverse en
el servidor. Cualquier cosa que hagamos en JavaScript se saltea abriendo la
consola del navegador.

**`js/ui.js` arma HTML con concatenación de strings.**
Es lo más simple sin frameworks, pero si algún día un dato viene del backend en
vez de estar escrito por nosotras, hay que escaparlo antes de meterlo en
`innerHTML`. Hoy todos los datos son nuestros, así que no hay riesgo; queda
anotado para cuando eso cambie.

---

## Hipótesis todavía sin validar

Están pendientes de producto y **afectan al código**. Cada una está marcada con
un comentario `⚠️` en el archivo donde impacta, así cuando se confirmen sabemos
exactamente qué tocar.

| Hipótesis | Dónde impacta |
|---|---|
| **Qué datos pide el registro** ahora que no hay activación | `js/datos.js` → `activar()` / `estaActivado()`, `js/config.js` → `FORMATO_CODIGO`, `data/textos.js` |
| Cada participante recibe un código único en la acreditación | `js/config.js` → `FORMATO_CODIGO` |
| Salesforce puede exportar los registros confirmados | La exportación del panel organizador |
| Hay conectividad suficiente en todas las zonas | Todo el flujo de registro por QR |
| Cada espacio puede exhibir un QR visible | Todo el flujo de registro por QR |
| Cuántas misiones hacen falta para completar el recorrido | `data/misiones.js` → `MISIONES_PARA_COMPLETAR` |

Sobre los QR: la app **no escanea**. Cada espacio tiene impreso un QR que
apunta a `…/html/nueva-mision.html?mision=labs`, y lo lee la cámara nativa del
celular (iOS y Android leen QR de fábrica hace años). Nos ahorramos una
librería, el permiso de cámara y bastante peso — que es justo lo que
necesitamos con presupuesto cero.

---

## Persistencia: Google Sheets + Apps Script

Los registros se guardan en una planilla de Google mediante Google Apps Script
(reemplaza al plugin de WordPress, que no guardaba). El flujo:

- Se desarrolla con la **fuente modular** de siempre (Live Server), con las
  pantallas como **archivos separados** (`html/index.html`, `html/pasaporte.html`)
  que navegan entre sí.
- Para publicar, el build **une todo en un solo `Index.html`**: `node
  scripts/empaquetar.js` genera `dist/Index.html`, donde cada pantalla pasa a ser
  una vista que se muestra/oculta (Apps Script sirve un solo archivo), con el CSS,
  el JS y los assets embebidos en base64. La navegación la abstrae
  `UI.mostrarPantalla`: navega en local, cambia de vista en el bundle.
- Ese archivo se pega en un proyecto de Apps Script ligado a la planilla (`doGet`
  lo sirve). El registro pide **email, nombre y DNI** y llama a
  `google.script.run.registrarParticipante(...)`; la identidad es el **DNI** (no se
  duplica).
- `js/datos.js` detecta solo si corre dentro de Apps Script; en local sigue usando
  localStorage (modo demo). El mismo bundle anda en los dos lados.

Paso a paso completo (crear la planilla, pegar el código, publicar) y el servidor
están en **`scripts/apps-script/`** (`google-apps-script.md` y `Codigo.gs`).

Carpetas nuevas: `scripts/` (build + `apps-script/` con el servidor y su
instructivo) y `dist/` (los HTML empaquetados, generados).

---

## Cómo entregamos

Según lo que pidió la organización:

1. **Jueves de cada semana:** mostramos los avances en VS Code.
2. **Cuando toque publicar:** se empaqueta con `node scripts/empaquetar.js` y se
   sube el `Index.html` a Apps Script (ver `scripts/apps-script/google-apps-script.md`).
   La fuente modular sigue yendo a Drive como respaldo.
3. **Nacho** coordina el enlace en la web de CET.

Antes de subir a Drive, chequear:

- [ ] Ninguna ruta empieza con `/`
- [ ] `js/config.js` tiene el `MODO` que corresponde
- [ ] No hay `console.log` de prueba dando vueltas
- [ ] No hay datos reales de participantes en `data/participantes.js`
- [ ] Se probó en un celular de verdad, no solo achicando la ventana

El último es el que más se saltea y el que más duele: el evento se vive con el
teléfono en la mano, parada, con una sola mano libre y a veces con sol de
frente.
