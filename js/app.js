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

  /* Cablea la navegación entre pantallas.
     En LOCAL (páginas separadas) los href navegan solos, así que no
     hacemos nada. En el BUNDLE las otras pantallas no existen como
     archivos (romperían el href), así que interceptamos el click de
     CUALQUIER link interno a un .html (nav, "Buscar misiones", los
     botones de certificado, etc.) y cambiamos de vista con
     mostrarPantalla. Detectamos el bundle por la presencia de [data-vista]. */
  function cablearNavegacion() {
    if (!UI.$$("[data-vista]").length) return;

    UI.$$('a[href*=".html"]').forEach(function (enlace) {
      enlace.addEventListener("click", function (evento) {
        evento.preventDefault();
        var href = enlace.getAttribute("href") || "";
        /* "pasaporte.html" → "pasaporte"; "nueva-mision.html?x=1" → "nueva-mision" */
        var clave = href.replace(/^.*\//, "").replace(/\.html.*$/, "");
        UI.mostrarPantalla(clave);
      });
    });
  }

  /* Impide cerrar el modal salvo por sus botones.
     El <dialog> nativo se cierra con Escape; lo bloqueamos con el
     evento "cancel". Y NO agregamos el cierre por click en el fondo
     (el <dialog> tampoco lo trae de fábrica), así que tocar afuera no
     hace nada. Los únicos que cierran son los botones del modal
     (Continuar / Volver a intentar / Entendido), ya cableados en
     js/ui.js → abrirModal. */
  function blindarModal() {
    var dialogo = UI.$("#modal");
    if (!dialogo) return;

    dialogo.addEventListener("cancel", function (evento) {
      evento.preventDefault();
    });
  }

  /* Decide qué pantalla del flujo registro/pasaporte mostrar según la
     sesión, y lo hace UNA sola vez. Las pantallas solo registran su
     inicializador (UI.alMostrar); acá decidimos cuál corre.

     · Con sesión  → pasaporte
     · Sin sesión  → registro (index)

     mostrarPantalla resuelve el resto: en local navega al .html que
     corresponda; en el bundle muestra la vista y corre su init. Por eso
     el mismo código funciona en los dos modos.

     Solo actúa en las pantallas de este flujo (evita tocar otras que se
     agreguen en el futuro). */
  function rutearFlujo() {
    var Datos = window.PUMM.Datos;
    var pagina = document.body.getAttribute("data-pagina");
    var enFlujo = UI.$$("[data-vista]").length > 0 ||
                  pagina === "index" || pagina === "pasaporte";
    if (!enFlujo || !Datos) return;

    if (!Datos.estaRegistrada()) {
      UI.mostrarPantalla("index");
      return;
    }

    /* Si se entró por un QR (…?mision=id), abrir la validación de esa
       actividad; si no, el pasaporte. En el bundle el QR apunta a la URL
       de la app con ?mision=…; en local el QR va directo a
       nueva-mision.html, así que esto casi siempre da "pasaporte". */
    var mision = UI.leerParametro(window.PUMM.CONFIG.PARAM_QR);
    UI.mostrarPantalla(mision ? "nueva-mision" : "pasaporte");
  }

  /* DOMContentLoaded espera a que el HTML esté armado.
     Sin esto, los querySelector corren antes de que existan
     los elementos y devuelven null. */
  document.addEventListener("DOMContentLoaded", function () {
    marcarNavegacionActiva();
    cablearNavegacion();
    blindarModal();

    /* El ruteo necesita saber si se entró por un QR (?mision=id).
       En Apps Script ese query del /exec NO llega a window.location: la
       app corre en un iframe sandbox cuyo src es .../userCodeAppPanel, sin
       el parámetro. La vía OFICIAL para leerlo en el cliente es
       google.script.url.getLocation; dejamos el resultado en
       window.PUMM.MISION_QR (lo mismo que lee UI.leerParametro). Así el QR
       funciona aunque el template del servidor no evalúe <?= misionQR ?>.
       En local / dist directo google.script.url no existe: se rutea al
       toque leyendo window.location.search. */
    var yaRuteo = false;
    function rutearUnaVez() {
      if (yaRuteo) return;
      yaRuteo = true;
      rutearFlujo();
    }

    var enAppsScript = window.google && google.script && google.script.url &&
                       typeof google.script.url.getLocation === "function";

    if (!enAppsScript) {
      rutearUnaVez();
      return;
    }

    try {
      google.script.url.getLocation(function (loc) {
        var m = loc && loc.parameter && loc.parameter.mision;
        if (m) window.PUMM.MISION_QR = m;
        rutearUnaVez();
      });
    } catch (e) {
      rutearUnaVez();
    }
    /* Red de seguridad: si getLocation no respondiera, arrancamos igual
       (con lo que haya en MISION_QR / location) en vez de quedar colgados. */
    setTimeout(rutearUnaVez, 1500);
  });
})();
