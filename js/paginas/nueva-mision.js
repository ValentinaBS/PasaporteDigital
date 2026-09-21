(function () {
    "use strict";

    var UI = window.PUMM.UI;
    var Datos = window.PUMM.Datos;
    var TEXTOS = window.PUMM.TEXTOS;

    var isChecked = false;
    var misionActual = null;
    /* Los listeners se cablean una sola vez aunque la vista se muestre
       varias veces (en el bundle initNuevaMision puede correr de nuevo). */
    var cableado = false;

    function obtenerMisionActual() {
        var idMision = UI && typeof UI.leerParametro === "function"
            ? UI.leerParametro("mision")
            : new URLSearchParams(window.location.search).get("mision");

        var listaMisiones = window.PUMM.MISIONES || [];

        return listaMisiones.find(function (mision) {
            return mision.slug === idMision || mision.id === idMision;
        }) || listaMisiones[0];
    }

    function renderizarMision() {
        misionActual = obtenerMisionActual();

        var elementoTituloMision = UI ? UI.$(".actividad__mision-titulo") : document.querySelector(".actividad__mision-titulo");
        if (elementoTituloMision && misionActual) {
            elementoTituloMision.textContent = misionActual.nombre;
        }
    }

    /* ---------- Modales ---------- */
    /* Primera vez que se completa una misión: modal de festejo y de
       ahí al pasaporte. (Si la misión ya estaba registrada, en cambio,
       se va a la pantalla mision-ya-registrada; ver irAYaRegistrada.) */
    function mostrarModalCompletada() {
        var TEXTOS = window.PUMM.TEXTOS || {};

        PUMM.UI.abrirModal({
            tipo: "exito",
            icono: '<img class="modal__icono-img" src="../assets/iconos/celebracion-negro.svg" alt="">',
            titulo: TEXTOS.misionCompletadaTitulo,
            texto: TEXTOS.misionCompletadaTexto,
            acciones: [{
                texto: TEXTOS.botonVolverPasaporte,
                pantalla: "pasaporte",
                /* flecha der. dada vuelta → apunta a la izquierda (volver) */
                icono: '<img class="boton__icono boton__icono--voltear" src="../assets/iconos/flecha-der-blanca.svg" alt="">'
            }]
        });
    }

    /* Misión ya registrada (escaneada antes): pantalla completa. Lleva
       el id para mostrar la misión correcta en los dos modos. */
    function irAYaRegistrada() {
        if (document.querySelector("[data-vista]")) {
            /* Bundle: leerParametro cae a window.PUMM.MISION_QR (el QR
               que trajo al usuario), que la pantalla vuelve a leer. */
            UI.mostrarPantalla("mision-ya-registrada");
        } else {
            /* Local: mostrarPantalla no arrastra el query, así que
               navegamos con ?mision= para que pinte la misión correcta. */
            window.location.href = "mision-ya-registrada.html?mision=" + encodeURIComponent(misionActual.id);
        }
    }

    function mostrarModalDesconocida() {
        var TEXTOS = window.PUMM.TEXTOS || {};

        PUMM.UI.abrirModal({
            tipo: "error",
            icono: '<img class="boton__icono" src="../assets/iconos/reintento-blanco.svg" alt="">',
            titulo: TEXTOS.misionDesconocidaTitulo,
            texto: TEXTOS.misionDesconocidaTexto,
            acciones: [{texto: TEXTOS.botonReintentar, cerrar: true}]
        });
    }

    /* ---------- Eventos ---------- */
    function inicializarEventos() {
        var toggleBtn = UI ? UI.$("#toggle-btn") : document.getElementById("toggle-btn");
        var statusMessage = UI ? UI.$("#status-message") : document.getElementById("status-message");

        if (toggleBtn) {
            toggleBtn.addEventListener("click", function () {
                isChecked = !isChecked;

                if (isChecked) {
                    toggleBtn.style.background = "var(--color-secundario) url('../assets/iconos/pulgar-like.svg') no-repeat center / 70%";
                    if (statusMessage)
                        statusMessage.textContent = " ";
                } else {
                    toggleBtn.style.background = "";
                    toggleBtn.textContent = "";
                    if (statusMessage) {
                        statusMessage.textContent = "¡No olvides marcar la misión!";
                        statusMessage.style.color = "var(--color-error)";
                    }
                }
            });
        }

        /* Por id (no por .boton--primario): en el bundle hay varios
           .boton--primario en distintas vistas y UI.$ agarraría el
           equivocado, dejando este botón sin handler. */
        var botonCompletarMision = UI ? UI.$("#btn-completar") : document.getElementById("btn-completar");
        if (botonCompletarMision) {
            botonCompletarMision.addEventListener("click", function () {
                if (!isChecked) {
                    if (statusMessage) {
                        statusMessage.textContent = "Debes marcar la misión antes de continuar.";
                        statusMessage.style.color = "var(--color-error)";
                    }
                    return;
                }

                if (misionActual && misionActual.id) {
                    /* registrarMision devuelve una Promise (en Apps Script
                       el sello va al servidor y vuelve por callback). */
                    UI.conCarga(
                        Datos.registrarMision(misionActual.id), 
                        TEXTOS.cargandoMision
                    ).then(function (resultado) {
                        if (resultado === "ok")
                            mostrarModalCompletada();   // primera vez → modal
                        else if (resultado === "repetida")
                            irAYaRegistrada();          // ya escaneada → pantalla
                        else
                            mostrarModalDesconocida();  // "desconocida" / "error"
                    });
                }
            });
        }
    }

    /* Vuelve al estado inicial (por si se muestra la vista de nuevo en
       el bundle tras haber marcado el toggle en una visita anterior). */
    function resetear() {
        isChecked = false;
        var toggleBtn = UI.$("#toggle-btn");
        if (toggleBtn) {
            toggleBtn.style.background = "";
            toggleBtn.textContent = "";
        }
        var statusMessage = UI.$("#status-message");
        if (statusMessage) statusMessage.textContent = "";
    }

    function initNuevaMision() {
        resetear();
        renderizarMision();
        if (cableado) return;
        cableado = true;
        inicializarEventos();
    }

    /* BUNDLE: el router corre initNuevaMision al mostrar la vista. */
    UI.alMostrar("nueva-mision", initNuevaMision);

    /* LOCAL: se inicializa sola. En el bundle hay [data-vista] y manda
       el router, así que salimos (evita disparar exigirRegistro, que
       redirige a index.html y saca al usuario de la app). */
    document.addEventListener("DOMContentLoaded", function () {
        if (document.querySelector("[data-vista]")) return;
        if (UI && typeof UI.exigirRegistro === "function")
            if (!UI.exigirRegistro()) return;
        initNuevaMision();
    });
})();