/* ============================================================
   PANTALLA · REGISTRO
   ------------------------------------------------------------
   Valida el formulario (nombre y DNI), da de alta a la
   participante y muestra el modal de éxito o de error.

   ⚠️ Esta pantalla NO llama a UI.exigirRegistro(): es justamente
   la pantalla a la que esa función redirige, así que entraría en
   un bucle consigo misma.
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
      acciones: [
        { texto: TEXTOS.botonContinuar + " " + ICONO_FLECHA, href: "pasaporte.html" }
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

  /* --- Arranque --- */

  document.addEventListener("DOMContentLoaded", function () {
    var form = UI.$("#form-registro");
    if (!form) return;

    var inputNombre = UI.$("#nombre");
    var ayudaNombre = UI.$("#ayuda-nombre");
    var inputDni = UI.$("#dni");
    var ayudaDni = UI.$("#ayuda-dni");

    /* Al tocar un campo con error, lo limpiamos: el mensaje ya
       cumplió su función y molesta si se queda mientras corrige. */
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
      limpiarError(inputNombre, ayudaNombre);
      limpiarError(inputDni, ayudaDni);

      var nombre = inputNombre.value.trim();
      var dni = inputDni.value.trim();
      var hayError = false;

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

      var resultado = Datos.registrarParticipante({ nombre: nombre, dni: dni });

      if (resultado.ok) {
        modalExito();
      } else {
        modalError();
      }
    });
  });
})();
