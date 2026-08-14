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
   ⚠️ VOCABULARIO PENDIENTE — la pantalla de activación salió del
   flujo y ahora la primera pantalla es la de registro, pero este
   archivo todavía habla de "activar":

       activar(codigo)   estaActivado()   cerrarSesion()
       CONFIG.CLAVE_CODIGO   CONFIG.FORMATO_CODIGO

   No los renombramos todavía a propósito: el nombre correcto
   depende de qué pide el registro (¿sigue habiendo un código de
   acreditación? ¿se piden nombre y DNI?), y eso es una decisión
   de producto que todavía no está.

   Cuando esté, el cambio es barato justamente por esta capa:
   se reescriben estas funciones y nada más. Ojo con un detalle
   al elegir los nombres: registrarMision() ya existe y es
   otra cosa. Si el registro de la participante pasa a llamarse
   registrar(), las dos se van a confundir. Mejor algo como
   registrarParticipante() / estaRegistrada().
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

  /* ---------- API pública ---------- */
  return {

    /* --- Sesión --- */

    /* Devuelve el código activo, o null si el pasaporte no está
       activado. Las pantallas lo usan para decidir si redirigen. */
    obtenerCodigo: function () {
      return localStorage.getItem(CONFIG.CLAVE_CODIGO);
    },

    estaActivado: function () {
      return this.obtenerCodigo() !== null;
    },

    /* Valida el código y activa el pasaporte.
       Devuelve { ok: true, nombre } o { ok: false }.

       ⚠️ En modo demo valida contra data/participantes.js.
       En modo api va a ser una llamada al backend, y esta
       función va a pasar a ser asíncrona (async/await). */
    activar: function (codigo) {
      var limpio = String(codigo || "").trim().toUpperCase();

      if (!CONFIG.FORMATO_CODIGO.test(limpio)) {
        return { ok: false };
      }

      var encontrada = window.PUMM.PARTICIPANTES_DEMO.filter(function (p) {
        return p.codigo === limpio;
      })[0];

      if (!encontrada) {
        return { ok: false };
      }

      localStorage.setItem(CONFIG.CLAVE_CODIGO, limpio);
      return { ok: true, nombre: encontrada.nombre };
    },

    obtenerNombre: function () {
      var codigo = this.obtenerCodigo();
      var p = window.PUMM.PARTICIPANTES_DEMO.filter(function (x) {
        return x.codigo === codigo;
      })[0];
      return p ? p.nombre : "";
    },

    cerrarSesion: function () {
      localStorage.removeItem(CONFIG.CLAVE_CODIGO);
      localStorage.removeItem(CONFIG.CLAVE_REGISTROS);
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

    /* Registra una misión. Devuelve uno de estos estados:
         "ok"          · se registró bien
         "repetida"    · ya la tenía (no es un error, es info)
         "desconocida" · el id del QR no existe
       Devolvemos un string y no true/false porque la pantalla
       muestra un modal distinto en cada caso. */
    registrarMision: function (misionId) {
      var existe = window.PUMM.MISIONES.some(function (a) {
        return a.id === misionId;
      });
      if (!existe) return "desconocida";

      if (this.yaRegistro(misionId)) return "repetida";

      var registros = this.obtenerRegistros();
      registros.push({
        misionId: misionId,
        fecha: new Date().toISOString()
      });
      guardarJSON(CONFIG.CLAVE_REGISTROS, registros);
      return "ok";
    },

    /* --- Progreso e insignias --- */

    obtenerProgreso: function () {
      var hechas = this.obtenerRegistros().length;
      var meta = window.PUMM.MISIONES_PARA_COMPLETAR;
      return {
        hechas: hechas,
        meta: meta,
        porcentaje: Math.min(100, Math.round((hechas / meta) * 100)),
        completo: hechas >= meta
      };
    },

    /* Devuelve todas las insignias con un campo extra
       "desbloqueada". Mandamos también las bloqueadas porque la
       pantalla de Logros las muestra en gris: ver lo que falta
       es parte del incentivo. */
    obtenerInsignias: function () {
      var registros = this.obtenerRegistros();
      var progreso = this.obtenerProgreso();

      /* ids de las insignias ganadas por misión */
      var ganadas = registros.map(function (r) {
        var mision = window.PUMM.MISIONES.filter(function (a) {
          return a.id === r.misionId;
        })[0];
        return mision ? mision.insignia : null;
      });

      return window.PUMM.INSIGNIAS.map(function (insignia) {
        var desbloqueada = insignia.porCantidad
          ? progreso.completo
          : ganadas.indexOf(insignia.id) !== -1;

        /* Object.assign copia las propiedades en un objeto nuevo,
           así no modificamos el array original de data/. */
        return Object.assign({}, insignia, { desbloqueada: desbloqueada });
      });
    }
  };
})();
