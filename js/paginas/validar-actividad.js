document.addEventListener('DOMContentLoaded', () => {
    var UI = window.PUMM?.UI;

    const toggleBtn = document.getElementById('toggle-btn');
    const statusMessage = document.getElementById('status-message');

    let isChecked = false;
    toggleBtn?.addEventListener('click', () => {
        isChecked = !isChecked;

        if (isChecked) {
            toggleBtn.style.background = "var(--color-secundario) url('../assets/iconos/pulgar-like.svg') no-repeat center / 70%";
            statusMessage.textContent = ' ';
        } else {
            toggleBtn.textContent = '';
            statusMessage.textContent = '¡No olvides marcar la misión!';
            statusMessage.style.color = 'var(--color-error)';
        }
    });

    // Obtener el slug de la misión desde la URL
    const parametrosURL = new URLSearchParams(window.location.search);
    const slugMisionActual = parametrosURL.get('mision');

    const listaMisiones = window.PUMM?.MISIONES || [];
    const datosMisionSeleccionada = listaMisiones.find(mision => mision.id === slugMisionActual) || listaMisiones[0];

    const elementoTituloMision = document.querySelector('.actividad__mision-titulo');

    if (elementoTituloMision && datosMisionSeleccionada) {
        elementoTituloMision.textContent = datosMisionSeleccionada.nombre;
    }

    // Botón completar misión (usando la clase de tu HTML: .boton--primario)
    const botonCompletarMision = document.querySelector('.boton--primario');
    botonCompletarMision?.addEventListener('click', () => {
        if (UI && typeof UI.mostrarPantalla === 'function') {
            UI.mostrarPantalla('pasaporte');
        } else {
            window.location.href = 'pasaporte.html';
        }
    });
});