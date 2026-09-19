/* ============================================================
   PANTALLA · PASAPORTE (Mi Pasaporte)
   ------------------------------------------------------------
   Pantalla principal del recorrido: saludo a la participante,
   su progreso (pista de misiones) y la misión destacada del
   momento. Reemplaza al placeholder de "dummy de verificación"
   que había antes (nombre + DNI a secas).

   No decide por su cuenta si mostrarse: solo registra su
   inicializador con UI.alMostrar("pasaporte", ...). El router de
   js/app.js decide cuál pantalla mostrar según haya sesión.
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;
  var TEXTOS = window.PUMM.TEXTOS;

  function pintarSaludo(participante) {
    /* Solo el primer nombre: si el registro trae "Ana María Pérez",
       en el pasaporte saludamos "Ana". El nombre completo se guarda
       igual (registro.js / datos.js no se tocan). */
    var primerNombre =
      (participante.nombre || "").trim().split(/\s+/)[0] || participante.nombre;
    UI.$("#pasaporte-saludo").textContent =
      TEXTOS.pasaporteSaludo + ", " + primerNombre + "!";
  }

  /* Pinta el nivel, la fracción (hechas EN EL NIVEL/meta del
     nivel) y la pista de casilleros del nivel actual.

     ⚠️ Los 8 casilleros no representan 8 misiones puntuales de
     data/misiones.js: son un cupo genérico por nivel (todavía no
     hay una regla de qué misiones cuentan para cada nivel). Por
     eso NO se recorre window.PUMM.MISIONES ni se usa
     Datos.yaRegistro(id) acá — eso mira si UNA misión puntual
     está en el registro local, que es otra cosa. Lo que importa
     acá es solo el CONTEO total que ya viene sincronizado de la
     planilla (Datos.obtenerProgreso().hechas). */
  function pintarProgreso() {
    var progreso = Datos.obtenerNivel();

    UI.$("#progreso-nivel-numero").textContent = progreso.nivel;
    UI.$("#progreso-fraccion").textContent =
      progreso.hechasEnNivel + "/" + progreso.meta;

    var pista = UI.$("#progreso-pista");
    pista.innerHTML = ""; // por si initPasaporte corriera dos veces

    for (var i = 1; i <= progreso.meta; i++) {
      var esHecho = i < progreso.hechasEnNivel;
      var esActual = i === progreso.hechasEnNivel && progreso.hechasEnNivel > 0;

      var paso = document.createElement("span");
      paso.className = "paso" +
        (esHecho ? " paso--hecho" : "") +
        (esActual ? " paso--actual" : "");

      var etiqueta = document.createElement("span");
      etiqueta.className = "solo-lectores";

      if (esActual) {
        var check = document.createElement("img");
        check.src = "../assets/iconos/check-blanco.svg";
        check.alt = "";
        check.className = "paso__check";
        paso.appendChild(check);
        etiqueta.textContent = "Misión " + i + " completada (la más reciente) del nivel " + progreso.nivel;
      } else {
        paso.appendChild(document.createTextNode(String(i)));
        etiqueta.textContent =
          (esHecho ? "Misión " + i + " completada" : "Falta la misión " + i) +
          " del nivel " + progreso.nivel;
      }

      paso.appendChild(etiqueta);
      pista.appendChild(paso);
    }
  }

  /* "HH:MM" → minutos desde medianoche, para comparar horarios. */
  function horarioAMinutos(horario) {
    var p = String(horario || "").split(":");
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  /* La misión destacada es la actividad más cercana a la hora actual
     que TODAVÍA no empezó (la próxima). Compara por hora del día
     porque el evento es de un solo día. Si ya pasaron todas, null. */
  function elegirMisionDestacada() {
    var ahora = new Date();
    var minutos = ahora.getHours() * 60 + ahora.getMinutes();

    return window.PUMM.MISIONES
      .filter(function (m) {
        return m.horario && horarioAMinutos(m.horario) >= minutos;
      })
      .sort(function (a, b) {
        return horarioAMinutos(a.horario) - horarioAMinutos(b.horario);
      })[0] || null;
  }

  /* Pinta la tarjeta de la misión destacada con la próxima actividad.
     Si ya pasaron todas las del día, la tarjeta NO se oculta: muestra
     un agradecimiento por participar (sin ubicación/horario). */
  function pintarMisionDestacada() {
    var mision = elegirMisionDestacada();
    var etiqueta = UI.$("#destacada-tarjeta .tarjeta__etiqueta");

    if (!mision) {
      if (etiqueta) etiqueta.classList.add("oculto");
      UI.$("#destacada-titulo").textContent = TEXTOS.destacadaFinTitulo;
      UI.$("#destacada-texto").textContent = TEXTOS.destacadaFinTexto;
      UI.$("#destacada-lugar").textContent = "";
      return;
    }

    if (etiqueta) etiqueta.classList.remove("oculto");
    UI.$("#destacada-titulo").textContent = mision.nombre;
    UI.$("#destacada-texto").textContent = mision.descripcion;
    UI.$("#destacada-lugar").innerHTML =
      '<img src="../assets/iconos/localizacion-violeta.svg" alt="icono lugar">' +
      mision.ubicacion + " - " + mision.horario + " hs";
  }

    /* Inicializa la pantalla: pinta el saludo, sincroniza el progreso
    con la planilla y pinta el nivel, la fracción y la pista. */
    function initPasaporte() {
    var participante = Datos.obtenerParticipante();
    /* Defensa: si llegara sin sesión, al registro. */
    if (!participante || !participante.nombre) {
      UI.mostrarPantalla("index");
      return;
    }
    pintarSaludo(participante);
    /* sincronizarProgreso pregunta a la planilla cuántas misiones
       tiene esta participante. Recién con esa respuesta pintamos
       el nivel, la fracción y la pista: si pintáramos antes,
       mostraríamos el valor viejo (o vacío) un instante. */
    Datos.sincronizarProgreso().then(function () {
      pintarProgreso();
      pintarMisionDestacada();
    });
  }

  UI.alMostrar("pasaporte", initPasaporte);
})();