/* ============================================================
   PÁGINA · ACTIVIDADES
   ------------------------------------------------------------
   Lista el cronograma (data/actividades.js) con buscador y
   filtros (hora, ubicación, orden). Cada tarjeta muestra hora,
   nombre y ubicación. Es SOLO informativo: no marca completado
   ni cuenta para nada (eso son las MISIONES del pasaporte).

   Funciona en los dos modos (ver js/ui.js → mostrarPantalla):
     · BUNDLE: el router llama initActividades al mostrar la vista.
     · LOCAL:  se inicializa sola en el DOMContentLoaded de abajo.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;

  /* Los listeners se cablean una sola vez aunque la vista se muestre
     varias veces (en el bundle initActividades puede correr de nuevo). */
  var cableado = false;

  function obtenerActividades() {
    return (window.PUMM.ACTIVIDADES || []).slice();
  }

  /* Una actividad "tiene hora" si su campo hora es "HH:MM"
     (las de "Todo el día" no). */
  function esConHora(a) {
    return /^\d{1,2}:\d{2}$/.test(a.hora);
  }

  var SVG_UBICACION =
    '<svg class="tarjeta__icono-ubicacion" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 12C12.55 12 13.0208 11.8042 13.4125 11.4125C13.8042 11.0208 14 10.55 14 10C14 9.45 13.8042 8.97917 13.4125 8.5875C13.0208 8.19583 12.55 8 12 8C11.45 8 10.9792 8.19583 10.5875 8.5875C10.1958 8.97917 10 9.45 10 10C10 10.55 10.1958 11.0208 10.5875 11.4125C10.9792 11.8042 11.45 12 12 12ZM12 22C9.31667 19.7167 7.3125 17.5958 5.9875 15.6375C4.6625 13.6792 4 11.8667 4 10.2C4 7.7 4.80417 5.70833 6.4125 4.225C8.02083 2.74167 9.88333 2 12 2C14.1167 2 15.9792 2.74167 17.5875 4.225C19.1958 5.70833 20 7.7 20 10.2C20 11.8667 19.3375 13.6792 18.0125 15.6375C16.6875 17.5958 14.6833 19.7167 12 22Z" fill="currentColor"/>' +
    '</svg>';

  var COLORES = ["blanco", "cian", "violeta", "amarillo"];

  function renderizar(lista) {
    var contenedor = UI.$("#lista-actividades");
    contenedor.innerHTML = lista.map(function (a, indice) {
      var color = COLORES[indice % COLORES.length];
      var clases = ["tarjeta"];
      if (color !== "blanco") clases.push("tarjeta--" + color);

      var p = UI.separarActividad(a.nombre);
      var horaTexto = esConHora(a) ? a.hora + "hs" : a.hora;

      return (
        '<article class="' + clases.join(" ") + '">' +
          '<h2 class="tarjeta__titulo">' + p.titulo + "</h2>" +
          (p.categoria ? '<p class="tarjeta__categoria">' + p.categoria + "</p>" : "") +
          '<div class="tarjeta__pie">' +
            '<p class="tarjeta__ubicacion">' + SVG_UBICACION + (a.ubicacion || "") + "</p>" +
            '<span class="tarjeta__horario">' + horaTexto + "</span>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* Combina el texto del buscador con los 3 filtros y vuelve a pintar. */
  function aplicarTodo() {
    var actividades = obtenerActividades();
    var texto = UI.$("#buscador-actividades").value.toLowerCase();
    var horaMin = UI.$("#filtro-hora").value;   // "" si no se eligió
    var ubicacion = UI.$("#filtro-zona").value;
    var orden = UI.$("#filtro-orden").value;

    var resultado = actividades.filter(function (a) {
      var coincideTexto = a.nombre.toLowerCase().indexOf(texto) !== -1;
      /* "empiezan después de": solo aplica a las que tienen horario;
         las de "Todo el día" quedan fuera cuando se filtra por hora. */
      var coincideHora = !horaMin || (esConHora(a) && a.hora >= horaMin);
      var coincideUbicacion = !ubicacion || a.ubicacion === ubicacion;
      return coincideTexto && coincideHora && coincideUbicacion;
    });

    if (orden === "alfabetico") {
      resultado.sort(function (a, b) {
        return a.nombre.localeCompare(b.nombre, "es");
      });
    } else {
      /* Por defecto: por horario. Las de "Todo el día" van al final. */
      resultado.sort(function (a, b) {
        var ca = esConHora(a), cb = esConHora(b);
        if (ca && cb) return a.hora.localeCompare(b.hora);
        if (ca) return -1;
        if (cb) return 1;
        return 0;
      });
    }

    renderizar(resultado);
  }

  /* Llena el <select> de ubicaciones con las que existen en los datos,
     sin repetir. Idempotente: deja la primera opción ("Todas…") y
     repuebla el resto, por si initActividades corre más de una vez. */
  function poblarUbicaciones() {
    var select = UI.$("#filtro-zona");
    while (select.options.length > 1) select.remove(1);

    var ubicaciones = [];
    obtenerActividades().forEach(function (a) {
      if (a.ubicacion && ubicaciones.indexOf(a.ubicacion) === -1) {
        ubicaciones.push(a.ubicacion);
      }
    });

    ubicaciones.sort().forEach(function (u) {
      var opcion = document.createElement("option");
      opcion.value = u;
      opcion.textContent = u;
      select.appendChild(opcion);
    });
  }

  function initActividades() {
    poblarUbicaciones();
    aplicarTodo();  // pinta ya ordenado por horario

    if (cableado) return;
    cableado = true;

    UI.$("#buscador-actividades").addEventListener("input", aplicarTodo);
    UI.$("#filtro-hora").addEventListener("change", aplicarTodo);
    UI.$("#filtro-zona").addEventListener("change", aplicarTodo);
    UI.$("#filtro-orden").addEventListener("change", aplicarTodo);

    UI.$("#btn-filtros").addEventListener("click", function () {
      UI.$("#panel-filtros").classList.toggle("oculto");
      UI.$("#btn-filtros").classList.toggle("boton--sin-sombra");
    });
  }

  UI.alMostrar("actividades", initActividades);

  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("[data-vista]")) return;
    initActividades();
  });
})();
