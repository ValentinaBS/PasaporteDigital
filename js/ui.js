/* ============================================================
   UI  ·  Helpers de interfaz compartidos
   ------------------------------------------------------------
   Cosas que hacen falta en más de una pantalla: abrir modales,
   formatear horas, leer parámetros de la URL.

   Si estás por copiar y pegar una función de un archivo de
   js/paginas/ a otro, esa función va acá.
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.UI = (function () {
  "use strict";

  return {

    /* Atajo para no escribir document.querySelector en todos lados. */
    $: function (selector, contexto) {
      return (contexto || document).querySelector(selector);
    },

    $$: function (selector, contexto) {
      /* querySelectorAll devuelve una NodeList, no un array.
         Con Array.prototype.slice.call la convertimos a array
         para poder usar .map, .filter, etc. */
      return Array.prototype.slice.call(
        (contexto || document).querySelectorAll(selector)
      );
    },

    /* Lee un parámetro de la URL.
       Ej: en registro.html?actividad=labs
           leerParametro("actividad")  →  "labs" */
    leerParametro: function (nombre) {
      var params = new URLSearchParams(window.location.search);
      return params.get(nombre);
    },

    /* Abre el modal de la página con el contenido que le pasemos.
       Cada HTML tiene UN <dialog id="modal"> vacío y lo rellenamos
       desde acá: así los 4 estados (éxito, repetida, inválido, no
       activado) reusan la misma pieza.

       opciones = {
         tipo:    "exito" | "error" | "aviso",
         icono:   "✅",
         titulo:  "...",
         texto:   "...",
         acciones: [ { texto, href } ]   ← opcional
       }  */
    abrirModal: function (opciones) {
      var dialogo = this.$("#modal");
      if (!dialogo) {
        console.warn("[PUMM] Falta el <dialog id='modal'> en este HTML.");
        return;
      }

      dialogo.className = "modal modal--" + (opciones.tipo || "aviso");

      var acciones = opciones.acciones || [
        { texto: window.PUMM.TEXTOS.botonCerrar, cerrar: true }
      ];

      var htmlAcciones = acciones.map(function (a) {
        var clase = a.secundario ? "boton boton--fantasma" : "boton boton--primario";
        if (a.href) {
          return '<a class="' + clase + ' boton--ancho" href="' + a.href + '">' +
                 a.texto + "</a>";
        }
        return '<button class="' + clase + ' boton--ancho" data-cerrar-modal>' +
               a.texto + "</button>";
      }).join("");

      dialogo.innerHTML =
        '<p class="modal__icono" aria-hidden="true">' + (opciones.icono || "") + "</p>" +
        '<h2 class="modal__titulo">' + opciones.titulo + "</h2>" +
        '<p class="modal__texto">' + (opciones.texto || "") + "</p>" +
        '<div class="modal__acciones">' + htmlAcciones + "</div>";

      /* showModal() es del elemento <dialog> nativo. Nos da gratis
         el fondo oscuro, el cierre con Escape y el foco atrapado
         adentro del modal (importante para lectores de pantalla). */
      dialogo.showModal();

      this.$$("[data-cerrar-modal]", dialogo).forEach(function (boton) {
        boton.addEventListener("click", function () {
          dialogo.close();
        });
      });
    },

    /* "2026-08-10T14:32:00Z"  →  "14:32"
       hour12: false fuerza el reloj de 24 horas. Sin esto, según
       el idioma del celular sale "2:32 p. m.", que ocupa más y
       queda raro al lado del resto de la interfaz. */
    formatearHora: function (iso) {
      var fecha = new Date(iso);
      return fecha.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    },

    /* Busca una actividad por id en data/actividades.js. */
    buscarActividad: function (id) {
      return window.PUMM.ACTIVIDADES.filter(function (a) {
        return a.id === id;
      })[0] || null;
    },

    /* Manda a la pantalla de activación si el pasaporte no está
       activado. Devuelve true si puede seguir.

       Se llama al principio de cada pantalla protegida. Es una
       comodidad de UX, NO una medida de seguridad: cualquiera
       puede saltearla desde la consola. La validación de verdad
       tiene que estar en el backend. */
    exigirActivacion: function () {
      if (!window.PUMM.Datos.estaActivado()) {
        window.location.href = "index.html";
        return false;
      }
      return true;
    }
  };
})();
