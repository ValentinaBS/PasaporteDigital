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

  /* ⚠️ HIPÓTESIS SIN VALIDAR: "nivel" es un concepto del diseño
     (Figma) que todavía no existe en data/misiones.js ni en
     Datos.obtenerProgreso(). Hasta que Producto defina la regla
     real (¿cada cuántas misiones se sube? ¿todos los niveles
     valen lo mismo?), lo derivamos acá con un número fijo.
     Cuando exista la regla de verdad, esto se reemplaza por lo
     que devuelva Datos — ninguna otra pantalla depende de esto. */
  var MISIONES_POR_NIVEL = 3;

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
      "Aprendé sobre los distintos usos de la IA en la vida " +
      "cotidiana. Preparate para armar tu propio chatbot."
  };

  function pintarSaludo(participante) {
    UI.$("#pasaporte-saludo").textContent =
      TEXTOS.pasaporteSaludo + ", " + participante.nombre + "!";
  }

  /* Pinta el nivel, la fracción (hechas/meta) y la pista de
     pasos: un círculo por misión, tildado si ya la registró. */
  function pintarProgreso() {
    var progreso = Datos.obtenerProgreso();

    UI.$("#progreso-nivel-numero").textContent = calcularNivel(progreso.hechas);
    UI.$("#progreso-fraccion").textContent = progreso.hechas + "/" + progreso.meta;

    var pista = UI.$("#progreso-pista");
    pista.innerHTML = ""; // por si initPasaporte corriera dos veces

    window.PUMM.MISIONES.forEach(function (mision, indice) {
      var hecha = Datos.yaRegistro(mision.id);

      var paso = document.createElement("span");
      paso.className = "paso" + (hecha ? " paso--hecho" : "");
      if (hecha) {
        var check = document.createElement("img");
        check.src = "../assets/iconos/check-blanco.svg";
        check.alt = "Completada";
        check.className = "paso__check";
        paso.appendChild(check);
      } else {
        paso.appendChild(document.createTextNode(String(indice + 1)));
      }

      /* Texto para lectores de pantalla: el ✓ o el número solos
         no dicen de qué misión se trata. */
      var etiqueta = document.createElement("span");
      etiqueta.className = "solo-lectores";
      etiqueta.textContent =
        (hecha ? "Misión completada: " : "Misión pendiente: ") + mision.nombre;
      paso.appendChild(etiqueta);

      pista.appendChild(paso);
    });
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

  function initPasaporte() {
    var participante = Datos.obtenerParticipante();

    /* Defensa: si llegara sin sesión, al registro. */
    if (!participante || !participante.nombre) {
      UI.mostrarPantalla("index");
      return;
    }

    pintarSaludo(participante);
    pintarProgreso();
    pintarMisionDestacada();
  }

  UI.alMostrar("pasaporte", initPasaporte);
})();