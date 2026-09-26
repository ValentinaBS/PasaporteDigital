/* ============================================================
   PANTALLA · PASAPORTE (Mi Pasaporte)
   ------------------------------------------------------------
   Pantalla principal del recorrido: saludo, progreso de misiones
   (X/8 + barra), botones de certificado, la ACTIVIDAD destacada
   del momento (del cronograma) y la checklist de las 8 MISIONES.

   Ojo con los dos conceptos:
     · MISIONES (data/misiones.js): las 8 que se completan por QR y
       cuentan para el progreso/logros. Van en la checklist.
     · ACTIVIDADES (data/actividades.js): el cronograma informativo.
       De ahí sale la "actividad destacada".

   No decide por su cuenta si mostrarse: registra su init con
   UI.alMostrar("pasaporte", ...); el router de js/app.js decide.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;
  var TEXTOS = window.PUMM.TEXTOS;
  var CONFIG = window.PUMM.CONFIG;

  function pintarSaludo(participante) {
    /* Solo el primer nombre: si el registro trae "Ana María Pérez",
       saludamos "Ana". El nombre completo se guarda igual. */
    var primerNombre =
      (participante.nombre || "").trim().split(/\s+/)[0] || participante.nombre;
    UI.$("#pasaporte-saludo").textContent =
      TEXTOS.pasaporteSaludo + ", " + primerNombre + "!";
  }

  /* Progreso simple de misiones: X/meta + barra. El conteo real viene
     de Datos.obtenerProgreso() (planilla en Apps Script, localStorage
     en demo). */
  function pintarProgreso() {
    var p = Datos.obtenerProgreso();
    UI.$("#progreso-fraccion").textContent = p.hechas + "/" + p.meta;
    UI.$("#progreso-relleno").style.width = p.porcentaje + "%";
  }

  /* Checklist de las 8 misiones: ícono + nombre + estado (✓ si está
     hecha). El estado se decide con Datos.misionHecha (correcto en los
     dos modos). */
  function pintarMisiones() {
    var lista = UI.$("#pasaporte-misiones");
    if (!lista) return;
    lista.innerHTML = "";

    (window.PUMM.MISIONES || []).forEach(function (m) {
      var hecha = Datos.misionHecha(m.id);

      var li = document.createElement("li");
      li.className = "mision-item" + (hecha ? " mision-item--hecha" : "");

      var icono = document.createElement("span");
      icono.className = "mision-item__icono";
      icono.setAttribute("aria-hidden", "true");
      icono.textContent = m.icono || "";
      li.appendChild(icono);

      var nombre = document.createElement("span");
      nombre.className = "mision-item__nombre";
      nombre.textContent = m.nombre;
      li.appendChild(nombre);

      var estado = document.createElement("span");
      estado.className =
        "mision-item__estado" + (hecha ? " mision-item__estado--ok" : "");
      estado.textContent = hecha ? "✓" : "";
      estado.setAttribute("aria-label", hecha ? "Completada" : "Pendiente");
      li.appendChild(estado);

      lista.appendChild(li);
    });
  }

  /* Botones de certificado (debajo de la barra):
       · Participación: desde CONFIG.FECHA_CERTIFICADO.
       · Logros: con el 100% de logros desbloqueados.
     Se usa toggle(force) para que, al re-mostrar la vista en el bundle,
     el estado se recalcule (no queden visibles de una visita anterior). */
  function pintarCertificados() {
    var ahora = new Date();
    var desde = new Date(CONFIG.FECHA_CERTIFICADO);

    var certPart = UI.$("#cert-participacion");
    if (certPart) certPart.classList.toggle("oculto", (ahora >= desde));

    var certLogros = UI.$("#cert-logros");
    if (certLogros) {
      certLogros.classList.toggle("oculto", Datos.obtenerProgresoLogros().completo);
    }
  }

  /* "HH:MM" → minutos desde medianoche, para comparar/ordenar horarios. */
  function horarioAMinutos(hora) {
    var p = String(hora || "").split(":");
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  /* Una actividad "tiene hora" si su campo hora es "HH:MM"
     (las de "Todo el día" no). */
  function esConHora(act) {
    return /^\d{1,2}:\d{2}$/.test(act.hora);
  }

  /* Elige la actividad destacada según la hora actual:
       1. ≥ 16:00              → null (mostramos agradecimiento).
       2. hay actividad futura → la próxima por horario.
       3. no quedan con hora   → una de "Todo el día" al azar. */
  function elegirActividadDestacada() {
    var ahora = new Date();
    if (ahora.getHours() >= 16) return null;

    var minutos = ahora.getHours() * 60 + ahora.getMinutes();
    var actividades = window.PUMM.ACTIVIDADES || [];

    var proximas = actividades
      .filter(function (a) {
        return esConHora(a) && horarioAMinutos(a.hora) >= minutos;
      })
      .sort(function (a, b) {
        return horarioAMinutos(a.hora) - horarioAMinutos(b.hora);
      });
    if (proximas.length) return proximas[0];

    var todoElDia = actividades.filter(function (a) { return !esConHora(a); });
    if (todoElDia.length) {
      return todoElDia[Math.floor(Math.random() * todoElDia.length)];
    }
    return null;
  }

  /* Pinta la tarjeta destacada. Si no hay actividad (después de las 16),
     la tarjeta no se oculta: agradece por participar. */
  function pintarActividadDestacada() {
    var act = elegirActividadDestacada();
    var etiqueta = UI.$("#destacada-tarjeta .tarjeta__etiqueta");

    if (!act) {
      if (etiqueta) etiqueta.classList.add("oculto");
      UI.$("#destacada-titulo").textContent = TEXTOS.destacadaFinTitulo;
      UI.$("#destacada-texto").textContent = TEXTOS.destacadaFinTexto;
      UI.$("#destacada-lugar").textContent = "";
      return;
    }

    if (etiqueta) etiqueta.classList.remove("oculto");
    UI.$("#destacada-titulo").textContent = act.nombre;
    UI.$("#destacada-texto").textContent = "";
    UI.$("#destacada-lugar").innerHTML =
      '<img src="../assets/iconos/localizacion-violeta.svg" alt="icono lugar">' +
      act.ubicacion + " · " + act.hora + (esConHora(act) ? " hs" : "");
  }

  function initPasaporte() {
    var participante = Datos.obtenerParticipante();
    /* Defensa: si llegara sin sesión, al registro. */
    if (!participante || !participante.nombre) {
      UI.mostrarPantalla("index");
      return;
    }
    pintarSaludo(participante);
    pintarActividadDestacada(); // no depende del servidor: dato local

    /* sincronizarProgreso trae de la planilla cuántas/ cuáles misiones
       tiene la participante. Recién con eso pintamos progreso, checklist
       y certificados, para no mostrar valores viejos un instante. */
    UI.conCarga(Datos.sincronizarProgreso(), TEXTOS.cargandoPasaporte).then(function () {
      pintarProgreso();
      pintarMisiones();
      pintarCertificados();
    });
  }

  UI.alMostrar("pasaporte", initPasaporte);
})();
