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
  const btnFiltros = PUMM.UI.$("#btn-filtros");
  const panelFiltros = PUMM.UI.$("#panel-filtros");
  const filtroHora = PUMM.UI.$("#filtro-hora");
  const filtroZona = PUMM.UI.$("#filtro-zona");
  const filtroOrden = PUMM.UI.$("#filtro-orden");

  // ⚠️ DATOS DE MENTIRA — sacar en cuanto data/misiones.js
  // tenga horaInicio, horaFin, descripcion, zona, imagen.
  // Por ahora los mezclo con window.PUMM.MISIONES por id
  // para no duplicar nombres ni ids.
  // ⚠️ Puse "Zona B" en una para poder probar el filtro de zona —
  // sacalo cuando lleguen los datos reales.
  const DETALLE_DEMO = {
    robotica:     { horaInicio: "14:00", horaFin: "16:00", zona: "Zona A", descripcion: "Aprende a mezclar beats desde cero. Equipamiento análogo y digital. ¡Trae tus propios tracks!", imagen: "../assets/img/taller-dj.png" },
    vr:           { horaInicio: "16:30", horaFin: "18:30", zona: "Zona B", descripcion: "Lleva el street art a las pantallas. Técnicas de ilustración vectorial y composición urbana.", imagen: "../assets/img/realidad-virtual.png" },
    programacion: { horaInicio: "16:30", horaFin: null,    zona: "Zona A", descripcion: "Masterclass intensiva de UI/UX. Domina las herramientas del futuro y construye prototipos funcionales en tiempo récord.", imagen: null },
  };

  function armarMisiones() {
    return window.PUMM.MISIONES.map(m => Object.assign(
      {}, m, DETALLE_DEMO[m.id] || {}
    ));
  }

  const misiones = armarMisiones();

  // Llena el <select> de zonas con las que realmente existen en los
  // datos, sin repetir. Así no hay que hardcodear "Zona A", "Zona B"
  // acá y desincronizarse si el equipo agrega una zona nueva.
  function poblarZonas() {
    const zonas = [...new Set(misiones.map(m => m.zona).filter(Boolean))].sort();
    zonas.forEach(zona => {
      const opcion = document.createElement("option");
      opcion.value = zona;
      opcion.textContent = zona;
      filtroZona.appendChild(opcion);
    });
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
          <p class="tarjeta__ubicacion">
            <svg class="tarjeta__icono-ubicacion" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C12.55 12 13.0208 11.8042 13.4125 11.4125C13.8042 11.0208 14 10.55 14 10C14 9.45 13.8042 8.97917 13.4125 8.5875C13.0208 8.19583 12.55 8 12 8C11.45 8 10.9792 8.19583 10.5875 8.5875C10.1958 8.97917 10 9.45 10 10C10 10.55 10.1958 11.0208 10.5875 11.4125C10.9792 11.8042 11.45 12 12 12ZM12 22C9.31667 19.7167 7.3125 17.5958 5.9875 15.6375C4.6625 13.6792 4 11.8667 4 10.2C4 7.7 4.80417 5.70833 6.4125 4.225C8.02083 2.74167 9.88333 2 12 2C14.1167 2 15.9792 2.74167 17.5875 4.225C19.1958 5.70833 20 7.7 20 10.2C20 11.8667 19.3375 13.6792 18.0125 15.6375C16.6875 17.5958 14.6833 19.7167 12 22Z" fill="currentColor"/>
            </svg>
            Stand: ${m.zona || ""}
          </p>
        </article>
      `;
    }).join("");
  }

  // Une el texto del buscador con los 3 filtros y vuelve a pintar.
  // Se llama desde CUALQUIER input que cambie (buscador, hora, zona,
  // orden), así siempre reflejan el estado combinado de todos juntos.
  function aplicarTodo() {
    const texto = buscador.value.toLowerCase();
    const horaMin = filtroHora.value; // "" si no se eligió nada
    const zona = filtroZona.value;
    const orden = filtroOrden.value;

    let resultado = misiones.filter(m => {
      const coincideTexto = m.nombre.toLowerCase().includes(texto);
      // Comparación de strings tipo "14:00" >= "13:00" funciona bien
      // porque el formato HH:MM con ceros a la izquierda ordena igual
      // que si fueran números.
      const coincideHora = !horaMin || m.horaInicio >= horaMin;
      const coincideZona = !zona || m.zona === zona;
      return coincideTexto && coincideHora && coincideZona;
    });

    if (orden === "alfabetico") {
      // localeCompare con "es" para que ordene bien acentos y ñ.
      resultado = [...resultado].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es")
      );
    }

    renderizar(resultado);
  }

  poblarZonas();
  renderizar(misiones);

  buscador.addEventListener("input", aplicarTodo);
  filtroHora.addEventListener("change", aplicarTodo);
  filtroZona.addEventListener("change", aplicarTodo);
  filtroOrden.addEventListener("change", aplicarTodo);

  // El botón "Filtros" solo muestra/oculta el panel. Los filtros en
  // sí se aplican en vivo con cada "change", no con un botón "Aplicar"
  // aparte — menos clics para la participante.
  btnFiltros.addEventListener("click", () => {
    panelFiltros.classList.toggle("oculto");
  });
});