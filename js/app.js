/* ============================================================
   APP  ·  Lo que corre en TODAS las pantallas
   ------------------------------------------------------------
   Se carga en los 8 archivos HTML, después de config/datos/ui y
   antes del js/paginas/ que corresponda.

   Acá va solo lo verdaderamente común. Si algo pasa en una sola
   pantalla, va en su archivo de js/paginas/.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;

  /* Marca la sección activa en la barra de navegación.
     Lee <body data-pagina="pasaporte"> y le pone la clase al
     item que corresponde. Así el HTML de la nav es idéntico en
     las 5 pantallas y no hay que acordarse de mover una clase
     a mano en cada archivo (que siempre se olvida en uno). */
  function marcarNavegacionActiva() {
    var pagina = document.body.getAttribute("data-pagina");
    if (!pagina) return;

    var item = UI.$('.nav__item[data-seccion="' + pagina + '"]');
    if (item) {
      item.classList.add("nav__item--activo");
      item.setAttribute("aria-current", "page");
    }
  }

  /* Cierra cualquier modal al tocar afuera del cuadro.
     <dialog> no lo trae de fábrica. */
  function cerrarModalAlTocarAfuera() {
    var dialogo = UI.$("#modal");
    if (!dialogo) return;

    dialogo.addEventListener("click", function (evento) {
      /* Si el click cayó en el <dialog> mismo y no en su
         contenido, fue en el fondo oscuro. */
      if (evento.target === dialogo) {
        dialogo.close();
      }
    });
  }

  /* DOMContentLoaded espera a que el HTML esté armado.
     Sin esto, los querySelector corren antes de que existan
     los elementos y devuelven null. */
  document.addEventListener("DOMContentLoaded", function () {
    marcarNavegacionActiva();
    cerrarModalAlTocarAfuera();
  });
})();
