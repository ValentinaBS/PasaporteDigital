# Fuentes

Acá van los archivos `.woff2` de las dos tipografías del manual PUMM 2026.

## Lo que tenemos

| Fuente | Uso | Archivo esperado |
|---|---|---|
| Road Rage | Títulos | `road-rage.woff2` |
| Special Gothic | Textos | `special-gothic.woff2` |

## Por qué no linkeamos a Google Fonts

Special Gothic Expanded One está en Google Fonts y sería más rápido poner
un `<link>`. No lo hacemos porque:

- La app se usa dentro del predio, con el wifi saturado. Un dominio externo
  más es un punto de falla más.
- Cada carga manda la IP de la participante a un tercero. Son menores de edad
  y uno de los principios del producto es privacidad por diseño: si un dato
  no hace falta, no se comparte.
