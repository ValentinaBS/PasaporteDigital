/* ============================================================
   PÁGINA · COMPLETADO (recorrido terminado)
   ------------------------------------------------------------
   Pantalla de felicitaciones. Botones: compartir el logro y
   volver al pasaporte.

   Funciona en los dos modos (ver js/ui.js → mostrarPantalla):
     · BUNDLE: el router llama initCompletado al mostrar la vista.
     · LOCAL:  se inicializa sola en el DOMContentLoaded de abajo.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;
  var TEXTOS = window.PUMM.TEXTOS;

  /* Cablear una sola vez, aunque la vista se muestre de nuevo. */
  var cableado = false;

  /* Compartir con la API nativa del celular; si no está disponible
     (o el navegador la rechaza), caemos a un modal informativo. */
  function compartir() {
    var datos = {
      title: "Pasaporte Digital · PUMM 2026",
      text: "¡Completé el recorrido del PUMM 2026! 💜",
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(datos).catch(function () { /* cancelado por la usuaria */ });
      return;
    }

    UI.abrirModal({
      tipo: "aviso",
      titulo: "¡Compartí tu logro!",
      texto: "Contá que completaste el recorrido del PUMM 2026 💜",
      acciones: [{ texto: TEXTOS.botonCerrar, cerrar: true }]
    });
  }

  function inicializarEventos() {
    if (cableado) return;
    cableado = true;

    var btnInicio = UI.$("#btn-inicio");
    if (btnInicio) {
      btnInicio.addEventListener("click", function () {
        UI.mostrarPantalla("pasaporte");
      });
    }

    var btnCompartir = UI.$("#btn-compartir");
    if (btnCompartir) {
      btnCompartir.addEventListener("click", compartir);
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
