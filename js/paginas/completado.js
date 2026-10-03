/* ============================================================
   PÁGINA · COMPLETADO (Felicitaciones)
   ------------------------------------------------------------
   Pantalla de felicitaciones. Botones:
     · "Completar encuesta": link común al formulario externo (se
       abre en otra pestaña, ver completado.html). No necesita JS.
     · "Volver al inicio": vuelve al pasaporte.

   Funciona en los dos modos (ver js/ui.js → mostrarPantalla):
     · BUNDLE: el router llama initCompletado al mostrar la vista.
     · LOCAL:  se inicializa sola en el DOMContentLoaded de abajo.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;

  /* Cablear una sola vez, aunque la vista se muestre de nuevo. */
  var cableado = false;

  function inicializarEventos() {
    if (cableado) return;
    cableado = true;

    var btnInicio = UI.$("#btn-inicio");
    if (btnInicio) {
      btnInicio.addEventListener("click", function () {
        UI.mostrarPantalla("pasaporte");
      });
    }
  }

  function initCompletado() {
    if (Datos && typeof Datos.obtenerProgreso === "function") {
      var progreso = Datos.obtenerProgreso();
      if (!progreso.completo) {
        console.info("[PUMM] La participante aún no completó la meta total.");
      }
    }
    inicializarEventos();
  }

  /* BUNDLE: el router corre initCompletado al mostrar la vista. */
  UI.alMostrar("completado", initCompletado);

  /* LOCAL: se inicializa sola; en el bundle manda el router. */
  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("[data-vista]")) return;
    if (UI && typeof UI.exigirRegistro === "function") {
      if (!UI.exigirRegistro()) return;
    }
    initCompletado();
  });
})();
