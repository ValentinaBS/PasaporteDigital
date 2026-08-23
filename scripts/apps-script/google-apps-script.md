# Publicar el Pasaporte con Google Sheets + Apps Script

Guía para conectar el registro a una planilla de Google y publicarlo como
página web, sin WordPress ni servidores propios. Es el reemplazo de Fluent
Forms (que notificaba pero no guardaba).

## Cómo funciona (en dos líneas)

- **Google Apps Script** sirve un único `Index.html` (nuestra pantalla) y expone
  funciones de servidor.
- El registro llama a `google.script.run.registrarParticipante(...)` y esa función
  **escribe una fila en la planilla**. La identidad es el **DNI** (no se duplica).

Durante el desarrollo seguimos usando la carpeta modular con Live Server. Para
publicar, se **empaqueta** todo en un solo archivo (paso 1) y se pega en Apps
Script (paso 4).

---

## 1. Unificar y empaquetar

En desarrollo, registro y pasaporte son **dos páginas separadas**
(`html/index.html` y `html/pasaporte.html`) que navegan entre sí. Para publicar,
el build las **une en un solo `Index.html`** (Apps Script sirve un solo archivo),
donde cada pantalla pasa a ser una vista que se muestra/oculta. En la carpeta del
proyecto, corré:

```bash
node scripts/empaquetar.js
```

Genera `dist/Index.html`: un solo archivo con las dos pantallas, el CSS, el JS y
las imágenes/fuentes embebidas (base64). Es lo que se pega en Apps Script.

> Cada vez que cambies el CSS/JS/HTML de la fuente, volvé a correr esto y
> re-pegá el archivo (paso 4).

---

## 2. Crear la planilla de Google

1. Entrá a [sheets.new](https://sheets.new) (o Drive → Nuevo → Hoja de cálculo).
2. Ponele un nombre, por ejemplo **PUMM 2026 - Registros**.
3. La planilla lleva **dos hojas** (pestañas de abajo). Renombrá la primera como
   **`participantes`** y creá una segunda (botón **+**) llamada
   **`historial_misiones`**.
4. Escribí los encabezados en la fila 1 de cada hoja:

   **`participantes`** — una fila por participante:

   | A | B | C | D | E |
   |---|---|---|---|---|
   | nombre | dni | fecha_hora_registro | numero_misiones_completadas | nombres_misiones_completadas |

   **`historial_misiones`** — una fila por misión completada (log):

   | A | B | C | D |
   |---|---|---|---|
   | nombre | dni | mision_completada | fecha_hora |

> Si te olvidás de crear una hoja o sus encabezados, el código los crea solos la
> primera vez. Igual conviene dejarlos prolijos.
>
> Hoy el registro escribe en **`participantes`** (arranca con 0 misiones). La
> hoja **`historial_misiones`** y el contador se llenan con `procesarSello`,
> cuando se arme el flujo de misiones (el código ya está listo).

---

## 3. Abrir el editor de Apps Script

1. En la planilla: menú **Extensiones → Apps Script**.
2. Se abre un proyecto **ligado a esa planilla** (importante: así el código
   escribe en ESA planilla sin configurar nada).

---

## 4. Pegar el código y el HTML

**a) El servidor (`Codigo.gs`)**
1. En el editor, en el archivo `Código.gs` (o `Code.gs`) que ya viene, borrá lo
   que tenga.
2. Pegá el contenido de **`scripts/apps-script/Codigo.gs`** de este proyecto.

**b) La página (`Index`)**
1. Arriba a la izquierda, **+ → HTML**.
2. Nombralo exactamente **`Index`** (Apps Script le agrega `.html` solo; el
   código busca ese nombre).
3. Borrá el contenido de ejemplo y pegá **todo** el contenido de `dist/Index.html`.
4. Guardá todo (💾 o `Ctrl/Cmd + S`).

---

## 5. Publicar como aplicación web

1. Botón **Implementar → Nueva implementación**.
2. Tipo (engranaje ⚙️) → **Aplicación web**.
3. Configurá:
   - **Ejecutar como:** Yo (tu cuenta).
   - **Quién tiene acceso:** Cualquier persona *(así las participantes entran sin
     iniciar sesión de Google)*.
4. **Implementar**. La primera vez pide **autorizar permisos** → aceptá (es tu
   propia cuenta escribiendo en tu planilla).
5. Copiá la **URL de la aplicación web**. Ese es el link del registro (el que va
   en el QR / se comparte).

---

## 6. Probar

1. Abrí la URL en el celular o en el navegador.
2. Registrate con un nombre y un DNI de 8 dígitos.
3. Deberías ver el modal **"¡Registro exitoso!"** → **Continuar** lo cierra y la
   misma página pasa a mostrar la vista de pasaporte con tu nombre.
4. En la planilla, en la hoja **Participantes**, tiene que aparecer la fila con
   nombre, dni y fecha. ✅
5. Volvé a abrir la URL: como ya hay sesión guardada, arranca directo en la vista
   de pasaporte (no vuelve a pedir el registro).
6. Registrá el **mismo DNI** otra vez (desde otro dispositivo o borrando los
   datos del navegador): **no** se duplica la fila (idempotente por DNI).

---

## Actualizar la página más adelante

1. Cambiás la fuente modular y probás con Live Server.
2. `node scripts/empaquetar.js`.
3. Re-pegás `dist/Index.html` en el archivo `Index` de Apps Script.
4. **Implementar → Administrar implementaciones → (editar ✏️) → Nueva versión**.
   *(Si creás una implementación nueva cada vez, cambia la URL; usá "nueva
   versión" de la misma implementación para mantener el mismo link.)*

---

## Notas

- **Contrato cliente ↔ servidor** (por si tocás el código):
  - Registro: el cliente llama `registrarParticipante({ nombre, dni })`; el
    servidor devuelve `{ status: "success" }` o `{ status: "error", message }`.
  - Misión (futuro): `procesarSello({ dni, mision })` devuelve
    `{ status: "success" | "repetida", numeroMisiones }` o `{ status: "error", message }`.
  - `js/datos.js` detecta solo si está en Apps Script (`google.script.run`); en
    local usa localStorage. El mismo bundle sirve en los dos lados.
- **Dos páginas en dev, una en producción:** en local, registro y pasaporte son
  archivos separados que navegan entre sí; el build los une en un solo
  `Index.html` donde son vistas que se muestran/ocultan. Lo maneja
  `UI.mostrarPantalla`, que navega en local y cambia de vista en el bundle. No
  hay `?page=` ni templating. Para sumar una pantalla: creá su `html/x.html` y su
  `js/paginas/x.js`, y agregala a la lista `PAGINAS` en `scripts/empaquetar.js`.
- **`procesarSello`** ya está implementada en `Codigo.gs` (escribe en
  `historial_misiones` y actualiza el contador en `participantes`), lista para
  cuando se arme el flujo de misiones en el cliente; hoy todavía no se llama.
- **Privacidad:** la planilla tiene DNI de participantes. Compartila
  solo con quien corresponda del equipo y no la hagas pública.
