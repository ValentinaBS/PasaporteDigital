/* ============================================================
   DATOS · PARTICIPANTES DE PRUEBA
   ------------------------------------------------------------
   ⚠️ SOLO PARA DESARROLLO. Estos códigos son inventados.

   En producción los códigos salen de la acreditación y se
   validan contra el backend (hipótesis a validar: que cada
   participante reciba un código único al acreditarse, y que
   Salesforce pueda exportar los registros confirmados).

   ⚠️ NUNCA poner acá datos reales de participantes. Son
   menores de edad y este archivo se sube a Drive y a la web.
   Privacidad por diseño: si un dato no hace falta para que la
   app funcione, no lo guardamos.

   Códigos para probar:
     PUMM-2026-A1   → participante nueva, sin actividades
     PUMM-2026-B2   → participante con recorrido empezado
     cualquier otro → dispara el modal de "código inválido"
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.PARTICIPANTES_DEMO = [
  {
    codigo: "PUMM-2026-A1",
    nombre: "Participante Demo",
    dni: "12345678"
  },
  {
    codigo: "PUMM-2026-B2",
    nombre: "Participante Demo 2",
    dni: "87654321"
  }
];
