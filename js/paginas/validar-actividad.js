(function () {
    "use strict";

    var UI = window.PUMM?.UI;
    var Datos = window.PUMM?.Datos;
    var TEXTOS = window.PUMM?.TEXTOS;

    var isChecked = false;

    function renderizarMision() {
        var slugMisionActual = UI?.leerParametro ? UI.leerParametro('mision') : new URLSearchParams(window.location.search).get('mision');

        var listaMisiones = window.PUMM?.MISIONES || [];
        var datosMisionSeleccionada = listaMisiones.find(function (mision) {
            return mision.id === slugMisionActual;
        }) || listaMisiones[0];

        var elementoTituloMision = UI?.$ ? UI.$('.actividad__mision-titulo') : document.querySelector('.actividad__mision-titulo');

        if (elementoTituloMision && datosMisionSeleccionada) {
            elementoTituloMision.textContent = datosMisionSeleccionada.nombre;
        }
    }

    function inicializarEventos() {
        var toggleBtn = UI?.$ ? UI.$('#toggle-btn') : document.getElementById('toggle-btn');
        var statusMessage = UI?.$ ? UI.$('#status-message') : document.getElementById('status-message');

        toggleBtn?.addEventListener('click', function () {
            isChecked = !isChecked;

            if (isChecked) {
                toggleBtn.style.background = "var(--color-secundario) url('../assets/iconos/pulgar-like.svg') no-repeat center / 70%";
                if (statusMessage) statusMessage.textContent = ' ';
            } else {
                toggleBtn.textContent = '';
                if (statusMessage) {
                    statusMessage.textContent = '¡No olvides marcar la misión!';
                    statusMessage.style.color = 'var(--color-error)';
                }
            }
        });

        var botonCompletarMision = UI?.$ ? UI.$('.boton--primario') : document.querySelector('.boton--primario');
        botonCompletarMision?.addEventListener('click', function () {
            if (UI && typeof UI.mostrarPantalla === 'function') {
                UI.mostrarPantalla('mision-registrada');
            } else {
                window.location.href = 'mision-registrada.html';
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        if (UI?.exigirRegistro && !UI.exigirRegistro()) return;

        renderizarMision();
        inicializarEventos();
    });
})();