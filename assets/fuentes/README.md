# Fuentes

Acá van los archivos `.woff2` de las dos tipografías del manual PUMM 2026.

## Lo que tenemos

| Fuente | Uso | Archivo |
|---|---|---|
| Road Rage | Títulos | `road-rage.woff2` |
| Special Gothic | Textos (regular) | `special-gothic.woff2` |
| Special Gothic | Textos (negrita) | `special-gothic-700.woff2` |

## La negrita de Special Gothic viene aparte

Special Gothic es una familia de **un solo peso** en Google Fonts: el
`.woff2` regular no trae negrita. Por eso el bold vive en un archivo
separado (`special-gothic-700.woff2`) y en `css/base/tipografia.css` se
declara como una segunda `@font-face` con `font-weight: 700`, con el mismo
`font-family`. Así `font-weight: 700` (etiquetas, botones, slogan) usa la
negrita de verdad, y no el "bold sintético" que el navegador dibujaba
engrosando el regular. Si falta ese archivo, la negrita se ve más floja
pero la app no se rompe: cae al peso regular.

## Por qué no linkeamos a Google Fonts

Special Gothic Expanded One está en Google Fonts y sería más rápido poner
un `<link>`. No lo hacemos porque:

- La app se usa dentro del predio, con el wifi saturado. Un dominio externo
  más es un punto de falla más.
- Cada carga manda la IP de la participante a un tercero. Son menores de edad
  y uno de los principios del producto es privacidad por diseño: si un dato
  no hace falta, no se comparte.
