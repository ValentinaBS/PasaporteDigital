/* ============================================================
   LÓGICA DE LA PÁGINA · MIS LOGROS
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  renderizarPantallaLogros();
});

function renderizarPantallaLogros() {
  // 1. Obtener datos desde datos.js
  var progreso = window.PUMM.obtenerProgreso();
  var insignias = window.PUMM.obtenerInsignias();

  // 2. Actualizar Porcentaje y Barra
  var barraRelleno = document.getElementById("barra-relleno");
  var barraContenedor = document.getElementById("barra-progreso");
  var porcentajeTexto = document.getElementById("porcentaje-texto");
  var mensajeProgreso = document.getElementById("mensaje-progreso");
  var contenedorFelicitaciones = document.getElementById(
    "contenedor-felicitaciones",
  );

  porcentajeTexto.textContent = "(" + progreso.porcentaje + "%)";
  barraRelleno.style.width = progreso.porcentaje + "%";
  barraContenedor.setAttribute("aria-valuenow", progreso.porcentaje);

  // 3. Evaluar Nivel de Progreso y Actualizar Mensaje Personalizado
  if (progreso.porcentaje === 0) {
    mensajeProgreso.textContent =
      "¡Comenzá tu recorrido! Registrá tu primera misión para desbloquear insignias.";
  } else if (progreso.porcentaje > 0 && progreso.porcentaje < 50) {
    mensajeProgreso.textContent =
      "¡Buen comienzo! Seguí completando misiones para sumar más logros.";
  } else if (progreso.porcentaje >= 50 && progreso.porcentaje < 100) {
    mensajeProgreso.textContent =
      "¡Sigue así! Estás a mitad de camino para desbloquear todas las recompensas especiales del PUMM 2026.";
  } else if (progreso.porcentaje >= 100) {
    mensajeProgreso.textContent =
      "¡LO LOGRASTE! 🎉 Completaste todo el recorrido del PUMM 2026.";
    contenedorFelicitaciones.classList.remove("oculto"); // Muestra el botón a felicitaciones.html
  }

  // 4. Renderizar las Tarjetas de Insignias
  var contenedorLista = document.getElementById("lista-insignias");
  contenedorLista.innerHTML = ""; // Limpiar lista

  insignias.forEach(function (insignia) {
    var esDesbloqueada = insignia.desbloqueada;

    var article = document.createElement("article");
    article.className =
      "tarjeta-insignia " +
      (esDesbloqueada
        ? "tarjeta-insignia--desbloqueada"
        : "tarjeta-insignia--bloqueada");

    article.innerHTML = `
      <div class="tarjeta-insignia__icono-contenedor">
        <span>${insignia.icono}</span>
      </div>
      <div class="tarjeta-insignia__info">
        <h3 class="tarjeta-insignia__titulo">${insignia.nombre}</h3>
        <p class="tarjeta-insignia__descripcion">${insignia.descripcion}</p>
      </div>
      <div class="tarjeta-insignia__estado">
        ${
          esDesbloqueada
            ? '<div class="tarjeta-insignia__check" title="Desbloqueado">✓</div>'
            : '<span class="tarjeta-insignia__candado" title="Bloqueado">🔒</span>'
        }
      </div>
    `;

    contenedorLista.appendChild(article);
  });
}

/* ============================================================
   LÓGICA DE LA PÁGINA · MIS LOGROS
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  actualizarPantallaLogros();
});

function actualizarPantallaLogros() {
  // 1. Obtener datos de progreso e insignias
  var progreso = window.PUMM.obtenerProgreso();
  var insignias = window.PUMM.obtenerInsignias();

  var porcentaje = progreso.porcentaje;

  // 2. Elementos del DOM
  var mensajeEl = document.getElementById("mensaje-progreso");
  var porcentajeTextoEl = document.getElementById("porcentaje-texto");
  var barraRellenoEl = document.getElementById("barra-relleno");
  var barraContenedor = document.getElementById("barra-progreso");
  var contenedorFelicitaciones = document.getElementById(
    "contenedor-felicitaciones",
  );
  var contenedorLista = document.getElementById("lista-insignias");

  // 3. Renderizar barra y porcentaje
  porcentajeTextoEl.textContent = "(" + porcentaje + "%)";
  barraRellenoEl.style.width = porcentaje + "%";
  if (barraContenedor) {
    barraContenedor.setAttribute("aria-valuenow", porcentaje);
  }

  // 4. Lógica de mensajes dinámicos según el % alcanzado
  if (porcentaje === 0) {
    mensajeEl.textContent =
      "¡Comenzá tu recorrido! Registrá tu primera misión para desbloquear insignias.";
  } else if (porcentaje > 0 && porcentaje < 50) {
    mensajeEl.textContent =
      "¡Buen comienzo! Seguí completando actividades para sumar más logros.";
  } else if (porcentaje >= 50 && porcentaje < 100) {
    mensajeEl.textContent =
      "¡Sigue así! Estás a mitad de camino para desbloquear todas las recompensas especiales del PUMM 2026.";
  } else if (porcentaje >= 100) {
    mensajeEl.textContent =
      "¡LO LOGRASTE! 🎉 Completaste todas las misiones del recorrido PUMM 2026.";
    if (contenedorFelicitaciones) {
      contenedorFelicitaciones.classList.remove("oculto"); // Muestra el botón a felicitaciones.html
    }
  }

  // 5. Renderizar lista de tarjetas/insignias desde insignias.js
  if (!contenedorLista) return;
  contenedorLista.innerHTML = "";

  insignias.forEach(function (insignia, index) {
    var esDesbloqueada = insignia.desbloqueada;

    // Determinar clase de fondo para variar estéticamente (como en la maqueta)
    var claseFondo = "tarjeta-logro--bloqueada";
    if (esDesbloqueada) {
      claseFondo =
        index % 2 === 0
          ? "tarjeta-logro--desbloqueada"
          : "tarjeta-logro--amarilla";
    }

    var article = document.createElement("article");
    article.className = "tarjeta-logro " + claseFondo;

    article.innerHTML = `
      <div class="tarjeta-logro__icono-box">
        <span>${insignia.icono}</span>
      </div>
      <div class="tarjeta-logro__contenido">
        <h3 class="tarjeta-logro__titulo">${insignia.nombre}</h3>
        <p class="tarjeta-logro__desc">${insignia.descripcion}</p>
      </div>
      <div class="tarjeta-logro__estado">
        ${
          esDesbloqueada
            ? '<div class="tarjeta-logro__check" aria-label="Desbloqueada">✓</div>'
            : '<span class="tarjeta-logro__candado" aria-label="Bloqueada">🔒</span>'
        }
      </div>
    `;

    contenedorLista.appendChild(article);
  });
}
