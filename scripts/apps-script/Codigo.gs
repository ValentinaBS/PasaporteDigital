/* ============================================================
   SERVIDOR · Google Apps Script (Pasaporte Digital PUMM 2026)
   ------------------------------------------------------------
   Este archivo va en el proyecto de Apps Script LIGADO a la
   planilla de Google Sheets (Extensiones → Apps Script desde la
   planilla). Ver el instructivo en google-apps-script.md (misma carpeta).

   Expone al cliente (google.script.run.<funcion>(payload)):
     · doGet                 → sirve la página (el HTML "Index").
     · registrarParticipante → alta de la participante.
     · procesarSello         → registra una misión completada.

   ------------------------------------------------------------
   ESTRUCTURA DE LA PLANILLA · dos hojas

   Hoja "participantes" — una fila por participante:
     email | nombre | dni | fecha_hora_registro |
     numero_misiones_completadas | nombres_misiones_completadas

   Hoja "historial_misiones" — una fila por misión completada (log):
     nombre | dni | mision_completada | fecha_hora

   ============================================================ */

var HOJA_PARTICIPANTES = "participantes";
var COL_PARTICIPANTES = [
  "email",
  "nombre",
  "dni",
  "fecha_hora_registro",
  "numero_misiones_completadas",
  "nombres_misiones_completadas"
];

/* En "participantes" el DNI es la 3ª columna (email, nombre, DNI, …). */
var COL_DNI_PARTICIPANTES = 3;

var HOJA_HISTORIAL = "historial_misiones";
var COL_HISTORIAL = ["nombre", "dni", "mision_completada", "fecha_hora"];

/* ---------- Servir la página ----------
   Toda la app es UN solo HTML (registro y pasaporte son vistas que se
   muestran/ocultan por JS). createHtmlOutputFromFile("Index") busca el
   archivo HTML llamado "Index" en este proyecto (ahí se pega el
   contenido de dist/Index.html).
   ALLOWALL permite embeberlo en un iframe (ej. el WordPress de CET). */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("Pasaporte Digital - PUMM 2026")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------- Registro de la participante ----------
   payload = { email, nombre, dni }.
   La identidad es el DNI: si ya existe, no duplica (idempotente).
   Al registrarse arranca con 0 misiones completadas.
   Devuelve { status: "success" } o { status: "error", message }. */
function registrarParticipante(payload) {
  try {
    var email = String((payload && payload.email) || "").trim();
    var nombre = String((payload && payload.nombre) || "").trim();
    var dni = String((payload && payload.dni) || "").trim();

    if (!email || !nombre || !/^\d{8}$/.test(dni)) {
      return { status: "error", message: "Datos incompletos o inválidos." };
    }

    /* DNI reservado para probar el modal de error de punta a punta
       (mismo criterio que el modo demo del cliente en js/datos.js). */
    if (dni === "00000000") {
      return { status: "error", message: "DNI de prueba (error simulado)." };
    }

    var hoja = obtenerHoja_(HOJA_PARTICIPANTES, COL_PARTICIPANTES);

    if (buscarFilaPorDni_(hoja, dni, COL_DNI_PARTICIPANTES)) {
      return { status: "success" };   // ya registrada, no duplicamos
    }

    /* email | nombre | dni | fecha_hora_registro | numero | nombres */
    hoja.appendRow([email, nombre, dni, new Date(), 0, ""]);
    return { status: "success" };

  } catch (err) {
    return { status: "error", message: String(err) };
  }
}

/* ---------- Registro de una misión completada ----------
   payload = { dni, mision }  (mision = slug, ej. "vr", "robotica";
   viaja en el QR como ?mision=slug).

   Anota la misión en "historial_misiones" y actualiza el resumen de
   la participante en "participantes" (contador + lista de misiones).
   Cada misión cuenta una sola vez por participante.

   Devuelve:
     { status: "success",  numeroMisiones }  · quedó registrada
     { status: "repetida", numeroMisiones }  · ya la tenía
     { status: "error",    message }         · datos malos / no registrada

   ⚠️ El flujo de misiones todavía no está construido en el cliente;
   esta función deja la estructura lista para cuando se arme. */
function procesarSello(payload) {
  try {
    var dni = String((payload && payload.dni) || "").trim();
    var mision = String((payload && payload.mision) || "").trim();

    if (!/^\d{8}$/.test(dni) || !mision) {
      return { status: "error", message: "Datos incompletos o inválidos." };
    }

    var hojaP = obtenerHoja_(HOJA_PARTICIPANTES, COL_PARTICIPANTES);
    var fila = buscarFilaPorDni_(hojaP, dni, COL_DNI_PARTICIPANTES);
    if (!fila) {
      return { status: "error", message: "La participante no está registrada." };
    }

    /* Columnas de "participantes": email=1, nombre=2, dni=3,
       fecha_hora_registro=4, numero_misiones_completadas=5,
       nombres_misiones_completadas=6. */
    var nombre = hojaP.getRange(fila, 2).getValue();

    var crudo = String(hojaP.getRange(fila, 6).getValue() || "");
    var lista = crudo.split(",").map(recortar_).filter(noVacio_);

    if (lista.indexOf(mision) !== -1) {
      return { status: "repetida", numeroMisiones: lista.length };
    }

    /* Log en el historial: nombre | dni | mision_completada | fecha_hora */
    var hojaH = obtenerHoja_(HOJA_HISTORIAL, COL_HISTORIAL);
    hojaH.appendRow([nombre, dni, mision, new Date()]);

    /* Actualizar el resumen de la participante. */
    lista.push(mision);
    hojaP.getRange(fila, 5).setValue(lista.length);
    hojaP.getRange(fila, 6).setValue(lista.join(", "));

    return { status: "success", numeroMisiones: lista.length };

  } catch (err) {
    return { status: "error", message: String(err) };
  }
}

/* ---------- Helpers ---------- */

/* Obtiene (o crea con encabezados) una hoja por nombre. */
function obtenerHoja_(nombre, columnas) {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(nombre);
  if (!hoja) {
    hoja = libro.insertSheet(nombre);
    hoja.appendRow(columnas);
  }
  return hoja;
}

/* Devuelve el número de fila (1-based) del DNI en la hoja, o 0 si no
   está. Recibe en qué columna vive el DNI (cambia según la hoja: en
   "participantes" es la 3ª porque el email va primero). */
function buscarFilaPorDni_(hoja, dni, colDni) {
  var ultima = hoja.getLastRow();
  if (ultima < 2) return 0;
  var dnis = hoja.getRange(2, colDni, ultima - 1, 1).getValues();
  for (var i = 0; i < dnis.length; i++) {
    if (String(dnis[i][0]).trim() === dni) return i + 2;
  }
  return 0;
}

function recortar_(s) { return String(s).trim(); }
function noVacio_(s) { return s !== ""; }
