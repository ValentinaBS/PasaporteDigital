/* ============================================================
   DATOS · MISIONES del recorrido PUMM
   ------------------------------------------------------------
   ⚠️ POR QUÉ ESTO ES .js Y NO .json

   Lo natural sería un misiones.json y leerlo con fetch().
   No funciona en este proyecto: cuando abrís un archivo con
   doble clic, la URL es file:///... y el navegador bloquea
   fetch() por seguridad (CORS). Te tira un error rojo en la
   consola y la lista queda vacía. Es EL bug clásico de este
   tipo de proyecto y cuesta media tarde entender por qué.

   Un .js cargado con <script> no tiene esa restricción: anda
   con doble clic, con Live Server y subido a WordPress.
   Contra: hay que cargarlo con un <script> antes que el resto.
   Vale la pena.

   ⚠️ ESTOS DATOS SON DE DESARROLLO. Los reales los define
   Producción. Mientras tanto sirven para maquetar y probar.
   ============================================================ */

/* window.PUMM es el único objeto global de toda la app.
   Todo cuelga de ahí para no ensuciar el espacio global ni
   pisarnos entre archivos. La línea de abajo lo crea si no
   existe todavía, y lo reutiliza si ya lo creó otro archivo. */
window.PUMM = window.PUMM || {};

/* Las 10 misiones del recorrido. El `id` (slug) es la clave EXACTA
   que viaja en el QR (?mision=slug) y que el JS envía al servidor;
   no se cambia una vez impresos los QR. Los nombres son los que ve la
   participante.

   Cada misión trae además `ubicacion`, `horario` y `descripcion`:
   - `horario` va en formato "HH:MM" (24h) porque js/paginas/pasaporte.js
     lo compara con la hora actual para elegir la MISIÓN DESTACADA (la
     próxima actividad que todavía no empezó). Si cambiás el formato,
     ajustá horarioAMinutos() allá.
   - `ubicacion` y `descripcion` se muestran en esa tarjeta destacada.

   ⚠️ ESTOS HORARIOS/UBICACIONES/DESCRIPCIONES SON FICTICIOS: los
   define Producción. Sirven para maquetar y probar la lógica.

   ⚠️ `insignia` queda en null por ahora: el sistema de insignias
   (data/insignias.js) todavía apunta a los ids viejos y hay que
   rehacerlo cuando se arme el flujo de misiones. Ninguna pantalla
   actual lo usa. */
window.PUMM.MISIONES = [
  { id: "robotica",      nombre: "Taller de Robótica",       icono: "🤖", insignia: null,
    ubicacion: "Stand Zona A", horario: "10:30",
    descripcion: "Armá y programá un robot que sigue la línea con sensores." },
  { id: "vr",            nombre: "Lab de Realidad Virtual",  icono: "🥽", insignia: null,
    ubicacion: "Stand Zona B", horario: "11:00",
    descripcion: "Ponete los lentes y explorá mundos en 360° hechos por chicas." },
  { id: "programacion",  nombre: "Programación Web",         icono: "💻", insignia: null,
    ubicacion: "Aula 1", horario: "11:30",
    descripcion: "Escribí tu primera página web y publicala en el momento." },
  { id: "diseno-ux",     nombre: "Diseño UX/UI",             icono: "🎨", insignia: null,
    ubicacion: "Aula 2", horario: "12:15",
    descripcion: "Diseñá una app pensando en quién la va a usar de verdad." },
  { id: "ciencia-datos", nombre: "Análisis de Datos",        icono: "📊", insignia: null,
    ubicacion: "Stand Zona C", horario: "13:00",
    descripcion: "Convertí un montón de datos en un gráfico que cuenta una historia." },
  { id: "ciberseguridad",nombre: "Ciberseguridad",           icono: "🛡️", insignia: null,
    ubicacion: "Aula 3", horario: "13:45",
    descripcion: "Aprendé a cuidar tus cuentas y a pensar como quien las protege." },
  { id: "biotecnologia", nombre: "Biotecnología",            icono: "🧬", insignia: null,
    ubicacion: "Laboratorio", horario: "14:30",
    descripcion: "Meté las manos en experimentos que unen biología y tecnología." },
  { id: "videojuegos",   nombre: "Zona Gamer",               icono: "🎮", insignia: null,
    ubicacion: "Stand Zona D", horario: "15:15",
    descripcion: "Diseñá el nivel de un videojuego y jugalo con el resto." },
  { id: "ia",            nombre: "Lab de IA",                icono: "✨", insignia: null,
    ubicacion: "Stand Zona A", horario: "16:00",
    descripcion: "Descubrí los usos de la IA en el día a día y armá tu propio chatbot." },
  { id: "redes",         nombre: "Infraestructura y Redes",  icono: "🌐", insignia: null,
    ubicacion: "Aula 1", horario: "16:45",
    descripcion: "Entendé cómo viaja la información y armá una red que funcione." }
];

/* Cuántas misiones hacen falta para completar el recorrido.
   ⚠️ HIPÓTESIS SIN VALIDAR: el número definitivo lo define
   Producción. Está acá y no repartido por el código para que
   cambiarlo sea tocar una sola línea. */
window.PUMM.MISIONES_PARA_COMPLETAR = window.PUMM.MISIONES.length;

/* Estructura de niveles del recorrido (las usa js/paginas/pasaporte.js
   para calcular en qué nivel está la participante y la pista de pasos). */
window.PUMM.MISIONES_POR_NIVEL = 8;
window.PUMM.TOTAL_NIVELES = 3;
