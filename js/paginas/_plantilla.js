/* ============================================================
   PLANTILLA DE LÓGICA DE PANTALLA  ·  copiar, no editar
   ------------------------------------------------------------
   Molde para el JS de una pantalla. Copialo, renombralo con el
   mismo nombre que tu .html (pasaporte.html → pasaporte.js) y
   enlazalo desde el <script> del final de tu HTML.

   REGLA: en este archivo va SOLO lo que pasa en esta pantalla.
     · ¿Lo vas a necesitar en otra pantalla?  → js/ui.js
     · ¿Lee o guarda información?             → js/datos.js
     · ¿Es un texto que lee una participante? → data/textos.js
     · ¿Es una URL o constante de entorno?    → js/config.js
   ============================================================ */

(function () {
  /* El IIFE — esa función que se define y se ejecuta sola con los
     paréntesis del final — encierra todas las variables de este
     archivo. Sin él, cada "var" quedaría global y dos pantallas
     que usen el mismo nombre se pisarían entre sí. */
  "use strict";

  /* Atajos a los módulos compartidos. */
  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;
  var TEXTOS = window.PUMM.TEXTOS;

  /* --- Funciones de la pantalla ---
     Una función por cosa que hace. Nombres que digan qué hacen:
     pintarMisiones(), no init2(). */

  function pintar() {
    // ✏️ Tu código acá.
    //
    // Buscar un elemento:       var caja = UI.$("#mi-elemento");
    // Buscar varios:            UI.$$(".tarjeta")
    // Leer la URL:              UI.leerParametro("mision")
    // Abrir un modal:           UI.abrirModal({ tipo: "exito",
    //                             icono: "✅", titulo: "...", texto: "..." })
    // Progreso:                 Datos.obtenerProgreso()
    // Registros:                Datos.obtenerRegistros()
    // Insignias:                Datos.obtenerInsignias()
  }

  /* DOMContentLoaded espera a que el HTML esté armado. Sin esto,
     los querySelector corren antes de que existan los elementos
     y devuelven null. Todo arranca acá adentro. */
  document.addEventListener("DOMContentLoaded", function () {

    /* Manda a la pantalla de registro a quien todavía no tenga
       pasaporte. Sacalo en las pantallas públicas: el registro
       mismo (si no, entra en un bucle consigo mismo) y la ayuda.
       Es comodidad de UX, no seguridad: la validación de verdad
       tiene que estar en el backend. */
    if (!UI.exigirRegistro()) return;

    pintar();
  });
})();
