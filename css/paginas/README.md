# css/paginas/

Estilos que existen en **una sola pantalla**.

Un archivo por pantalla, con el mismo nombre que su HTML:

```
html/pasaporte.html  →  css/paginas/pasaporte.css
```

## Al crear uno, agregá su `@import` al final de `css/main.css`

```css
/* 3 · Páginas ---------------------------------------------- */
@import url("paginas/pasaporte.css");
```

Va **al final** a propósito: en CSS, cuando dos reglas compiten, gana la
última. Así una regla de página puede ajustar un componente sin necesidad de
`!important`.

## ¿Va acá o en componentes/?

| | Dónde va |
|---|---|
| Se usa en 2 o más pantallas | `css/componentes/` |
| Se usa en 1 sola pantalla | acá |
| Es un color, tamaño o espacio | `css/base/variables.css` |

Si algo que empezó acá se empieza a usar en otra pantalla, mudalo a
`componentes/`. Es un buen problema: significa que el diseño se está volviendo
consistente.

## Nomenclatura

Igual que en el resto del proyecto, BEM:

```css
.bloque            /* .tarjeta */
.bloque__parte     /* .tarjeta__titulo */
.bloque--variante  /* .tarjeta--hecha */
```

Leyendo el nombre de una clase en el HTML sabés en qué archivo está y hasta
dónde llega su efecto. Sin una convención, en dos semanas hay tres clases
`.titulo` peleándose entre sí.
