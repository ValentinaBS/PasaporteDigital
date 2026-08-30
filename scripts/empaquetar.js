/* ============================================================
   BUILD · Unificar el proyecto en un solo HTML autocontenido
   ------------------------------------------------------------
   En desarrollo el proyecto son varias pantallas (html/index.html,
   html/pasaporte.html) con archivos de CSS y JS separados. Google
   Apps Script, en cambio, sirve UN solo archivo. Este script une
   todo en uno:

     · Cada pantalla pasa a ser una vista <div data-vista="..."> que
       se muestra/oculta (en local siguen siendo páginas separadas;
       ver js/ui.js → mostrarPantalla).
     · Todo el CSS queda embebido en un <style>.
     · Todo el JS queda embebido en <script> (incluye la lógica de
       TODAS las pantallas).
     · Las imágenes, íconos y fuentes quedan en base64 (data URI).

   Así se desarrolla cómodo con archivos separados y Live Server, y
   para publicar en Apps Script se corre esto y se pega el resultado.

   USO:
     node scripts/empaquetar.js            → une PAGINAS en dist/Index.html
     node scripts/empaquetar.js a.html s.html → empaqueta una sola página

   Requisitos: Node (ya está instalado). Sin dependencias externas.
   ============================================================ */

"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");

/* Pantallas que se combinan en el bundle. La PRIMERA es la que
   arranca visible; su HTML es el "molde" (head, scripts, modal).
   Para sumar una pantalla nueva: agregala acá y creá su html/JS. */
var PAGINAS = [
  { archivo: "html/index.html", vista: "index" },
  { archivo: "html/pasaporte.html", vista: "pasaporte" }
];

/* Extensión → tipo MIME para los data URI. */
var MIME = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf"
};

function leer(archivo) {
  return fs.readFileSync(archivo, "utf8");
}

/* Inlina un CSS resolviendo sus @import en orden (recursivo).
   Primero saca los comentarios para no confundir los @import de
   EJEMPLO que viven en un comentario (como en main.css). */
function inlinarCss(archivoAbs) {
  var dir = path.dirname(archivoAbs);
  var css = leer(archivoAbs).replace(/\/\*[\s\S]*?\*\//g, "");

  var re = /@import\s+(?:url\(\s*)?["']([^"')]+)["']\s*\)?\s*;/g;
  return css.replace(re, function (_, ref) {
    return "\n" + inlinarCss(path.resolve(dir, ref));
  });
}

function aDataUri(assetAbs) {
  var ext = path.extname(assetAbs).toLowerCase();
  var mime = MIME[ext] || "application/octet-stream";
  var b64 = fs.readFileSync(assetAbs).toString("base64");
  return "data:" + mime + ";base64," + b64;
}

/* Devuelve el bloque <main>...</main> de un HTML. */
function extraerMain(html) {
  var m = html.match(/<main[\s\S]*?<\/main>/i);
  if (!m) throw new Error("No se encontró <main> en la página.");
  return m[0];
}

/* Toma un HTML ya armado (con sus <link>/<script src> y rutas ../)
   y devuelve el HTML autocontenido: CSS y JS inlineados, assets en
   base64, y <base target="_top"> asegurado. htmlDir es la carpeta
   desde la que resuelven las rutas relativas (siempre html/). */
function inlinarTodo(html, htmlDir) {
  /* <base target="_top">: Apps Script muestra la página en un iframe;
     sin esto la navegación se rompe. */
  if (!/<base\b/i.test(html)) {
    html = html.replace(/<head>/i, '<head>\n  <base target="_top">');
  }

  /* CSS: el <link rel=stylesheet> → un <style> con todo inlineado. */
  html = html.replace(
    /<link\b[^>]*rel=["']stylesheet["'][^>]*>/i,
    function (tag) {
      var m = tag.match(/href=["']([^"']+)["']/i);
      if (!m) return tag;
      return "<style>\n" + inlinarCss(path.resolve(htmlDir, m[1])) + "\n</style>";
    }
  );

  /* JS: cada <script src> → su contenido. Se escapa cualquier
     </script> del código por las dudas. */
  html = html.replace(
    /<script\s+src=["']([^"']+)["']\s*>\s*<\/script>/gi,
    function (_, src) {
      var js = leer(path.resolve(htmlDir, src)).replace(/<\/script>/gi, "<\\/script>");
      return "<script>\n" + js + "\n</script>";
    }
  );

  /* Assets: toda ruta ../assets/... o ../../assets/... → data URI.
     Un solo pase cubre CSS (url()), HTML (src/href) y strings del JS. */
  html = html.replace(/(?:\.\.\/)+assets\/[^"')\s]+/g, function (ruta) {
    var sub = ruta.slice(ruta.indexOf("assets/"));
    var assetAbs = path.join(ROOT, sub);
    if (!fs.existsSync(assetAbs)) {
      console.warn("  ⚠️ asset no encontrado, se deja la ruta:", sub);
      return ruta;
    }
    return aDataUri(assetAbs);
  });

  return html;
}

/* Une PAGINAS en un solo HTML con vistas. */
function construirCombinado() {
  var salidaRel = "dist/Index.html";
  var molde = PAGINAS[0];
  var htmlDir = path.dirname(path.join(ROOT, molde.archivo));

  /* El molde (primera página) aporta head, scripts y modal. */
  var shell = leer(path.join(ROOT, molde.archivo));

  /* Cada pantalla: su <main> envuelto en <div data-vista="clave">.
     La primera queda visible; el resto arrancan ocultas (el router
     de js/app.js corrige según la sesión). */
  var vistas = PAGINAS.map(function (p, i) {
    var main = extraerMain(leer(path.join(ROOT, p.archivo)));
    var clase = i === 0 ? "" : ' class="oculto"';
    return '<div data-vista="' + p.vista + '"' + clase + ">\n" + main + "\n</div>";
  }).join("\n");

  /* Reemplazamos el <main> del molde por todas las vistas. */
  shell = shell.replace(/<main[\s\S]*?<\/main>/i, vistas);

  /* Sumamos los <script> de página que no estén ya en el molde
     (el molde trae los de la primera pantalla; faltan los del resto). */
  var yaEstan = {};
  (shell.match(/<script\s+src=["']([^"']+)["']/gi) || []).forEach(function (s) {
    yaEstan[s.match(/src=["']([^"']+)["']/i)[1]] = true;
  });
  var extra = "";
  PAGINAS.slice(1).forEach(function (p) {
    var otra = leer(path.join(ROOT, p.archivo));
    (otra.match(/<script\s+src=["']([^"']+)["']/gi) || []).forEach(function (s) {
      var src = s.match(/src=["']([^"']+)["']/i)[1];
      if (!yaEstan[src]) {
        yaEstan[src] = true;
        extra += '  <script src="' + src + '"></script>\n';
      }
    });
  });
  if (extra) shell = shell.replace(/<\/body>/i, extra + "</body>");

  var html = inlinarTodo(shell, htmlDir);

  var salidaAbs = path.join(ROOT, salidaRel);
  fs.mkdirSync(path.dirname(salidaAbs), { recursive: true });
  fs.writeFileSync(salidaAbs, html, "utf8");

  var kb = Math.round(Buffer.byteLength(html, "utf8") / 1024);
  console.log("✓ Unificado en", salidaRel);
  console.log("  vistas:       ", PAGINAS.map(function (p) { return p.vista; }).join(", "));
  console.log("  tamaño final: ", kb, "KB");
}

/* Empaqueta UNA sola página (modo suelto, por si hace falta). */
function construirSimple(paginaRel, salidaRel) {
  var paginaAbs = path.join(ROOT, paginaRel);
  var html = inlinarTodo(leer(paginaAbs), path.dirname(paginaAbs));
  var salidaAbs = path.join(ROOT, salidaRel);
  fs.mkdirSync(path.dirname(salidaAbs), { recursive: true });
  fs.writeFileSync(salidaAbs, html, "utf8");
  console.log("✓ Empaquetado:", paginaRel, "→", salidaRel);
}

/* --- Arranque --- */
if (process.argv[2]) {
  construirSimple(process.argv[2], process.argv[3] || "dist/Index.html");
} else {
  construirCombinado();
}
