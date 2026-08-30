/* ============================================================
   PANTALLA · REGISTRO
   ------------------------------------------------------------
   Valida el formulario (nombre y DNI), da de alta a la
   participante y, si sale bien, la manda al pasaporte.

   No decide por su cuenta si mostrarse: solo registra su
   inicializador con UI.alMostrar("index", ...). Quién decide qué
   pantalla va es el router de js/app.js (según haya sesión). Así
   el mismo código sirve en local (páginas separadas) y en el
   bundle de una sola página (ver js/ui.js → mostrarPantalla).
   ============================================================ */

(function () {
  "use strict";

  var UI = window.PUMM.UI;
  var Datos = window.PUMM.Datos;
  var TEXTOS = window.PUMM.TEXTOS;

  /* El DNI válido son exactamente 8 dígitos: nada de puntos,
     guiones ni espacios. \d{8} con anclas ^...$ rechaza también
     los largos distintos de 8. */
  var FORMATO_DNI = /^\d{8}$/;

  /* Email válido, chequeo pragmático: algo@algo.algo, sin espacios.
     No intentamos validar el RFC completo (imposible con una regex);
     alcanza para atajar errores de tipeo. El servidor solo pide que no
     esté vacío. */
  var FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* Íconos (SVG) que van dentro de los modales y sus botones.
     abrirModal inyecta 'icono' y 'texto' como HTML, así que los
     pasamos ya armados sin tener que tocar js/ui.js. */
  var ICONO_ERROR =
    '<img class="modal__icono-img" src="../assets/iconos/alerta-blanco.svg" alt="">';
  var ICONO_EXITO =
    '<img class="modal__icono-img" src="../assets/iconos/celebracion-negro.svg" alt="">';
  var ICONO_REINTENTO =
    '<img class="boton__icono" src="../assets/iconos/reintento-blanco.svg" alt="">';
  var ICONO_FLECHA =
    '<img class="boton__icono" src="../assets/iconos/flecha-der-blanca.svg" alt="">';

  /* --- Errores de campo ---
     Cada campo tiene su input y su <p class="campo__ayuda"> debajo.
     El borde fucsia lo pone .campo--error; el mensaje fucsia,
     .campo__ayuda--error. aria-invalid avisa al lector de pantalla. */

  function mostrarError(input, ayuda, mensaje) {
    input.classList.add("campo--error");
    input.setAttribute("aria-invalid", "true");
    ayuda.classList.add("campo__ayuda--error");
    ayuda.textContent = mensaje;
  }

  function limpiarError(input, ayuda) {
    input.classList.remove("campo--error");
    input.removeAttribute("aria-invalid");
    ayuda.classList.remove("campo__ayuda--error");
    ayuda.textContent = "";
  }

  /* --- Modales de resultado --- */

  function modalExito() {
    UI.abrirModal({
      tipo: "exito",
      icono: ICONO_EXITO,
      titulo: TEXTOS.registroParticipanteExitoTitulo,
      texto: TEXTOS.registroParticipanteExitoTexto,
      /* "Continuar" lleva al pasaporte: en local navega a
         pasaporte.html; en el bundle muestra la vista de pasaporte. */
      acciones: [
        { texto: TEXTOS.botonContinuar + " " + ICONO_FLECHA, pantalla: "pasaporte" }
      ]
    });
  }

  function modalError() {
    UI.abrirModal({
      tipo: "error",
      icono: ICONO_ERROR,
      titulo: TEXTOS.registroParticipanteErrorTitulo,
      texto: TEXTOS.registroParticipanteErrorTexto,
      acciones: [
        { texto: TEXTOS.botonReintentar + " " + ICONO_REINTENTO, cerrar: true }
      ]
    });
  }

  /* --- Inicializador de la pantalla de registro ---
     Lo corre el router cuando esta pantalla se muestra. Cablea el
     formulario una sola vez (guard por si se llamara de nuevo). */
  function initRegistro() {
    var form = UI.$("#form-registro");
    if (!form || form.getAttribute("data-listo") === "1") return;
    form.setAttribute("data-listo", "1");

    var boton = UI.$('button[type="submit"]', form);
    var textoBoton = boton ? boton.innerHTML : "";
    var inputEmail = UI.$("#email");
    var ayudaEmail = UI.$("#ayuda-email");
    var inputNombre = UI.$("#nombre");
    var ayudaNombre = UI.$("#ayuda-nombre");
    var inputDni = UI.$("#dni");
    var ayudaDni = UI.$("#ayuda-dni");

    /* Al tocar un campo con error, lo limpiamos: el mensaje ya
       cumplió su función y molesta si se queda mientras corrige. */
    inputEmail.addEventListener("input", function () {
      limpiarError(inputEmail, ayudaEmail);
    });
    inputNombre.addEventListener("input", function () {
      limpiarError(inputNombre, ayudaNombre);
    });
    inputDni.addEventListener("input", function () {
      limpiarError(inputDni, ayudaDni);
    });

    form.addEventListener("submit", function (evento) {
      /* Cortamos el envío nativo: validamos y decidimos nosotras. */
      evento.preventDefault();

      /* Empezamos en limpio para no acumular mensajes viejos. */
      limpiarError(inputEmail, ayudaEmail);
      limpiarError(inputNombre, ayudaNombre);
      limpiarError(inputDni, ayudaDni);

      var email = inputEmail.value.trim();
      var nombre = inputNombre.value.trim();
      var dni = inputDni.value.trim();
      var hayError = false;

      if (email === "") {
        mostrarError(inputEmail, ayudaEmail, TEXTOS.emailVacio);
        hayError = true;
      } else if (!FORMATO_EMAIL.test(email)) {
        mostrarError(inputEmail, ayudaEmail, TEXTOS.emailInvalido);
        hayError = true;
      }

      if (nombre === "") {
        mostrarError(inputNombre, ayudaNombre, TEXTOS.nombreVacio);
        hayError = true;
      }

      if (dni === "") {
        mostrarError(inputDni, ayudaDni, TEXTOS.dniVacio);
        hayError = true;
      } else if (!FORMATO_DNI.test(dni)) {
        mostrarError(inputDni, ayudaDni, TEXTOS.dniInvalido);
        hayError = true;
      }

      /* Mostramos TODOS los campos que fallan, no solo el primero,
         y recién ahí cortamos. */
      if (hayError) return;

      /* El guardado puede ir al servidor (Apps Script), así que es
         asíncrono. Bloqueamos el botón mientras esperamos para que no
         se envíe dos veces. */
      if (boton) {
        boton.disabled = true;
        boton.textContent = "Registrando…";
      }

      Datos.registrarParticipante({ email: email, nombre: nombre, dni: dni }).then(function (res) {
        if (res.ok) {
          modalExito();
        } else {
          modalError();
          if (boton) {
            boton.disabled = false;
            boton.innerHTML = textoBoton;
          }
        }
      });
    });
  }

  UI.alMostrar("index", initRegistro);
})();
