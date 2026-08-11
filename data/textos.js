/* ============================================================
   DATOS · TEXTOS DE LA APP (microcopy)
   ------------------------------------------------------------
   Todos los mensajes que lee una participante están acá y no
   sueltos en el código.

   ¿Por qué centralizarlos?
     · Principio del producto: "lenguaje cercano en vez de
       mensajes técnicos". Teniéndolos juntos se nota si a una
       pantalla se le escapó un "Error 404".
     · El equipo de comunicación de CET puede revisar el tono
       leyendo UN archivo, sin abrir el código.
     · Si mañana hay que traducirlo (PUMM llega a toda América
       Latina), ya está todo en un solo lugar.

   REGLA: si vas a escribir un texto visible dentro de un .js
   de página, agregalo acá primero.
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.TEXTOS = {
  /* --- Activación --- */
  codigoInvalidoTitulo: "Ese código no nos suena",
  codigoInvalidoTexto:
    "Revisá que esté igual al de tu acreditación. Si sigue sin andar, " +
    "acercate al stand de ayuda y lo resolvemos.",
  codigoVacio: "Escribí tu código para empezar.",

  /* --- Registro de actividad --- */
  registroExitoTitulo: "¡Listo! Quedó registrado",
  registroExitoTexto: "Ya podés seguir disfrutando la actividad.",

  yaRegistradaTitulo: "Esta ya la tenías",
  yaRegistradaTexto:
    "Registraste esta actividad hace un rato. Está guardada en tu pasaporte.",

  noActivadoTitulo: "Todavía no activaste tu pasaporte",
  noActivadoTexto:
    "Activalo con el código de tu acreditación y volvé a escanear el QR.",

  actividadDesconocidaTitulo: "No encontramos esa actividad",
  actividadDesconocidaTexto:
    "Puede que el QR esté dañado. Avisale a alguien del equipo y seguimos.",

  /* --- Recorrido completado --- */
  completadoTitulo: "¡Completaste el recorrido!",
  completadoTexto: "Recorriste PUMM 2026 de punta a punta.",

  /* --- Estados vacíos --- */
  sinActividades:
    "Todavía no registraste ninguna actividad. Escaneá el QR del primer " +
    "espacio al que entres y arrancamos.",
  sinInsignias:
    "Tus insignias van a aparecer acá a medida que recorras el evento.",

  /* --- Botones --- */
  botonActivar: "Activar mi pasaporte",
  botonCerrar: "Entendido",
  botonVerPasaporte: "Ver mi pasaporte",
  botonVerActividades: "Ver actividades"
};
