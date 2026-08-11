# Fuentes

Acá van los archivos `.woff2` de las dos tipografías del manual PUMM 2026.

Todavía **no están** en el repo. Hasta que estén, la app usa las fuentes del
sistema como respaldo y se ve bien igual (no rompe nada).

## Lo que falta

| Fuente | Uso | Archivo esperado |
|---|---|---|
| Road Rage | Títulos | `road-rage.woff2` |
| Special Gothic Expanded One | Textos | `special-gothic.woff2` |

## Pasos

1. Pedirle a Diseño los archivos, **junto con la licencia de uso web**.
   No alcanza con tener el `.ttf` para una campaña: la licencia de escritorio
   y la de web suelen ser distintas.
2. Convertirlos a `.woff2` si vienen en `.ttf` o `.otf`.
   `.woff2` pesa cerca de la mitad, y esto se abre desde el celular con el
   wifi del evento.
3. Dejarlos en esta carpeta con los nombres de la tabla.
4. Descomentar los bloques `@font-face` en `css/base/tipografia.css`.

## Por qué no linkeamos a Google Fonts

Special Gothic Expanded One está en Google Fonts y sería más rápido poner
un `<link>`. No lo hacemos porque:

- La app se usa dentro del predio, con el wifi saturado. Un dominio externo
  más es un punto de falla más.
- Cada carga manda la IP de la participante a un tercero. Son menores de edad
  y uno de los principios del producto es privacidad por diseño: si un dato
  no hace falta, no se comparte.
