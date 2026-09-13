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
   Se apoyan en MISIONES_PARA_COMPLETAR (data/misiones.js), hoy 10.

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
    id: "curiosa-tech",
    nombre: "Curiosa tech",
    icono: "💻",
    descripcion: "Visitaste 3 espacios del recorrido.",
    misiones: 3,
    dificultad: "media"
  },
  {
    id: "mitad-camino",
    nombre: "Mitad de camino",
    icono: "⚡",
    descripcion: "Llegaste a 5 misiones.",
    misiones: 5,
    dificultad: "media"
  },
  {
    id: "maratonista",
    nombre: "Maratonista",
    icono: "🔥",
    descripcion: "Registraste 8 misiones.",
    misiones: 8,
    dificultad: "dificil"
  },
  {
    id: "recorrido",
    nombre: "Recorrido completo",
    icono: "🏆",
    descripcion: "Completaste el recorrido PUMM 2026.",
    misiones: 10,
    dificultad: "dificil"
  }
];
