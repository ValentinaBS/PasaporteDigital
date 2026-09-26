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

  /* Inicializadores por pantalla. Cada pantalla registra el suyo con
     alMostrar("clave", fn); mostrarPantalla lo ejecuta cuando esa
     pantalla se vuelve visible. Ver la explicación en mostrarPantalla. */
  var inits = {};

    /* --- Pantalla de carga ---
     Contador (n) en vez de un booleano: si dos pedidos corren a la
     vez, la pantalla se cierra recién cuando terminaron los dos. */
  var carga = {
    n: 0,
    visible: false,
    desde: 0,
    timerMostrar: null,
    timerOcultar: null
  };

  function elementoCarga() {
    var el = document.getElementById("carga");
    if (el) return el;

    el = document.createElement("div");
    el.id = "carga";
    el.className = "carga oculto";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.innerHTML =
      '<div class="carga__tarjeta">' +
        '<div class="franja-ajedrez carga__franja" aria-hidden="true"></div>' +
        '<div class="carga__cuerpo">' +
          '<div class="carga__cuadros" aria-hidden="true">' +
            '<span class="carga__cuadro carga__cuadro--amarillo"></span>' +
            '<span class="carga__cuadro carga__cuadro--cian"></span>' +
            '<span class="carga__cuadro carga__cuadro--fucsia"></span>' +
          "</div>" +
          '<p class="carga__titulo">Cargando</p>' +
          '<p class="carga__mensaje"></p>' +
        "</div>" +
      "</div>";
    document.body.appendChild(el);
    return el;
  }

  function mostrarCarga(mensaje) {
    var CONFIG = window.PUMM.CONFIG || {};
    var el = elementoCarga();

    carga.n++;
    el.querySelector(".carga__mensaje").textContent =
      mensaje || window.PUMM.TEXTOS.cargando;

    /* Si estaba por cerrarse (tiempo mínimo), la dejamos abierta. */
    if (carga.timerOcultar) {
      clearTimeout(carga.timerOcultar);
      carga.timerOcultar = null;
    }
    if (carga.visible || carga.timerMostrar) return;

    carga.timerMostrar = setTimeout(function () {
      carga.timerMostrar = null;
      carga.visible = true;
      carga.desde = Date.now();
      el.classList.remove("oculto");
    }, CONFIG.CARGA_DEMORA_MS || 200);
  }

  function ocultarCarga() {
    var CONFIG = window.PUMM.CONFIG || {};

    if (carga.n > 0) carga.n--;
    if (carga.n > 0) return;               // todavía hay otro pedido en curso

    /* Terminó antes de la demora: nunca llegó a mostrarse. */
    if (carga.timerMostrar) {
      clearTimeout(carga.timerMostrar);
      carga.timerMostrar = null;
      return;
    }
    if (!carga.visible) return;

    var minimo = CONFIG.CARGA_MIN_MS || 400;
    var restante = Math.max(0, minimo - (Date.now() - carga.desde));

    carga.timerOcultar = setTimeout(function () {
      carga.timerOcultar = null;
      carga.visible = false;
      elementoCarga().classList.add("oculto");
    }, restante);
  }

  /* Atajo para lo más común: mostrar la carga mientras dura una
     Promise y cerrarla al terminar (bien o mal). Devuelve la misma
     Promise, así que se puede seguir encadenando con .then(). */
  function conCarga(promesa, mensaje) {
    mostrarCarga(mensaje);
    return promesa.then(
      function (resultado) { ocultarCarga(); return resultado; },
      function (error) { ocultarCarga(); throw error; }
    );
  }

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
       Ej: en nueva-mision.html?mision=labs
           leerParametro("mision")  →  "labs"

       Fallback Apps Script: ahí el ?mision=… del /exec no llega a
       window.location (la app corre en un iframe sandbox), así que el
       servidor inyecta el id del QR en window.PUMM.MISION_QR (ver
       scripts/apps-script/Codigo.gs → doGet y scripts/empaquetar.js).
       Solo aplica al parámetro del QR y se ignora si el template quedó
       sin evaluar (en ese caso el valor contiene un "<"). */
    leerParametro: function (nombre) {
      var valor = new URLSearchParams(window.location.search).get(nombre);
      if (valor) return valor;

      var paramQR = (window.PUMM.CONFIG || {}).PARAM_QR;
      var inyectado = window.PUMM.MISION_QR;
      if (nombre === paramQR && inyectado && inyectado.indexOf("<") === -1) {
        return inyectado;
      }
      return null;
    },

    /* --- Navegación entre pantallas (local vs bundle) ---
       El proyecto tiene DOS modos y este helper esconde la diferencia:

       · LOCAL: cada pantalla es un .html separado (index.html,
         pasaporte.html). "Ir a otra pantalla" es navegar de verdad.
       · BUNDLE: el build une todo en un solo Index.html donde cada
         pantalla es un div con atributo data-vista que se muestra u
         oculta. "Ir a otra pantalla" es mostrar una y ocultar las otras.

       Cada pantalla registra su inicializador con alMostrar(clave, fn)
       y mostrarPantalla(clave) lo ejecuta al mostrarla. Así el mismo
       código sirve para los dos modos sin cambiar nada. */

    alMostrar: function (clave, fn) {
      inits[clave] = fn;
    },

    mostrarCarga: mostrarCarga,
    ocultarCarga: ocultarCarga,
    conCarga: conCarga,

    mostrarPantalla: function (clave) {
      var vistas = this.$$("[data-vista]");

      /* Modo BUNDLE: hay vistas en el DOM → mostrar/ocultar. */
      if (vistas.length) {
        vistas.forEach(function (v) {
          v.classList.toggle("oculto", v.getAttribute("data-vista") !== clave);
        });
        if (inits[clave]) inits[clave]();
        return;
      }

      /* Modo LOCAL: páginas separadas. Si ya estamos en la pantalla
         pedida, solo inicializamos; si no, navegamos al archivo. */
      var actual = document.body.getAttribute("data-pagina");
      if (actual === clave) {
        if (inits[clave]) inits[clave]();
        return;
      }
      var archivo = clave === "index" ? "index.html" : clave + ".html";
      (window.top || window).location.replace(archivo);
    },

    /* Abre el modal de la página con el contenido que le pasemos.
       Cada HTML tiene UN <dialog id="modal"> vacío y lo rellenamos
       desde acá: así los distintos estados (éxito, error, aviso)
       reusan la misma pieza.

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
        /* icono opcional (string HTML, ej. un <img>): va antes del texto,
           el gap del .boton lo separa. */
        var contenido = (a.icono || "") + a.texto;
        /* Ir a otra pantalla del flujo (registro/pasaporte): se resuelve
           con mostrarPantalla, que navega en local y cambia de vista en
           el bundle. Cierra el modal antes de moverse. */
        if (a.pantalla) {
          return '<button class="' + clase + ' boton--ancho" data-ir-pantalla="' +
                 a.pantalla + '">' + contenido + "</button>";
        }
        if (a.href) {
          return '<a class="' + clase + ' boton--ancho" href="' + a.href + '">' +
                 contenido + "</a>";
        }
        return '<button class="' + clase + ' boton--ancho" data-cerrar-modal>' +
               contenido + "</button>";
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

      var self = this;
      this.$$("[data-ir-pantalla]", dialogo).forEach(function (boton) {
        boton.addEventListener("click", function () {
          dialogo.close();
          self.mostrarPantalla(boton.getAttribute("data-ir-pantalla"));
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

    /* Busca una misión por id en data/misiones.js. */
    buscarMision: function (id) {
      return window.PUMM.MISIONES.filter(function (a) {
        return a.id === id;
      })[0] || null;
    },

    /* Manda a la pantalla de registro (html/index.html) si la
       participante todavía no tiene pasaporte. Devuelve true si
       puede seguir.

       Se llama al principio de cada pantalla protegida. Es una
       comodidad de UX, NO una medida de seguridad: cualquiera
       puede saltearla desde la consola. La validación de verdad
       tiene que estar en el backend.

       ⚠️ NO la llames desde html/index.html: es la pantalla a la
       que redirige, así que entraría en un bucle consigo misma.
     */
    exigirRegistro: function () {
      if (!window.PUMM.Datos.estaRegistrada()) {
        window.location.href = "index.html";
        return false;
      }
      return true;
    }
  };
})();
