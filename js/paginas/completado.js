(function () {
    "use strict";

    var UI = window.PUMM.UI;
    var Datos = window.PUMM.Datos;

    function inicializarEventos() {
        var btnInicio = UI ? UI.$("#btn-inicio") : document.getElementById("btn-inicio");
        if (btnInicio) {
            btnInicio.addEventListener("click", function () {
                UI.mostrarPantalla("pasaporte");
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (UI && typeof UI.exigirRegistro === "function")
            if (!UI.exigirRegistro()) return;

        if (Datos && typeof Datos.obtenerProgreso === "function") {
            var progreso = Datos.obtenerProgreso();
            if (!progreso.completo)
                console.info("[PUMM] La participante aún no completó la meta total.");
        }

        inicializarEventos();
    });
})();