/* ============================================================
   CONFIG  ·  Constantes y "perillas" del proyecto
   ------------------------------------------------------------
   Todo lo que puede cambiar entre desarrollo y producción vive
   acá. Si tenés que tocar una URL o un nombre de clave en
   varios archivos, es que faltaba una constante en este.

   Se carga PRIMERO, antes que cualquier otro .js nuestro.
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.CONFIG = {
  /* --- Modo de trabajo ---
     "demo"  → los datos viven en el navegador (localStorage).
               Sirve para desarrollar sin backend.
     "api"   → los datos viven en el servidor. Todavía no existe.

     ⚠️ Recordá: uno de los principios del producto es que el
     progreso vive en la base de datos y NO en el dispositivo,
     justamente para resolver el cambio de celular. El modo
     "demo" rompe ese principio a propósito, para poder avanzar
     con las pantallas mientras el backend no existe.
     No se entrega así al evento. */
  MODO: "demo",

  /* Base de la API. Se completa cuando exista el backend. */
  API_URL: "",

  /* Claves de localStorage. Con prefijo para no chocar con
     nada más que viva en el mismo dominio de la web de CET. */
  CLAVE_REGISTROS: "pumm.registros",
  CLAVE_PARTICIPANTE: "pumm.participante",
  CLAVE_PROGRESO: "pumm.progreso",

  /* Nombre del parámetro que llevan los QR.
     En local el QR apunta a:  .../html/nueva-mision.html?mision=robotica
     En el bundle (Apps Script) apunta a la URL de la app con ?mision=…,
     y js/app.js → rutearFlujo abre la vista nueva-mision con ese id.
     El valor tiene que coincidir con un id de data/misiones.js */
  PARAM_QR: "mision",

    /* Pantalla de carga (js/ui.js → mostrarCarga).
     DEMORA: no se muestra si la respuesta llega antes (evita el
     parpadeo en cargas rápidas). MIN: una vez visible, se queda al
     menos este tiempo para que no aparezca y desaparezca de golpe. */
  CARGA_DEMORA_MS: 200,
  CARGA_MIN_MS: 400,

  /* El certificado de participación se habilita recién a esta
     fecha y hora (hora de Argentina, UTC-3). Antes, el botón de
     la pantalla de Logros queda oculto.
     ⚠️ Formato ISO: mes y día SIEMPRE con dos dígitos ("08", no "8"),
     si no new Date() lo lee como Invalid Date y el botón no aparece. */
  FECHA_CERTIFICADO: "2026-10-14T16:00:00-03:00"
};
