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

  const MISIONES_POR_NIVEL = 8;
  const TOTAL_NIVELES = 3;

  function calcularNivel(misionesHechas) {
    return Math.floor(misionesHechas / MISIONES_POR_NIVEL) + 1;
  }

  /* ⚠️ HIPÓTESIS SIN VALIDAR: la "misión destacada" tampoco tiene
     todavía un lugar en los datos (¿la elige el equipo a mano?
     ¿depende del horario? ¿es la próxima sin registrar?). Se deja
     hardcodeada acá como placeholder para no bloquear la pantalla.

     El mockup la llama "Taller de IA"; el id más parecido en
     data/misiones.js es "ia" → "Lab de IA". Usamos el nombre real
     de los datos (ver pintarMisionDestacada) en vez de escribirlo
     de nuevo acá, así no quedan dos nombres distintos para la
     misma misión. Si el nombre definitivo es "Taller de IA", el
     cambio es una palabra en data/misiones.js y no hace falta
     tocar este archivo. */
  var MISION_DESTACADA = {
    id: "ia",
    ubicacion: "Stand Zona A",
    horario: "13:00hs",
    descripcion:
      "Aprendé sobre los distintos usos de la IA en la vida cotidiana. Preparate para armar tu propio chatbot."
  };

  function pintarSaludo(participante) {
    UI.$("#pasaporte-saludo").textContent =
      TEXTOS.pasaporteSaludo + ", " + participante.nombre + "!";
  }

    /* Dado el total acumulado de misiones hechas, calcula en qué
     nivel está la participante y cuántas lleva DENTRO de ese
     nivel (no el total). Es la pieza que faltaba: antes se
     calculaba el nivel bien, pero la fracción y la pista seguían
     mirando el total acumulado en vez de "cuánto llevás de este
     nivel", por eso la fracción no volvía a 0 al subir de nivel. */
  function calcularProgresoDeNivel(misionesHechas) {
    var nivel = Math.min(
      TOTAL_NIVELES,
      Math.floor(misionesHechas / MISIONES_POR_NIVEL) + 1
    );

    var hechasEnNivel = misionesHechas - (nivel - 1) * MISIONES_POR_NIVEL;
    hechasEnNivel = Math.max(0, Math.min(MISIONES_POR_NIVEL, hechasEnNivel));

    return { nivel: nivel, hechasEnNivel: hechasEnNivel, meta: MISIONES_POR_NIVEL };
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
    var progresoTotal = Datos.obtenerProgreso();
    var progreso = calcularProgresoDeNivel(progresoTotal.hechas);

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

  /* Pinta la tarjeta de la misión destacada. Si el id de
     MISION_DESTACADA no existe más en data/misiones.js (cambió
     el slug, por ejemplo), no rompe la pantalla: se esconde la
     tarjeta y listo. */
  function pintarMisionDestacada() {
    var tarjeta = UI.$("#destacada-tarjeta");
    var mision = UI.buscarMision(MISION_DESTACADA.id);

    if (!mision) {
      tarjeta.classList.add("oculto");
      return;
    }

    UI.$("#destacada-titulo").textContent = mision.nombre;
    UI.$("#destacada-texto").textContent = MISION_DESTACADA.descripcion;
    UI.$("#destacada-lugar").innerHTML =
      '<img src="../assets/iconos/localizacion-violeta.svg" alt="icono lugar">' +
      MISION_DESTACADA.ubicacion + " - " + MISION_DESTACADA.horario;
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