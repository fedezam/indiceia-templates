# Guía para crear templates en ÍndiceIA

Cualquier desarrollador (humano o LLM) puede crear y publicar templates en este repositorio.  
Un template aprobado queda disponible para todos los comercios del ecosistema ÍndiceIA.

---

## ¿Qué es un template?

Un template es una **mini app HTML autónoma** que recibe datos de un comercio y los presenta como una interfaz funcional en el browser.

No hay servidor, no hay framework, no hay build step en runtime. Solo HTML + CSS + JS vanilla, organizado en tres archivos durante el desarrollo.

El template no sabe nada del comercio hasta el momento del render. Solo define:
- La estructura visual
- El comportamiento (carrito, filtros, checkout, etc.)
- Cómo leer e interpretar los datos que le llegan

---

## Estructura del repositorio
```
templates/
  TU_TEMPLATE_ID/
    src/
      index.html      ← estructura HTML (sin datos hardcodeados)
      style.css       ← estilos (mobile-first)
      script.js       ← lógica JS (lee datos del tag __DATA__)
    metadata.json     ← descripción para el marketplace
    README.md         ← documentación para el comercio
    previews/
      preview.html    ← preview con datos de ejemplo hardcodeados
```

> **No existe `template.txt`** — ese era el sistema viejo. No lo uses, no lo crees.

---

## Cómo llegan los datos al template

El backend de ÍndiceIA (entity-factory) fetchea el `src/index.html`, inyecta el CSS inline y los datos del comercio, y sube el resultado al Blob como `visual.html`.

Los datos llegan como un tag JSON en el body:
```html
<script id="__DATA__" type="application/json">
  {"nombre":"Pizzeria La Esquina","whatsapp":"3412295316","goods":[...],"entrega":{...}}
</script>
```

Tu `script.js` los lee así — **esta es la única forma correcta**:
```js
const data    = JSON.parse(document.getElementById('__DATA__').textContent);
const NOMBRE   = data.nombre   || '';
const WHATSAPP = data.whatsapp || '';
const GOODS    = data.goods    || [];
const ENTREGA  = data.entrega  || null;
```

**No uses `window.__DATA__`** — el tag DOM es la fuente canónica y confiable.

---

## Estructura de los datos

### Raíz del objeto `__DATA__`
```json
{
  "nombre":   "Nombre del comercio",
  "whatsapp": "3412295316",
  "goods":    [...],
  "entrega":  {...}
}
```

### Estructura de `goods`
```json
[
  {
    "id":           "abc123",
    "nombre":       "Pizza Muzzarella",
    "descripcion":  "Descripción opcional",
    "categoria":    "Pizzas",
    "precio_final": 5500,
    "imagen":       "https://url-de-imagen.com/foto.jpg",
    "variantes": [
      { "id": "v1", "label": "Chica",  "precio": 3500 },
      { "id": "v2", "label": "Grande", "precio": 5500 }
    ]
  }
]
```

- `imagen` puede ser `null`, `undefined`, o una URL válida — **siempre validala antes de renderizar**
- `variantes` es opcional — el template debe funcionar sin ellas
- `descripcion` es opcional

### Validación de imágenes

No todas las URLs son renderizables. Usá siempre esta función:
```js
function isValidImage(url) {
  if (!url) return false;
  if (url.startsWith('data:')) return false;           // base64 — muy pesado
  if (url.startsWith('https://www.google.com')) return false; // URLs de Google Images — no funcionan
  return true;
}
```

### Estructura de `entrega`
```json
{
  "delivery": {
    "costo": {
      "tipo":  "fijo",
      "valor": 3000,
      "zona":  "Casilda"
    }
  }
}
```

- Si `tipo === "fijo"` → podés mostrar el precio exacto
- Cualquier otro tipo → mostrá **"a convenir"** — **nunca inventes un precio**
```js
function getDeliveryCost(entrega) {
  const costo = entrega?.delivery?.costo;
  if (!costo) return null;
  if (costo.tipo === 'fijo') return costo.valor;
  return null; // zona u otro = a convenir
}
```

---

## El archivo `src/index.html`

Estructura base obligatoria:
```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{NOMBRE_COMERCIO}}</title>
  <link rel="stylesheet" href="https://indiceia-templates.vercel.app/templates/TU_TEMPLATE_ID/src/style.css"/>
</head>
<body>

  <!-- Tu HTML acá -->
  <h1 id="header-title">{{NOMBRE_COMERCIO}}</h1>

  <!-- 🔥 DATA — inyectado por el backend. Debe estar vacío. No tocar. -->
  <script id="__DATA__" type="application/json"></script>

  <!-- 🔥 SCRIPT -->
  <script src="https://indiceia-templates.vercel.app/templates/TU_TEMPLATE_ID/src/script.js"></script>

</body>
</html>
```

### Reglas del `index.html`

- El tag `<script id="__DATA__" type="application/json"></script>` es **obligatorio y debe estar vacío** — el backend lo llena en runtime
- `{{NOMBRE_COMERCIO}}` es el único placeholder que podés usar — el builder lo reemplaza antes de subir
- El `<link>` al CSS y el `<script>` al JS usan la URL pública de `indiceia-templates.vercel.app`
- **No hardcodees datos del comercio** — ni nombre, ni productos, ni nada

---

## El archivo `src/style.css`

- Mobile-first obligatorio
- Usá variables CSS (`--accent`, `--text`, `--bg`, etc.) para facilitar theming futuro
- Podés importar Google Fonts u otros CDNs
- El backend lo inyecta inline en `<style>` dentro del `<head>` antes de subir al Blob

---

## El archivo `src/script.js`

### Patrón canónico de `init`
```js
document.addEventListener('DOMContentLoaded', init);

function init() {
  const data     = JSON.parse(document.getElementById('__DATA__').textContent);
  const NOMBRE   = data.nombre   || '';
  const WHATSAPP = data.whatsapp || '';
  const GOODS    = data.goods    || [];
  const ENTREGA  = data.entrega  || null;

  document.getElementById('header-title').textContent = NOMBRE;

  // tu lógica acá
}
```

### Patrón canónico del mensaje de WhatsApp
```js
const items = Object.entries(cart).map(([, v]) =>
  `• ${v.nombre} x${v.qty} = ${formatPrice(v.precio * v.qty)}`
);

const subtotal = Object.values(cart).reduce((s, v) => s + v.precio * v.qty, 0);
const costVal  = getDeliveryCost(ENTREGA);

let entregaLinea = '';
let total = subtotal;

if (isDelivery) {
  if (costVal !== null) {
    total += costVal;
    entregaLinea = `\nEnvio: ${formatPrice(costVal)}`;
  } else {
    entregaLinea = `\nEnvio: a convenir`;
  }
  const address = document.getElementById('address-input')?.value;
  if (address) entregaLinea += `\nDireccion: ${address}`;
} else {
  entregaLinea = `\nRetiro en local`;
}

const msg =
  `Hola ${NOMBRE}, vengo de ÍndiceIA 🤖 y quiero hacer un pedido:\n\n` +
  `${items.join('\n')}\n\n` +
  `Subtotal: ${formatPrice(subtotal)}` +
  entregaLinea +
  (isDelivery && costVal !== null ? `\nTotal: ${formatPrice(total)}` : '');

const link = `https://wa.me/54${WHATSAPP}?text=${encodeURIComponent(msg)}`;
```

> La frase `vengo de ÍndiceIA 🤖` es **obligatoria** en todos los templates. Es la firma del ecosistema.

---

## El archivo `metadata.json`
```json
{
  "template_id": "C1_MI_TEMPLATE",
  "name": "Nombre visible en el marketplace",
  "version": "1.0.0",
  "tier": "C1",
  "type": "visual_catalog",
  "status": "stable",
  "description": "Descripción clara de qué hace el template y cuándo usarlo.",
  "ideal_for": ["rubro 1", "rubro 2"],
  "supports": {
    "categories": true,
    "cart": true,
    "search": false,
    "variants": true,
    "images": true,
    "delivery": true
  },
  "limitations": [
    "Sin pagos integrados",
    "Máximo recomendado: 200 productos"
  ],
  "visual": {
    "preview_html": "previews/preview.html"
  },
  "license": "MIT"
}
```

### Tiers

| Tier | Descripción |
|---|---|
| `C1` | Simple. Catálogo básico + carrito + WhatsApp. |
| `C2` | Intermedio. Variantes, filtros, búsqueda, experiencia enriquecida. |
| `C3` | Avanzado. Diseño a medida, funcionalidades especiales por rubro. |

---

## Nombrado del template
```
[TIER]_[NombreDescriptivo]

Ejemplos:
C1_SimpleCatalog
C2_FashionGrid
C3_RestaurantMenu
C2_FerreteriaPro
```

- Solo letras, números y guión bajo
- Empieza con el tier
- Nombre en PascalCase
- Descriptivo del rubro o estilo

---

## El archivo `previews/preview.html`

Un HTML standalone con datos hardcodeados para que el comercio vea el template antes de elegirlo.

- Debe funcionar abriendo el archivo directamente en el browser, sin servidor
- Usá datos ficticios pero realistas — nombre, productos con precios y categorías típicas del rubro
- Podés referenciar el CSS y JS del template vía URL pública

---

## Cómo funciona el deploy

Los archivos en `src/` se sirven directamente desde:
`https://indiceia-templates.vercel.app/templates/TU_TEMPLATE_ID/src/`

El backend de ÍndiceIA (entity-factory / visual.builder.js):
1. Fetchea `src/index.html` y `src/style.css`
2. Inyecta el CSS inline en `<head>`
3. Reemplaza `{{NOMBRE_COMERCIO}}` con el nombre real del comercio
4. Inyecta los datos del comercio en el tag `__DATA__`
5. Sube el resultado al Blob como `visual.html`

El `src/script.js` **nunca se inyecta inline** — el `index.html` lo carga via `<script src="...">` y Vercel lo sirve directamente.

**No hay build step, no hay compiler, no hay `template.txt`.**

---

## Cómo publicar

1. Fork del repositorio
2. Crear la carpeta `templates/TU_TEMPLATE_ID/src/`
3. Agregar `index.html`, `style.css`, `script.js`
4. Agregar `metadata.json`, `README.md` y `previews/preview.html`
5. Verificar que el template funciona abriendo `previews/preview.html` en el browser
6. Abrir un Pull Request con título: `feat: nuevo template [TU_TEMPLATE_ID]`

El equipo de ÍndiceIA revisa que:
- El template renderiza correctamente con datos reales
- El tag `__DATA__` está implementado correctamente
- La firma de ÍndiceIA está presente en el mensaje de WhatsApp
- El diseño es apropiado para uso comercial
- No hay dependencias rotas o código malicioso

---

## Checklist antes de hacer PR

- [ ] `src/index.html` tiene `<script id="__DATA__" type="application/json"></script>` vacío
- [ ] `src/index.html` usa `{{NOMBRE_COMERCIO}}` en `<title>` y en el header visible
- [ ] `src/script.js` lee datos con `JSON.parse(document.getElementById('__DATA__').textContent)`
- [ ] Las imágenes se validan con `isValidImage()` antes de renderizar
- [ ] El costo de delivery respeta la lógica fijo / a convenir
- [ ] El mensaje de WhatsApp incluye `vengo de ÍndiceIA 🤖`
- [ ] El template funciona sin datos (GOODS vacío, sin entrega)
- [ ] `metadata.json` está completo
- [ ] `previews/preview.html` funciona standalone en el browser

---

## Preguntas

Abrí un issue en el repositorio o escribí a **dev@indiceia.com**.
