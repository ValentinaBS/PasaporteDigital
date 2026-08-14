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

window.PUMM.MISIONES = [
  {
    id: "labs",                          // Va en el QR. No cambiar una vez impreso.
    nombre: "PUMM Labs",
    espacio: "Salón principal",
    descripcion: "Probá herramientas y armá tu primer prototipo.",
    icono: "💻",
    insignia: "creadora"                 // id de data/insignias.js
  },
  {
    id: "coworks",
    nombre: "Coworks",
    espacio: "Patio central",
    descripcion: "Trabajá tu idea junto a otras chicas.",
    icono: "🤝",
    insignia: "equipo"
  },
  {
    id: "hackaton",
    nombre: "Hackatón",
    espacio: "Auditorio",
    descripcion: "Resolvé un desafío real contra reloj.",
    icono: "⚡",
    insignia: "desafio"
  },
  {
    id: "curiosa",
    nombre: "Zona Curiosa",
    espacio: "Hall de entrada",
    descripcion: "Charlas cortas de mujeres que ya están en tecnología.",
    icono: "🎧",
    insignia: "curiosa"
  },
  {
    id: "desafios",
    nombre: "Desafíos",
    espacio: "Sala 2",
    descripcion: "Retos rápidos para ganar insignias extra.",
    icono: "🎯",
    insignia: null
  },
  {
    id: "comunidad",
    nombre: "Comunidad y diversión",
    espacio: "Terraza",
    descripcion: "Conocé a la comunidad de Chicas en Tecnología.",
    icono: "💜",
    insignia: "comunidad"
  }
];

/* Cuántas misiones hacen falta para completar el recorrido.
   ⚠️ HIPÓTESIS SIN VALIDAR: el número definitivo lo define
   Producción. Está acá y no repartido por el código para que
   cambiarlo sea tocar una sola línea. */
window.PUMM.MISIONES_PARA_COMPLETAR = window.PUMM.MISIONES.length;
