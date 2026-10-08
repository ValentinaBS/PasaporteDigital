/* ============================================================
   DATOS · LOGROS
   ------------------------------------------------------------
   Cada logro se desbloquea por una de dos vías:
     · porRegistro: true   → con solo registrarse (estaRegistrada()).
     · misiones: <número>   → al llegar a esa cantidad de misiones
                              registradas (obtenerProgreso().hechas).
   El desbloqueo se calcula en js/datos.js → obtenerLogros().

   ⚠️ Los umbrales son PROVISIONALES: los define Producción. Están
   acá, en un solo lugar, para que cambiarlos sea tocar una línea.
   Se apoyan en MISIONES_PARA_COMPLETAR (data/misiones.js).

   `dificultad` colorea el borde de la tarjeta en la pantalla de
   Logros: "facil" (violeta), "media" (amarillo), "dificil" (rosa).

   Mismo criterio que misiones.js: es .js y no .json a propósito.
   La explicación completa está en ese archivo.
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.LOGROS = [
  {
    id: "primer-paso",
    nombre: "Primer paso",
    icono: "👣",
    descripcion: "Te registraste en PUMM 2026.",
    porRegistro: true,
    dificultad: "facil"
  },
  {
    id: "exploradora",
    nombre: "Exploradora",
    icono: "🧭",
    descripcion: "Registraste tu primera misión.",
    misiones: 1,
    dificultad: "facil"
  },
  {
    id: "mitad-camino",
    nombre: "Mitad de camino",
    icono: "⚡",
    descripcion: "Llegaste a 4 misiones.",
    misiones: 4,
    dificultad: "media"
  },
  {
    id: "maratonista",
    nombre: "Maratonista",
    icono: "🔥",
    descripcion: "Registraste 6 misiones.",
    misiones: 6,
    dificultad: "dificil"
  },
  {
    id: "recorrido",
    nombre: "Recorrido completo",
    icono: "🏆",
    descripcion: "Completaste todas las misiones del PUMM 2026.",
    misiones: window.PUMM.MISIONES_PARA_COMPLETAR,  // todas
    dificultad: "dificil"
  }
];
