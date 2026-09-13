/* ============================================================
   PÁGINA · MISIONES
   ------------------------------------------------------------
   Lista las misiones de data/misiones.js con buscador y filtros
   (hora, ubicación, orden). Cada tarjeta usa nombre, horario,
   ubicacion y descripcion de los datos reales.

   Funciona en los dos modos (ver js/ui.js → mostrarPantalla):
     · BUNDLE: el router llama initMisiones al mostrar la vista.
     · LOCAL:  se inicializa sola en el DOMContentLoaded de abajo.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;

  /* Los listeners se cablean una sola vez aunque la vista se muestre
     varias veces (en el bundle initMisiones puede correr de nuevo). */
  var cableado = false;

  function obtenerMisiones() {
    return (window.PUMM.MISIONES || []).slice();
  }

  var SVG_UBICACION =
    '<svg class="tarjeta__icono-ubicacion" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M12 12C12.55 12 13.0208 11.8042 13.4125 11.4125C13.8042 11.0208 14 10.55 14 10C14 9.45 13.8042 8.97917 13.4125 8.5875C13.0208 8.19583 12.55 8 12 8C11.45 8 10.9792 8.19583 10.5875 8.5875C10.1958 8.97917 10 9.45 10 10C10 10.55 10.1958 11.0208 10.5875 11.4125C10.9792 11.8042 11.45 12 12 12ZM12 22C9.31667 19.7167 7.3125 17.5958 5.9875 15.6375C4.6625 13.6792 4 11.8667 4 10.2C4 7.7 4.80417 5.70833 6.4125 4.225C8.02083 2.74167 9.88333 2 12 2C14.1167 2 15.9792 2.74167 17.5875 4.225C19.1958 5.70833 20 7.7 20 10.2C20 11.8667 19.3375 13.6792 18.0125 15.6375C16.6875 17.5958 14.6833 19.7167 12 22Z" fill="currentColor"/>' +
    '</svg>';

  function renderizar(lista) {
    var contenedor = UI.$("#lista-misiones");
    contenedor.innerHTML = lista.map(function (m) {
      var hecha = Datos.yaRegistro(m.id);
      var clases = ["tarjeta"];
      if (hecha) clases.push("tarjeta--hecha");

      return (
        '<article class="' + clases.join(" ") + '">' +
          '<div class="fila-entre">' +
            '<h2 class="tarjeta__titulo">' + m.nombre + "</h2>" +
            '<span class="tarjeta__horario">' + (m.horario ? m.horario + " hs" : "") + "</span>" +
          "</div>" +
          '<p class="tarjeta__descripcion">' + (m.descripcion || "") + "</p>" +
          '<p class="tarjeta__ubicacion">' + SVG_UBICACION + (m.ubicacion || "") + "</p>" +
        "</article>"
      );
    }).join("");
  }

  /* Combina el texto del buscador con los 3 filtros y vuelve a pintar. */
  function aplicarTodo() {
    var misiones = obtenerMisiones();
    var texto = UI.$("#buscador-misiones").value.toLowerCase();
    var horaMin = UI.$("#filtro-hora").value;   // "" si no se eligió
    var ubicacion = UI.$("#filtro-zona").value;
    var orden = UI.$("#filtro-orden").value;

    var resultado = misiones.filter(function (m) {
      var coincideTexto = m.nombre.toLowerCase().indexOf(texto) !== -1;
      /* Comparar "10:30" >= "09:00" como strings funciona porque el
         formato HH:MM con ceros a la izquierda ordena igual que números. */
      var coincideHora = !horaMin || (m.horario && m.horario >= horaMin);
      var coincideUbicacion = !ubicacion || m.ubicacion === ubicacion;
      return coincideTexto && coincideHora && coincideUbicacion;
    });

    if (orden === "alfabetico") {
      resultado = resultado.slice().sort(function (a, b) {
        return a.nombre.localeCompare(b.nombre, "es");
      });
    }

    renderizar(resultado);
  }

  /* Llena el <select> de ubicaciones con las que existen en los datos,
     sin repetir. Idempotente: deja la primera opción ("Todas…") y
     repuebla el resto, por si initMisiones corre más de una vez. */
  function poblarUbicaciones() {
    var select = UI.$("#filtro-zona");
    while (select.options.length > 1) select.remove(1);

    var ubicaciones = [];
    obtenerMisiones().forEach(function (m) {
      if (m.ubicacion && ubicaciones.indexOf(m.ubicacion) === -1) {
        ubicaciones.push(m.ubicacion);
      }
    });

    ubicaciones.sort().forEach(function (u) {
      var opcion = document.createElement("option");
      opcion.value = u;
      opcion.textContent = u;
      select.appendChild(opcion);
    });
  }

  function initMisiones() {
    poblarUbicaciones();
    renderizar(obtenerMisiones());

    if (cableado) return;
    cableado = true;

    UI.$("#buscador-misiones").addEventListener("input", aplicarTodo);
    UI.$("#filtro-hora").addEventListener("change", aplicarTodo);
    UI.$("#filtro-zona").addEventListener("change", aplicarTodo);
    UI.$("#filtro-orden").addEventListener("change", aplicarTodo);

    /* El botón "Filtros" solo muestra/oculta el panel; los filtros se
       aplican en vivo con cada "change". */
    UI.$("#btn-filtros").addEventListener("click", function () {
      UI.$("#panel-filtros").classList.toggle("oculto");
    });
  }

  UI.alMostrar("misiones", initMisiones);

  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("[data-vista]")) return;
    initMisiones();
  });
})();
