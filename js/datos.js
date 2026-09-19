/* ============================================================
   DATOS  ·  Única puerta de entrada a la información
   ------------------------------------------------------------
   NINGUNA pantalla lee o escribe localStorage directamente.
   Todo pasa por las funciones de este archivo.

   ¿Por qué esta capa en el medio?
     Hoy los datos están en el navegador (modo demo). Mañana van
     a estar en el backend, porque el progreso tiene que vivir
     en la base de datos y no en el celular (si una participante
     cambia de teléfono, su recorrido la tiene que seguir).
     Cuando llegue ese día se reescriben SOLO las funciones de
     este archivo. Las 8 pantallas no se tocan.

     Si en cambio cada pantalla llamara a localStorage por su
     cuenta, migrar al backend sería tocar los 6 archivos de
     js/paginas/ y encontrar todos los lugares. Esto es lo que
     evita esa tarde perdida.

   ------------------------------------------------------------
   La identidad de la participante es el DNI. La sesión se da de
   alta con registrarParticipante() y se consulta con
   estaRegistrada() / obtenerParticipante(). El progreso de
   misiones va aparte, con registrarMision() y obtenerRegistros().
   ============================================================ */

window.PUMM = window.PUMM || {};

window.PUMM.Datos = (function () {
  "use strict";

  var CONFIG = window.PUMM.CONFIG;

  /* ---------- Helpers privados ----------
     Van adentro de la función, así que no se ven desde afuera.
     Solo se expone lo que está en el return de abajo. */

  function leerJSON(clave, porDefecto) {
    try {
      var crudo = localStorage.getItem(clave);
      return crudo ? JSON.parse(crudo) : porDefecto;
    } catch (e) {
      /* Puede fallar si el JSON quedó corrupto, o si el celular
         está en navegación privada con el storage bloqueado.
         Devolvemos el valor por defecto: la app sigue andando. */
      console.warn("[PUMM] No se pudo leer " + clave, e);
      return porDefecto;
    }
  }

  function guardarJSON(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      console.warn("[PUMM] No se pudo guardar " + clave, e);
      return false;
    }
  }

  /* ¿Estamos corriendo dentro de Google Apps Script?
     google.script.run es la puerta al servidor y SOLO existe cuando la
     página la sirve Apps Script. En local (Live Server o doble clic) no
     está, y ahí caemos al modo demo con localStorage. Detectarlo en
     runtime evita tener que cambiar una "perilla" al empaquetar: el
     mismo archivo anda en los dos lados. */
  function hayServidor() {
    return typeof google !== "undefined" &&
           google.script && google.script.run;
  }

  /* ---------- API pública ---------- */
  return {

    /* --- Sesión de la participante (registro) ---
       La identidad es el DNI: no generamos un id aparte. Los datos de
       la sesión activa viven en CLAVE_PARTICIPANTE como { nombre, dni }. */

    obtenerParticipante: function () {
      return leerJSON(CONFIG.CLAVE_PARTICIPANTE, null);
    },

    obtenerNombre: function () {
      var p = this.obtenerParticipante();
      return p ? p.nombre : "";
    },

    estaRegistrada: function () {
      return this.obtenerParticipante() !== null;
    },

    cerrarSesion: function () {
      localStorage.removeItem(CONFIG.CLAVE_REGISTROS);
      localStorage.removeItem(CONFIG.CLAVE_PARTICIPANTE);
      localStorage.removeItem(CONFIG.CLAVE_PROGRESO);
    },

    /* Da de alta a la participante con { email, nombre, dni }.
       Devuelve SIEMPRE una Promise que resuelve a:
         { ok: true }                      · quedó registrada
         { ok: false, mensaje }            · el servidor rechazó o falló

       Es asíncrona porque en Apps Script el guardado va al servidor
       (Google Sheets) y vuelve por callback. La envolvemos en una
       Promise para que la pantalla la use con .then() sin conocer los
       detalles de google.script.run.

       En local (sin servidor) cae al modo demo: guarda en localStorage
       y, para poder probar el modal de error, simula una falla con el
       DNI 00000000 (el servidor hace lo mismo, ver Codigo.gs). */
    registrarParticipante: function (datos) {
      var email = (datos && datos.email) || "";
      var nombre = (datos && datos.nombre) || "";
      var dni = String((datos && datos.dni) || "");
      var self = this;

      function guardarLocal() {
        return guardarJSON(CONFIG.CLAVE_PARTICIPANTE, {
          email: email,
          nombre: nombre,
          dni: dni
        });
      }

      return new Promise(function (resolve) {

        /* --- En Apps Script: guardar en Google Sheets --- */
        if (hayServidor()) {
          google.script.run
            .withSuccessHandler(function (res) {
              if (res && res.status === "success") {
                guardarLocal();
                resolve({ ok: true });
              } else {
                resolve({
                  ok: false,
                  mensaje: (res && res.message) || ""
                });
              }
            })
            .withFailureHandler(function (err) {
              console.warn("[PUMM] Falló registrarParticipante", err);
              resolve({ ok: false, mensaje: "conexion" });
            })
            .registrarParticipante({ email: email, nombre: nombre, dni: dni });
          return;
        }

        /* --- En local: modo demo con localStorage --- */
        if (dni === "00000000") {
          resolve({ ok: false, mensaje: "demo" });
          return;
        }
        resolve({ ok: guardarLocal() });
      });
    },

    /* --- Registros de misión --- */

    /* Lista de { misionId, fecha } de la participante activa. */
    obtenerRegistros: function () {
      return leerJSON(CONFIG.CLAVE_REGISTROS, []);
    },

    yaRegistro: function (misionId) {
      return this.obtenerRegistros().some(function (r) {
        return r.misionId === misionId;
      });
    },

    /* Registra una misión. Devuelve SIEMPRE una Promise que resuelve
       a uno de estos estados (string, no true/false, porque la
       pantalla muestra algo distinto en cada caso):
         "ok"          · se registró bien
         "repetida"    · ya la tenía (no es un error, es info)
         "desconocida" · el id del QR no existe
         "error"       · el servidor falló o no hay sesión

       Es asíncrona por el mismo motivo que registrarParticipante: en
       Apps Script el sello va al servidor (Google Sheets, la fuente de
       verdad del progreso) y vuelve por callback. En local (sin
       servidor) cae al modo demo y guarda en localStorage. */
    registrarMision: function (misionId) {
      var self = this;
      var existe = window.PUMM.MISIONES.some(function (a) {
        return a.id === misionId;
      });

      return new Promise(function (resolve) {
        if (!existe) {
          resolve("desconocida");
          return;
        }

        /* --- En Apps Script: sellar en Google Sheets (procesarSello) --- */
        if (hayServidor()) {
          var participante = self.obtenerParticipante();
          if (!participante) {
            resolve("error");
            return;
          }
          google.script.run
            .withSuccessHandler(function (res) {
              if (res && res.status === "success") resolve("ok");
              else if (res && res.status === "repetida") resolve("repetida");
              else resolve("error");
            })
            .withFailureHandler(function (err) {
              console.warn("[PUMM] Falló registrarMision", err);
              resolve("error");
            })
            .procesarSello({ dni: participante.dni, mision: misionId });
          return;
        }

        /* --- En local: modo demo con localStorage --- */
        if (self.yaRegistro(misionId)) {
          resolve("repetida");
          return;
        }
        var registros = self.obtenerRegistros();
        registros.push({
          misionId: misionId,
          fecha: new Date().toISOString()
        });
        guardarJSON(CONFIG.CLAVE_REGISTROS, registros);
        resolve("ok");
      });
    },

    /* --- Progreso y logros --- */

    /* Le pregunta a la planilla (en modo Apps Script) cuántas
       misiones tiene la participante activa, y guarda la
       respuesta en localStorage como caché. Devuelve SIEMPRE una
       Promise, se resuelva bien o mal, para que la pantalla no
       tenga que distinguir los casos: si falla, sigue mostrando
       el último valor cacheado en vez de romper la UI.

       En modo demo (sin servidor) no hace nada: ahí el progreso
       YA vive en localStorage vía registrarMision(), no hay nada
       que sincronizar. */
    sincronizarProgreso: function () {
      var participante = this.obtenerParticipante();

      return new Promise(function (resolve) {
        if (!hayServidor() || !participante) {
          resolve();
          return;
        }

        google.script.run
          .withSuccessHandler(function (res) {
            if (res && res.status === "success") {
              guardarJSON(CONFIG.CLAVE_PROGRESO, {
                hechas: res.numeroMisiones,
                misiones: res.misiones || []
              });
            }
            resolve();
          })
          .withFailureHandler(function (err) {
            console.warn("[PUMM] Falló sincronizarProgreso", err);
            resolve(); // seguimos con el último valor cacheado
          })
          .obtenerEstadoParticipante({ dni: participante.dni });
      });
    },

    obtenerProgreso: function () {
      /* Si ya sincronizamos con el servidor, ESE es el número real
         (viene de la planilla). Si no (recién entramos y todavía
         no corrió sincronizarProgreso, o estamos en modo demo),
         caemos al conteo local de siempre. */
      var remoto = leerJSON(CONFIG.CLAVE_PROGRESO, null);
      var hechas = remoto ? remoto.hechas : this.obtenerRegistros().length;

      var meta = window.PUMM.MISIONES_PARA_COMPLETAR;
      return {
        hechas: hechas,
        meta: meta,
        porcentaje: Math.min(100, Math.round((hechas / meta) * 100)),
        completo: hechas >= meta
      };
    },

    /* Devuelve todos los logros con campos extra para pintarlos:
         desbloqueada · true/false según su condición
         meta         · umbral de misiones (null si es por registro)
         avance       · misiones hechas hacia esa meta (null si por registro)
       Se manda también los bloqueados: la pantalla los muestra en
       gris con su mini-barra, porque ver lo que falta es incentivo. */
    obtenerLogros: function () {
      var progreso = this.obtenerProgreso();
      var registrada = this.estaRegistrada();

      return window.PUMM.LOGROS.map(function (logro) {
        var meta = logro.porRegistro ? null : logro.misiones;
        var desbloqueada = logro.porRegistro
          ? registrada
          : progreso.hechas >= meta;

        /* Object.assign copia las propiedades en un objeto nuevo,
           así no modificamos el array original de data/. */
        return Object.assign({}, logro, {
          desbloqueada: desbloqueada,
          avance: meta ? Math.min(progreso.hechas, meta) : null,
          meta: meta
        });
      });
    },

    /* Progreso global de logros: alimenta la barra "PROGRESO TOTAL",
       el mensaje variable de arriba y el botón de certificado al 100%. */
    obtenerProgresoLogros: function () {
      var logros = this.obtenerLogros();
      var desbloqueados = logros.filter(function (l) {
        return l.desbloqueada;
      }).length;
      var total = logros.length;
      return {
        desbloqueados: desbloqueados,
        total: total,
        porcentaje: total ? Math.round((desbloqueados / total) * 100) : 0,
        completo: total > 0 && desbloqueados === total
      };
    }
  };
})();
