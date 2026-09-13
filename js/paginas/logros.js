/* ============================================================
   PÁGINA · LOGROS
   ------------------------------------------------------------
   Pinta el progreso total de logros (barra + mensaje variable),
   la lista de logros (desbloqueados / bloqueados con avance) y
   muestra los botones de certificado cuando corresponde.

   Todo el dato sale de js/datos.js. Acá solo se arma el DOM.

   Funciona en los DOS modos (ver js/ui.js → mostrarPantalla):
     · BUNDLE: el router llama initLogros al mostrar la vista.
     · LOCAL:  no hay router para esta pantalla, así que se
               inicializa sola en el DOMContentLoaded de abajo.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;
  var TEXTOS = window.PUMM.TEXTOS;
  var CONFIG = window.PUMM.CONFIG;

  /* Elige el mensaje de arriba de la barra según el % de logros. */
  function mensajePara(porcentaje) {
    if (porcentaje >= 100) return TEXTOS.logrosMensajeCompleto;
    if (porcentaje >= 67) return TEXTOS.logrosMensajeCasi;
    if (porcentaje >= 34) return TEXTOS.logrosMensajeMedio;
    return TEXTOS.logrosMensajeInicio;
  }

  /* Crea la tarjeta-fila de un logro. Usa textContent (nunca
     innerHTML) porque nombre y descripción vienen de datos. */
  function crearTarjeta(logro) {
    var card = document.createElement("article");
    card.className = "logro-card " +
      (logro.desbloqueada ? "logro-card--desbloqueada" : "logro-card--bloqueada") +
      (logro.dificultad ? " logro-card--" + logro.dificultad : "");

    var circulo = document.createElement("div");
    circulo.className = "logro-card__circulo";
    circulo.setAttribute("aria-hidden", "true");
    circulo.textContent = logro.icono;
    card.appendChild(circulo);

    var cuerpo = document.createElement("div");
    cuerpo.className = "logro-card__cuerpo";

    var nombre = document.createElement("h2");
    nombre.className = "logro-card__nombre";
    nombre.textContent = logro.nombre;
    cuerpo.appendChild(nombre);

    var desc = document.createElement("p");
    desc.className = "logro-card__desc";
    desc.textContent = logro.descripcion;
    cuerpo.appendChild(desc);

    /* Progreso numérico: solo en los bloqueados que se ganan por
       cantidad de misiones (los que tienen meta). Ej: "2/5". */
    if (!logro.desbloqueada && logro.meta) {
      var avance = document.createElement("p");
      avance.className = "logro-card__avance";
      avance.textContent = logro.avance + "/" + logro.meta;
      cuerpo.appendChild(avance);
    }

    card.appendChild(cuerpo);

    var estado = document.createElement("div");
    estado.className = "logro-card__estado";
    if (logro.desbloqueada) {
      estado.classList.add("logro-card__estado--ok");
      estado.textContent = "✓";
      estado.setAttribute("aria-label", "Logro desbloqueado");
    } else {
      estado.classList.add("logro-card__estado--bloqueado");
      estado.textContent = "🔒";
      estado.setAttribute("aria-label", "Logro bloqueado");
    }
    card.appendChild(estado);

    return card;
  }

  function initLogros() {
    var pl = Datos.obtenerProgresoLogros();

    /* Barra + mensaje + porcentaje. */
    UI.$("#logros-mensaje").textContent = mensajePara(pl.porcentaje);
    UI.$("#logros-porcentaje").textContent = pl.porcentaje;
    UI.$("#logros-relleno").style.width = pl.porcentaje + "%";

    /* Lista de logros. */
    var lista = UI.$("#logros-lista");
    lista.textContent = "";
    Datos.obtenerLogros().forEach(function (logro) {
      lista.appendChild(crearTarjeta(logro));
    });

    /* Certificado de participación: solo desde la fecha habilitada. */
    var ahora = new Date();
    var desde = new Date(CONFIG.FECHA_CERTIFICADO);
    var certParticipacion = UI.$("#logros-cert-secundario");
    if (certParticipacion && ahora >= desde) {
      certParticipacion.classList.remove("oculto");
    }

    /* Certificado de logros: solo con el 100% desbloqueado. */
    var certLogros = UI.$("#logros-cert-logros");
    if (certLogros && pl.completo) {
      certLogros.classList.remove("oculto");
    }
  }

  /* BUNDLE: el router corre initLogros cuando se muestra la vista. */
  UI.alMostrar("logros", initLogros);

  /* LOCAL: como esta pantalla no pasa por rutearFlujo, la
     inicializamos acá. En el bundle hay [data-vista], y ahí manda el
     router, así que salimos para no pintar antes de tiempo ni disparar
     el redirect de exigirRegistro (que sacaría al usuario de la app). */
  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("[data-vista]")) return;
    if (!UI.exigirRegistro()) return;
    initLogros();
  });
})();
