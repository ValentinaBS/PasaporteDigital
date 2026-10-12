/* ============================================================
   SERVIDOR · Google Apps Script (Pasaporte Digital PUMM 2026)
   ------------------------------------------------------------
   Este archivo va en el proyecto de Apps Script LIGADO a la
   planilla de Google Sheets (Extensiones → Apps Script desde la
   planilla). Ver el instructivo en google-apps-script.md (misma carpeta).

   Expone al cliente (google.script.run.<funcion>(payload)):
     · doGet                 → sirve la página (el HTML "Index").
     · registrarParticipante     → alta de la participante.
     · procesarSello             → registra una misión completada.
     · obtenerEstadoParticipante → progreso de la participante.

   ------------------------------------------------------------
   ESTRUCTURA DE LA PLANILLA · dos hojas

   Hoja "participantes" — una fila por participante:
     email | nombre | dni | fecha_hora_registro |
     numero_misiones_completadas | nombres_misiones_completadas

   Hoja "historial_misiones" — una fila por misión completada (log):
     nombre | dni | mision_completada | fecha_hora

   IDENTIDAD: una participante es el par DNI + email (email normalizado:
   sin espacios y en minúsculas). Así, si una chica tipea mal su DNI y
   coincide con el de otra, NO comparten fila ni progreso: queda una fila
   aparte (un "duplicado" que se unifica a mano si hiciera falta).
   Re-registrarse con los mismos DNI + email recupera el mismo progreso.

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

/* En "participantes" el email es la 1ª columna y el DNI la 3ª. */
var COL_EMAIL_PARTICIPANTES = 1;
var COL_DNI_PARTICIPANTES = 3;

var HOJA_HISTORIAL = "historial_misiones";
var COL_HISTORIAL = ["nombre", "dni", "mision_completada", "fecha_hora"];

/* ---------- Servir la página ----------
   Toda la app es UN solo HTML (registro y pasaporte son vistas que se
   muestran/ocultan por JS). El archivo HTML "Index" (ahí se pega el
   contenido de dist/Index.html) es un TEMPLATE: lleva un
   <?= misionQR ?> que el empaquetador inyecta en el <head>.

   Por qué template y no createHtmlOutputFromFile: el ?mision=… que viaja
   en el QR (…/exec?mision=ia) lo recibe ACÁ el servidor en e.parameter,
   NO el cliente (la app corre en un iframe sandbox cuya URL no lleva el
   query). Así que lo pasamos a la página por el template y el cliente lo
   lee en window.PUMM.MISION_QR (ver js/ui.js → leerParametro).

   ALLOWALL permite embeberlo en un iframe (ej. el WordPress de CET). */
function doGet(e) {
  var plantilla = HtmlService.createTemplateFromFile("Index");
  plantilla.misionQR = (e && e.parameter && e.parameter.mision) || "";

  return plantilla.evaluate()
    .setTitle("Pasaporte Digital - PUMM 2026")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ---------- Registro de la participante ----------
   payload = { email, nombre, dni }.
   La identidad es DNI + email: si ya existe ese par, no duplica
   (idempotente). Mismo DNI con otro email → fila nueva.
   Al registrarse arranca con 0 misiones completadas.
   Devuelve { status: "success" } o { status: "error", message }. */
function registrarParticipante(payload) {
  var lock = LockService.getScriptLock();
  try {
    var email = normalizarEmail_(payload && payload.email);
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

    /* El lock evita que dos pedidos simultáneos (ej. doble toque)
       pasen los dos la búsqueda y dupliquen la fila. */
    lock.waitLock(10000);

    var hoja = obtenerHoja_(HOJA_PARTICIPANTES, COL_PARTICIPANTES);

    if (buscarFilaParticipante_(hoja, dni, email)) {
      return { status: "success" };   // ya registrada, no duplicamos
    }

    /* email | nombre | dni | fecha_hora_registro | numero | nombres */
    hoja.appendRow([email, nombre, dni, new Date(), 0, ""]);
    return { status: "success" };

  } catch (err) {
    return { status: "error", message: String(err) };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Registro de una misión completada ----------
   payload = { dni, email, mision }  (mision = id, ej. "lab", "feria";
   viaja en el QR como ?mision=id). La participante se busca por
   DNI + email.

   Anota la misión en "historial_misiones" y actualiza el resumen de
   la participante en "participantes" (contador + lista de misiones).
   Cada misión cuenta una sola vez por participante.

   Devuelve:
     { status: "success",  numeroMisiones }  · quedó registrada
     { status: "repetida", numeroMisiones }  · ya la tenía
     { status: "error",    message }         · datos malos / no registrada

   Lo llama js/datos.js → registrarMision() al completar una misión. */
function procesarSello(payload) {
  var lock = LockService.getScriptLock();
  try {
    var dni = String((payload && payload.dni) || "").trim();
    var email = normalizarEmail_(payload && payload.email);
    var mision = String((payload && payload.mision) || "").trim();

    if (!/^\d{8}$/.test(dni) || !email || !mision) {
      return { status: "error", message: "Datos incompletos o inválidos." };
    }

    /* Leer la lista y escribirla tiene que ser atómico: sin el lock, dos
       sellos simultáneos podrían pisarse o contar la misma misión dos veces. */
    lock.waitLock(10000);

    var hojaP = obtenerHoja_(HOJA_PARTICIPANTES, COL_PARTICIPANTES);
    var fila = buscarFilaParticipante_(hojaP, dni, email);
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
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Helpers ---------- */

/* Email comparable: sin espacios y en minúsculas, así "Ana@Gmail.com "
   y "ana@gmail.com" son la misma persona (también contra filas viejas). */
function normalizarEmail_(s) {
  return String(s || "").trim().toLowerCase();
}

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

/* Devuelve el número de fila (1-based) de la participante con ese
   DNI + email en "participantes", o 0 si no está. Lee las columnas de
   email (1ª) a DNI (3ª) de una sola vez. */
function buscarFilaParticipante_(hoja, dni, email) {
  var ultima = hoja.getLastRow();
  if (ultima < 2) return 0;
  var desde = COL_EMAIL_PARTICIPANTES;
  var ancho = COL_DNI_PARTICIPANTES - COL_EMAIL_PARTICIPANTES + 1;
  var filas = hoja.getRange(2, desde, ultima - 1, ancho).getValues();
  for (var i = 0; i < filas.length; i++) {
    var emailFila = normalizarEmail_(filas[i][0]);
    var dniFila = String(filas[i][ancho - 1]).trim();
    if (dniFila === dni && emailFila === email) return i + 2;
  }
  return 0;
}

/* ---------- Consultar el estado de la participante ----------
   payload = { dni, email }.
   Le permite al cliente preguntar "¿cuántas misiones tiene esta
   participante (DNI + email) ya registradas?" en vez de confiar en lo
   que guardó en su celular. La planilla es la fuente de verdad del
   progreso, no el localStorage.

   Devuelve { status: "success", numeroMisiones, misiones } o
   { status: "error", message }. */
function obtenerEstadoParticipante(payload) {
  try {
    var dni = String((payload && payload.dni) || "").trim();
    var email = normalizarEmail_(payload && payload.email);

    if (!/^\d{8}$/.test(dni) || !email) {
      return { status: "error", message: "DNI o email inválido." };
    }

    var hoja = obtenerHoja_(HOJA_PARTICIPANTES, COL_PARTICIPANTES);
    var fila = buscarFilaParticipante_(hoja, dni, email);

    if (!fila) {
      return { status: "error", message: "La participante no está registrada." };
    }

    /* Columnas: email=1, nombre=2, dni=3, fecha=4,
       numero_misiones_completadas=5, nombres_misiones_completadas=6. */
    var numeroMisiones = Number(hoja.getRange(fila, 5).getValue()) || 0;
    var crudo = String(hoja.getRange(fila, 6).getValue() || "");
    var misiones = crudo.split(",").map(recortar_).filter(noVacio_);

    return { status: "success", numeroMisiones: numeroMisiones, misiones: misiones };

  } catch (err) {
    return { status: "error", message: String(err) };
  }
}

function recortar_(s) { return String(s).trim(); }
function noVacio_(s) { return s !== ""; }
