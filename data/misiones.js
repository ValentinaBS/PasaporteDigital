/* ============================================================
   DATOS · MISIONES del recorrido PUMM
   ------------------------------------------------------------
   ⚠️ POR QUÉ ESTO ES .js Y NO .json

   Lo natural sería un misiones.json y leerlo con fetch().
   No funciona en este proyecto: cuando abrís un archivo con
   doble clic, la URL es file:///... y el navegador bloquea
   fetch() por seguridad (CORS). Te tira un error rojo en la
   consola y la lista queda vacía. Es EL bug clásico de este
   tipo de proyecto y cuesta media tarde entender por qué.

   Un .js cargado con <script> no tiene esa restricción: anda
   con doble clic, con Live Server y subido a WordPress.
   Contra: hay que cargarlo con un <script> antes que el resto.
   Vale la pena.

   ⚠️ ESTOS DATOS SON DE DESARROLLO. Los reales los define
   Producción. Mientras tanto sirven para maquetar y probar.
   ============================================================ */

/* window.PUMM es el único objeto global de toda la app.
   Todo cuelga de ahí para no ensuciar el espacio global ni
   pisarnos entre archivos. La línea de abajo lo crea si no
   existe todavía, y lo reutiliza si ya lo creó otro archivo. */
window.PUMM = window.PUMM || {};

/* Las 10 misiones del recorrido. El `id` (slug) es la clave EXACTA
   que viaja en el QR (?mision=slug) y que el JS envía al servidor;
   no se cambia una vez impresos los QR. Los nombres son los que ve la
   participante.

   Los logros ya no se mapean misión por misión: se desbloquean por
   cantidad de misiones registradas (ver data/logros.js), así que acá
   no hace falta ningún campo extra. */
window.PUMM.MISIONES = [
  { id: "robotica",      nombre: "Taller de Robótica",       icono: "🤖" },
  { id: "vr",            nombre: "Lab de Realidad Virtual",  icono: "🥽" },
  { id: "programacion",  nombre: "Programación Web",         icono: "💻" },
  { id: "diseno-ux",     nombre: "Diseño UX/UI",             icono: "🎨" },
  { id: "ciencia-datos", nombre: "Análisis de Datos",        icono: "📊" },
  { id: "ciberseguridad",nombre: "Ciberseguridad",           icono: "🛡️" },
  { id: "biotecnologia", nombre: "Biotecnología",            icono: "🧬" },
  { id: "videojuegos",   nombre: "Zona Gamer",               icono: "🎮" },
  { id: "ia",            nombre: "Lab de IA",                icono: "✨" },
  { id: "redes",         nombre: "Infraestructura y Redes",  icono: "🌐" }
];

/* Cuántas misiones hacen falta para completar el recorrido.
   ⚠️ HIPÓTESIS SIN VALIDAR: el número definitivo lo define
   Producción. Está acá y no repartido por el código para que
   cambiarlo sea tocar una sola línea. */
window.PUMM.MISIONES_PARA_COMPLETAR = window.PUMM.MISIONES.length;
