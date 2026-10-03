/* ============================================================
   DATOS · MISIONES del recorrido PUMM
   ------------------------------------------------------------
   Las MISIONES son los 7 objetivos que la participante completa
   durante el evento escaneando QRs. SÍ cuentan para el progreso
   (X/7 en el pasaporte) y para desbloquear logros (data/logros.js).

   No confundir con las ACTIVIDADES (data/actividades.js): esas son
   el cronograma informativo del evento. Una misión se puede
   completar en una o varias actividades (ej. "Participar de un lab"
   se completa en cualquiera de los Labs).

   El `id` es la clave EXACTA que viaja en el QR (?mision=id) y que
   el JS envía al servidor; no se cambia una vez impresos los QR.
   El `nombre` es lo que ve la participante en la checklist del
   pasaporte; el `icono` (emoji) la acompaña.

   ⚠️ POR QUÉ ESTO ES .js Y NO .json: un archivo abierto con doble
   clic corre en file:// y ahí fetch() se bloquea por CORS. Un .js
   cargado con <script> no tiene esa restricción. Ver el detalle
   completo en el historial de este archivo.
   ============================================================ */

window.PUMM = window.PUMM || {};

/* Las 7 misiones del recorrido. */
window.PUMM.MISIONES = [
  { id: "lab",        nombre: "Participar de un lab",                        icono: "🔬" },
  { id: "feria",       nombre: "Visitar la Feria de Proyectos",              icono: "🚀" },
  { id: "sala-escape", nombre: "Pasar por la sala de escape",                icono: "🔐" },
  { id: "photo",       nombre: "Sacarse una foto en el Photo Opportunity",   icono: "📸" },
  { id: "juego",       nombre: "Participar de un juego",                      icono: "🎮" },
  { id: "historica",   nombre: "Interactuar con una mujer histórica en STEM", icono: "👩‍🔬" },
  { id: "pitch",       nombre: "Grabar el pitch de tu proyecto",             icono: "🎯" }
];

/* Cuántas misiones hacen falta para completar el recorrido: todas.
   Está acá (y no repartido por el código) para tocar una sola línea. */
window.PUMM.MISIONES_PARA_COMPLETAR = window.PUMM.MISIONES.length;
