/* ============================================================
   PANTALLA · PASAPORTE (dummy de verificación)
   ------------------------------------------------------------
   Muestra el nombre guardado en el registro. Sirve para
   comprobar que la persistencia (localStorage y, en Apps Script,
   Google Sheets) quedó bien guardada.

   No decide por su cuenta si mostrarse: registra su inicializador
   con UI.alMostrar("pasaporte", ...). El router de js/app.js
   decide (según haya sesión) y, si no la hay, manda al registro.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;
  var TEXTOS = window.PUMM.TEXTOS;

  function initPasaporte() {
    var participante = Datos.obtenerParticipante();

    /* Defensa: si llegara sin sesión, al registro. */
    if (!participante || !participante.nombre) {
      UI.mostrarPantalla("index");
      return;
    }

    /* textContent (no innerHTML): el nombre lo escribió la usuaria,
       así evitamos inyección de HTML. */
    UI.$("#pasaporte-saludo").textContent =
      TEXTOS.pasaporteSaludo + ", " + participante.nombre + "! 💜";
    UI.$("#pasaporte-bienvenida").textContent = TEXTOS.pasaporteBienvenida;
    UI.$("#pasaporte-dni").textContent = "DNI: " + participante.dni;
  }

  UI.alMostrar("pasaporte", initPasaporte);
})();
