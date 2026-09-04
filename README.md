# DFG Truck Parts — propuesta de e-commerce

Propuesta alterna de tienda en línea para [DFG Truck Parts](https://dfgtruckparts.com),
construida 100% en código sobre el catálogo real de la empresa: **1.828 repuestos,
28 familias, 41 líneas de camión y 2.625 fotografías de producto**.

No hay pasarela de pagos, por diseño. El carrito termina en una **cotización por
WhatsApp** con códigos y cantidades, que es como DFG vende hoy.

---

## Arranque rápido

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. El panel administrativo está en `/admin`
(usuario `admin`, contraseña `admin`).

Para producción:

```bash
npm run build
npm run start
```

Requiere Node 20.9 o superior. Este proyecto se desarrolló con Node 24.20.0.

---

## Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | El mismo stack de la web de FORST |
| Lenguaje | TypeScript en modo estricto | Cero `any`, `tsc --noEmit` limpio |
| Estilos | Tailwind v4 con tokens en `app/globals.css` | Un solo sistema de color y forma |
| Animación | [Motion](https://motion.dev) 12 (`motion/react`) | Reveals, capas compartidas, drawers |
| Scroll | Lenis | Peso y desaceleración uniformes |
| Iconos | Phosphor | Una sola familia, `weight` consistente |
| Datos | JSON generado desde el excel + archivos en `data/runtime/` | Corre desde una carpeta, sin servicios que aprovisionar |

---

## Estructura

```
app/
  (shop)/                    la tienda
    page.tsx                 home
    catalogo/                catálogo con filtros y buscador
    producto/[slug]/         ficha completa
    @modal/(.)producto/      la misma ficha, interceptada como vista rápida
    carrito/                 revisión de la cotización
    marca/                   la marca
  admin/                     panel (login, indicadores, productos, ajustes)
  api/                       búsqueda, tracking, auth y endpoints del panel
components/                  agrupados por superficie, no por tipo
lib/
  catalog.ts                 carga, búsqueda, facetas, relacionados
  store.ts                   persistencia en archivos JSON
  stats.ts                   KPIs derivados del log de eventos
  systems.ts                 mapa de sistemas del camión a familias del excel
  synonyms.ts                puente de búsqueda español a inglés
  motion.ts                  vocabulario de animación compartido
scripts/build_catalog.py     conversor del excel
data/
  catalog.json               catálogo generado (no editar a mano)
  catalog-report.md          reporte de la conversión
  runtime/                   ediciones, ajustes y eventos (se crea solo)
```

---

## El catálogo

### Regenerar desde el excel

```bash
python -m pip install openpyxl
python scripts/build_catalog.py "ruta\al\CATALOGO_marcas_separadas.xlsx"
```

El script escribe `data/catalog.json` y un `data/catalog-report.md` con todo lo
que tuvo que corregir. **Vale la pena leer ese reporte**: documenta decisiones
sobre los datos que conviene que DFG revise.

### Qué hace el conversor con los datos

El excel viene con tres cosas que no se podían publicar tal cual:

**1. Marcas duplicadas por erratas.** `VOVLO`, `MERCEDEZ BENZ`, `MERCEBES BENZ`,
`MBB`, `MB`, `FLETTGUARD` y `CAT` se unifican con su marca correcta, para que el
filtro no muestre cuatro entradas distintas de Mercedes Benz. Las correcciones
están listadas en el reporte.

**2. Referencias cruzadas metidas en la columna CODIGO.** En 90 filas esa celda
no trae un código sino una lista de equivalencias OEM:

```
VOLVO 85106370/FREIGHTLINER DNP527682/ CATERPILLAR 3I1456/ DONALDSON P527682/ ...
```

El conversor toma la primera como código principal y guarda el resto como
**referencias cruzadas**. Siguen siendo buscables, así que un cliente que copia
el número de la pieza vieja encuentra el equivalente DFG, y se muestran en la
ficha del producto. Sin esto, la fila más larga imprimía un código de 475
caracteres en la tarjeta.

**3. Códigos repetidos.** 23 códigos aparecen en más de una fila. Cada uno recibe
una URL única y el reporte lista cuáles son, para que DFG decida si son
duplicados reales.

### Lo que el catálogo todavía no tiene

Son datos que faltan en el excel, no funcionalidad faltante. El panel los reporta
en **Salud del catálogo** y se corrigen desde **Productos**:

- **198 repuestos sin fotografía** (11% del catálogo)
- **720 sin subfamilia asignada** (39%)
- **1 código anómalo**: la fila con código `1` (`CABIN REAR SHOCK ABSORBE EYE/EYE`)
- **17 filas sin aplicación**

---

## Cómo funciona cada parte

### Búsqueda

Un solo campo busca por código, descripción, aplicación, familia y referencia
cruzada. El ranking prioriza coincidencia exacta de código, luego prefijo de
código, luego referencia cruzada, luego descripción. Todos los términos tienen
que coincidir en algún campo, así que "filtro volvo" no devuelve todos los
filtros del mundo.

**El catálogo está en inglés y quien busca escribe en español.** Las
descripciones del excel dicen `CABIN SHOCK ABSORBER` y `FUEL FILTER`, pero un
mecánico escribe "amortiguador" y "filtro". Sin puente, las dos búsquedas más
naturales del sitio devolvían cero resultados.

`lib/synonyms.ts` resuelve eso: unas 120 entradas que expanden el término en
español a la frase inglesa que sí está en los datos, más una lista de
preposiciones que se descartan. Con eso funcionan:

| Se escribe | Encuentra |
| --- | --- |
| `amortiguador de cabina` | CABIN SHOCK ABSORBER |
| `bolsa de aire` | AIR SPRING FRONT |
| `retén de rueda` | WHEEL BEARING SEALING RING |
| `collarín` | RELEASE BEARING |
| `caja de cambios` | GEARBOX MAGNETIC VALVE |
| `pastillas de freno` | BRAKE PAD KIT |
| `20527307` (número Volvo) | AS1172, el equivalente DFG |

El diccionario es una tabla plana y se amplía agregando filas, sin tocar el
motor de búsqueda.

Las sugerencias del buscador salen de `/api/search`, con debounce y aborto de la
petición anterior: el navegador nunca descarga el índice de 1.828 items.

### Filtros

Familia, subfamilia, línea de camión y "solo con foto". **Todo el estado vive en
la URL**, así que un catálogo filtrado se pega en un chat y se abre igual, y el
botón atrás funciona.

Los contadores de cada faceta se calculan excluyendo el propio filtro, así que el
número responde "cuántos habría si cambio a esa familia" y no "cuántos hay
ahora".

### Vista rápida

Un clic en una tarjeta abre la ficha **sobre** el catálogo, con fondo blanco (el
mismo blanco sobre el que están fotografiadas las piezas), sin perder la grilla,
el scroll ni los filtros. La misma URL abierta en frío renderiza la página
completa. Está hecho con rutas paralelas e interceptoras de Next, no con un
estado de modal.

### Cotización

El carrito vive en `localStorage` y se sincroniza entre pestañas. El botón
**Cotizar** arma un mensaje de WhatsApp con códigos, descripciones, marca y
cantidades, y lo abre en `wa.me`. En `/carrito` se ve el mensaje exacto antes de
enviarlo.

El número se cambia en **Panel → Ajustes**, sin tocar código.

---

## Panel administrativo

`/admin` — usuario `admin`, contraseña `admin`.

**Indicadores.** Búsquedas más frecuentes, **búsquedas sin resultados** (la
demanda que el catálogo no cubre, que es la lista de compras de DFG), repuestos
más vistos, más agregados a cotización, familias más consultadas, filtros más
usados, actividad diaria y tasas de conversión. Más un bloque de salud del
catálogo.

**Productos.** Busca un repuesto por código o descripción y edita su
**descripción**, su **aplicación** y sus **fotografías**: subir un archivo,
pegar una URL, reordenar, quitar. Los cambios se publican al instante.

Las ediciones se guardan como *overrides* separados del catálogo, nunca encima
de él. Reimportar el excel no pisa una decisión humana, y **Restaurar** devuelve
un producto a sus valores originales.

**Ajustes.** Número de WhatsApp, encabezado del mensaje de cotización y correo de
contacto, con vista previa del mensaje.

---

## Decisiones de diseño

**Tema claro fijo.** Las 2.625 fotos del catálogo están tomadas sobre fondo
blanco. Una interfaz oscura obligaría a poner una placa blanca detrás de cada
imagen y pelearía con la fotografía. El negro se usa como bloque de marca
(cabecera, hero, pie, panel), no como tema alternativo.

**Paleta.** Negro `#0b0b0c`, rojo `#EE2624` y gris `#33373D`, tomados de
dfgtruckparts.com. Un solo acento en toda la aplicación.

**Tipografía.** Montserrat, la que ya usa DFG. JetBrains Mono queda reservada
para los números de parte, que son datos y quieren cifras tabulares.

**Esquinas rectas en todo.** Un único sistema de forma, industrial, coherente con
la web actual de DFG.

**Movimiento con motivo.** Reveals al entrar en viewport, transiciones de estado
en el carrito y los filtros, paralaje en el hero y un panel fijo en "Del camión a
la pieza" que sostiene la vista despiezada mientras el texto pasa. Nada se anima
en bucle. Todo respeta `prefers-reduced-motion`.

**El contenido nunca depende de que el JavaScript llegue.** El titular del hero
se anima con keyframes de CSS, no con JavaScript, porque su estado en reposo
tiene que ser el legible. Los contadores del home renderizan la cifra real y solo
la animan por encima, con un temporizador que garantiza el valor final. Y un
bloque `<noscript>` revierte los estados iniciales de las animaciones de scroll.

---

## Notas de seguridad

Este build es una **demo de propuesta**. Antes de exponerlo a internet hay que
cambiar tres cosas:

1. **Credenciales.** `admin` / `admin` están puestas para la demostración. Se
   cambian con `DFG_ADMIN_USER` y `DFG_ADMIN_PASS`, pero lo correcto es una
   tabla de usuarios con contraseñas hasheadas.
2. **Secreto de sesión.** La cookie se firma con HMAC. En producción hay que
   definir `DFG_SESSION_SECRET` con un valor aleatorio.
3. **Rate limiting.** El login solo tiene un retardo fijo ante credenciales
   incorrectas.

El almacenamiento en archivos JSON de `data/runtime/` sirve para correr desde una
carpeta sin aprovisionar nada. Para producción se reemplaza `lib/store.ts` por
una base de datos real; ese módulo son seis funciones y nada más del código lo
toca.

Las imágenes se sirven desde `dfgtruckparts.com` vía `next/image`. Están
declaradas en `next.config.ts`; si el catálogo se muda de dominio, se cambia ahí.

---

## Analítica

`/api/track` registra búsquedas, fichas vistas, agregados al carrito,
cotizaciones enviadas y filtros aplicados. **No se guarda nada identificatorio**:
ni cookie, ni IP, ni identificador de sesión. Solo el evento y su marca de
tiempo, que es todo lo que necesitan los indicadores.

El log se limita a los últimos 8.000 eventos y se puede vaciar desde el panel.
