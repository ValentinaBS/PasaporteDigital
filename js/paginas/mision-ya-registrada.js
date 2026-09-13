(function () {
    "use strict";

    var UI = window.PUMM.UI;
    var Datos = window.PUMM.Datos;

    function obtenerMisiones() {
        return window.PUMM && window.PUMM.MISIONES ? window.PUMM.MISIONES : [];
    }

    function obtenerIdMisionAmostrar() {
        var idParam = UI && typeof UI.leerParametro === "function"
            ? UI.leerParametro("mision")
            : new URLSearchParams(window.location.search).get("mision");

        if (idParam)
            return idParam;

        var registros = Datos.obtenerRegistros();
        if (registros && registros.length > 0) {
            var ultimoRegistro = registros[registros.length - 1];
            return ultimoRegistro.misionId;
        }

        var misiones = obtenerMisiones();
        return misiones.length > 0 ? misiones[0].id : null;
    }

    function pintar() {
        var misiones = obtenerMisiones();
        var idMisionTarget = obtenerIdMisionAmostrar();

        var misionActual = misiones.find(function (m) {
            return m.slug === idMisionTarget || m.id === idMisionTarget;
        });

        var elNombreMision = UI ? UI.$(".actividad__mision-nombre") : document.querySelector(".actividad__mision-nombre");
        if (elNombreMision && misionActual) {
            elNombreMision.textContent = misionActual.nombre;
        }

        var progreso = Datos.obtenerProgreso();
        var totalMisiones = misiones.length > 0 ? misiones.length : progreso.meta;

        var elNivelValor = UI ? UI.$(".actividad__nivel-valor") : document.querySelector(".actividad__nivel-valor");
        var elXpBadge = UI ? UI.$(".actividad__xp-badge") : document.querySelector(".actividad__xp-badge");
        var elBarraRelleno = UI ? UI.$(".actividad__barra-relleno") : document.querySelector(".actividad__barra-relleno");

        if (elNivelValor)
            elNivelValor.textContent = "Nivel " + progreso.hechas;

        if (elXpBadge)
            elXpBadge.textContent = progreso.hechas + "/" + totalMisiones + " XP";

        if (elBarraRelleno) {
            var porcentajeBarra = totalMisiones > 0
                ? Math.min(100, Math.round((progreso.hechas / totalMisiones) * 100))
                : progreso.porcentaje;

            elBarraRelleno.style.width = porcentajeBarra + "%";
        }

        var btnVolver = UI ? UI.$("#btn-volver") : document.getElementById("btn-volver");
        if (btnVolver) {
            btnVolver.addEventListener("click", function () {
                UI.mostrarPantalla("pasaporte");
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (UI && typeof UI.exigirRegistro === "function") {
            if (!UI.exigirRegistro()) return;
        }
        pintar();
    });
})();