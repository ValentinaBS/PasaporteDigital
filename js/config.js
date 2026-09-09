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
  CLAVE_CODIGO: "pumm.codigo",
  CLAVE_REGISTROS: "pumm.registros",
  CLAVE_PARTICIPANTE: "pumm.participante",

  /* Nombre del parámetro que llevan los QR.
     Un QR apunta a:  .../html/nueva-mision.html?mision=labs
     El valor tiene que coincidir con un id de data/misiones.js */
  PARAM_QR: "mision",

  /* Formato esperado del código de acreditación.
     ⚠️ HIPÓTESIS SIN VALIDAR: hay que confirmar con el equipo
     de acreditación cómo son los códigos reales antes del
     evento. Si cambia el formato, se cambia acá y nada más. */
  FORMATO_CODIGO: /^PUMM-2026-[A-Z0-9]{2,6}$/
};
