/* ============================================================
   DATOS · INSIGNIAS
   ------------------------------------------------------------
   Cada insignia se desbloquea al registrar la misión que la
   referencia en data/misiones.js (campo "insignia").
   La de recorrido completo se desbloquea por cantidad.

   Mismo criterio que misiones.js: es .js y no .json a
   propósito. La explicación completa está en ese archivo.
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.INSIGNIAS = [
  {
    id: "creadora",
    nombre: "Modo creadora ON",
    icono: "🚀",
    descripcion: "Pasaste de usar tecnología a crearla.",
  },
  {
    id: "equipo",
    nombre: "En equipo",
    icono: "🤝",
    descripcion: "Trabajaste tu idea con otras chicas.",
  },
  {
    id: "desafio",
    nombre: "Sin miedo al desafío",
    icono: "⚡",
    descripcion: "Le entraste a un problema real.",
  },
  {
    id: "curiosa",
    nombre: "Curiosa",
    icono: "🔍",
    descripcion: "Fuiste a escuchar y preguntar.",
  },
  {
    id: "comunidad",
    nombre: "Comunidad",
    icono: "💜",
    descripcion: "Sos parte de Chicas en Tecnología.",
  },
  {
    id: "recorrido",
    nombre: "Recorrido completo",
    icono: "🏆",
    descripcion: "Completaste el recorrido PUMM 2026.",
    /* Esta no viene de una misión puntual: se otorga al
       llegar a MISIONES_PARA_COMPLETAR. */
    porCantidad: true,
  },
];
