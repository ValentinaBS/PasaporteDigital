/* ============================================================
   DATOS · ACTIVIDADES (cronograma del evento)
   ------------------------------------------------------------
   Las actividades son el CRONOGRAMA del PUMM 2026: qué pasa,
   a qué hora y dónde. Es SOLO informativo — no cuentan para
   ningún completismo de la app (eso son las MISIONES, en
   data/misiones.js, que se completan por QR).

   Se muestran en la pantalla de Actividades (html/actividades.html)
   y alimentan la "actividad destacada" del pasaporte (la próxima
   por horario).

   `hora` va como "HH:MM" (24h) para poder ordenarla y compararla
   con la hora actual, o "Todo el día" para las que duran todo el
   evento. Si cambiás el formato, ajustá horarioAMinutos()/esConHora()
   en js/paginas/pasaporte.js y js/paginas/actividades.js.

   Mismo criterio que misiones.js: es .js y no .json a propósito
   (fetch() de un file:// se bloquea por CORS). Ver misiones.js.
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.ACTIVIDADES = [
  { hora: "10:00", nombre: "Lab: Armá tu primer robot", ubicacion: "Espacio Labs 1" },
  { hora: "10:00", nombre: "Lab: Explorá el mundo de los datos", ubicacion: "Espacio Labs 2" },
  { hora: "10:00", nombre: "Charla de chicas para chicas: Algoritmos: ¿Quién le enseña a la IA?", ubicacion: "Escenario" },
  { hora: "10:30", nombre: "Charla PUMM: Hablemos de habilidades para el futuro", ubicacion: "Escenario" },
  { hora: "11:15", nombre: "Charla de chicas para chicas: Ciberseguridad: ¿A quién estamos protegiendo?", ubicacion: "Escenario" },
  { hora: "11:30", nombre: "Lab: Descubrí el ABC de la programación", ubicacion: "Espacio Labs 2" },
  { hora: "11:30", nombre: "Charla PUMM: Hablemos de datos y algoritmos", ubicacion: "Escenario" },
  { hora: "12:00", nombre: "Charla de chicas para chicas: Visión artificial: ¿cómo ve una computadora?", ubicacion: "Escenario" },
  { hora: "12:15", nombre: "Charla PUMM: Una conversación con las históricas", ubicacion: "Escenario" },
  { hora: "12:35", nombre: "Charla de chicas para chicas: Robótica: ¿Y si te encuentra a vos?", ubicacion: "Escenario" },
  { hora: "12:55", nombre: "Charla PUMM: Recorridos inspiradores con la Comunidad CET", ubicacion: "Escenario" },
  { hora: "13:30", nombre: "Lab: Experimentá con IA generativa", ubicacion: "Espacio Labs 1" },
  { hora: "13:30", nombre: "Lab: Creá un hogar inteligente y accesible", ubicacion: "Espacio Labs 2" },
  { hora: "13:30", nombre: "Charla de chicas para chicas: Búsqueda laboral: ¿puede un algoritmo ver tu potencial?", ubicacion: "Escenario" },
  { hora: "14:00", nombre: "Charla PUMM: Hablemos de mujeres creando videojuegos", ubicacion: "Escenario" },
  { hora: "14:30", nombre: "Charla de chicas para chicas: Física: ¿de la teoría a la acción?", ubicacion: "Escenario" },
  { hora: "Todo el día", nombre: "Feria: Feria de proyectos tecnológicos", ubicacion: "Feria" },
  { hora: "Todo el día", nombre: "Juegos: Juegos inmersivos con IA, realidad virtual y mucho más", ubicacion: "Activaciones" },
  { hora: "Todo el día", nombre: "Photo Opportunity: Sacate una foto en el PUMM", ubicacion: "Photopp" },
  { hora: "Todo el día", nombre: "Pitch: Pitcheá tu proyecto", ubicacion: "Pitch" },
  { hora: "Todo el día", nombre: "Experiencia: Sala de escape", ubicacion: "Sala" },
  { hora: "Todo el día", nombre: "Interacción: Mujeres históricas en STEM", ubicacion: "Photopp" }
];
