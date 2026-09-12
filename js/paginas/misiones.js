/* ============================================================
   PLANTILLA DE LÓGICA DE PANTALLA  ·  copiar, no editar
   ------------------------------------------------------------
   Molde para el JS de una pantalla. Copialo, renombralo con el
   mismo nombre que tu .html (pasaporte.html → pasaporte.js) y
   enlazalo desde el <script> del final de tu HTML.

   REGLA: en este archivo va SOLO lo que pasa en esta pantalla.
     · ¿Lo vas a necesitar en otra pantalla?  → js/ui.js
     · ¿Lee o guarda información?             → js/datos.js
     · ¿Es un texto que lee una participante? → data/textos.js
     · ¿Es una URL o constante de entorno?    → js/config.js
   ============================================================ */


document.addEventListener("DOMContentLoaded", () => {
  const contenedor = PUMM.UI.$("#lista-misiones");
  const buscador = PUMM.UI.$("#buscador-misiones");

  // ⚠️ DATOS DE MENTIRA — sacar en cuanto data/misiones.js
  // tenga horaInicio, horaFin, descripcion, zona, imagen.
  // Por ahora los mezclo con window.PUMM.MISIONES por id
  // para no duplicar nombres ni ids.
  const DETALLE_DEMO = {
    robotica:     { horaInicio: "14:00", horaFin: "16:00", zona: "Zona A", descripcion: "Aprendé a mezclar beats desde cero.", imagen: null },
    vr:           { horaInicio: "16:30", horaFin: "18:30", zona: "Zona A", descripcion: "Llevá el street art a las pantallas.", imagen: null },
    programacion: { horaInicio: "16:30", horaFin: null,    zona: "Zona A", descripcion: "Masterclass intensiva de UI/UX.", imagen: null },
  };

  function armarMisiones() {
    return window.PUMM.MISIONES.map(m => Object.assign(
      {}, m, DETALLE_DEMO[m.id] || {}
    ));
  }

  function renderizar(lista) {
    contenedor.innerHTML = lista.map(m => {
      const hecha = PUMM.Datos.yaRegistro(m.id);
      const destacada = !m.imagen; // ⚠️ hipótesis: sin imagen = tarjeta destacada
      const clases = ["tarjeta"];
      if (hecha) clases.push("tarjeta--hecha");
      else if (destacada) clases.push("tarjeta--destacada");

      const horario = m.horaFin
        ? `${m.horaInicio} - ${m.horaFin}`
        : `${m.horaInicio}hs`;

      return `
        <article class="${clases.join(" ")}">
          ${m.imagen ? `<img class="tarjeta__imagen" src="${m.imagen}" alt="">` : ""}
          <div class="fila-entre">
            <h2 class="tarjeta__titulo">${m.nombre}</h2>
            <span class="tarjeta__horario">${horario}</span>
          </div>
          <p class="tarjeta__descripcion">${m.descripcion || ""}</p>
          <p class="tarjeta__ubicacion">📍 Stand: ${m.zona || ""}</p>
        </article>
      `;
    }).join("");
  }

  const misiones = armarMisiones();
  renderizar(misiones);

  buscador.addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();
    renderizar(misiones.filter(m => m.nombre.toLowerCase().includes(texto)));
  });

  // ⚠️ FILTROS todavía no tiene definición de producto
  // (¿filtra por zona? ¿por horario?). Dejo el listener vacío
  // para no bloquear el resto de la pantalla.
  PUMM.UI.$("#btn-filtros").addEventListener("click", () => {
    console.log("TODO: filtros — falta definición de producto");
  });
});