(function () {
    "use strict";

    var UI = window.PUMM.UI;
    var Datos = window.PUMM.Datos;
    var TEXTOS = window.PUMM.TEXTOS;

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

    /* Pinta el progreso de misiones (X/8 + barra) con el MISMO dato que
       el pasaporte (Datos.obtenerProgreso), así las dos pantallas
       muestran exactamente lo mismo. */
    function pintarProgreso() {
        var p = Datos.obtenerProgreso();

        var elValor = UI ? UI.$(".actividad__nivel-valor") : document.querySelector(".actividad__nivel-valor");
        var elBadge = UI ? UI.$(".actividad__xp-badge") : document.querySelector(".actividad__xp-badge");
        var elBarraRelleno = UI ? UI.$(".actividad__barra-relleno") : document.querySelector(".actividad__barra-relleno");

        if (elValor)
            elValor.textContent = p.hechas + "/" + p.meta;

        if (elBadge)
            elBadge.textContent = "MISIONES";

        if (elBarraRelleno)
            elBarraRelleno.style.width = p.porcentaje + "%";
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

        var btnVolver = UI ? UI.$("#btn-volver") : document.getElementById("btn-volver");
        /* dataset como guardia: cablea el botón una sola vez aunque la
           vista se muestre de nuevo en el bundle. */
        if (btnVolver && !btnVolver.dataset.cableado) {
            btnVolver.dataset.cableado = "1";
            btnVolver.addEventListener("click", function () {
                UI.mostrarPantalla("pasaporte");
            });
        }

        /* Igual que el pasaporte: primero sincronizamos el conteo con la
           planilla (en Apps Script) y recién ahí pintamos el progreso. En
           local resuelve al instante con el conteo de localStorage. */
        UI.conCarga(Datos.sincronizarProgreso(), TEXTOS.cargandoPasaporte).then(pintarProgreso);
    }

    /* BUNDLE: el router corre pintar al mostrar la vista. */
    UI.alMostrar("mision-ya-registrada", pintar);

    /* LOCAL: se inicializa sola; en el bundle manda el router. */
    document.addEventListener("DOMContentLoaded", function () {
        if (document.querySelector("[data-vista]")) return;
        if (UI && typeof UI.exigirRegistro === "function") {
            if (!UI.exigirRegistro()) return;
        }
        pintar();
    });
})();