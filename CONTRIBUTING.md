# Guía para crear templates en ÍndiceIA

Cualquier desarrollador puede crear y publicar templates en este repositorio.  
Un template aprobado queda disponible para todos los comercios del ecosistema ÍndiceIA.

---

## ¿Qué es un template?

Un template es un **archivo HTML autónomo** que recibe datos de un comercio y los presenta como una mini app funcional en el browser.

No hay servidor, no hay framework, no hay build step. Solo HTML + CSS + JS vanilla en un único archivo.

El template no sabe nada del comercio hasta el momento del merge. Solo define:
- La estructura visual
- El comportamiento (carrito, filtros, checkout, etc.)
- Los placeholders donde van los datos

---

## Estructura mínima

```
public/templates/TU_TEMPLATE_ID/
  template.txt        ← obligatorio — el HTML con placeholders
  metadata.json       ← obligatorio — descripción para el marketplace
  README.md           ← obligatorio — documentación para el comercio
  previews/
    preview.html      ← recomendado — preview con datos de ejemplo
```

---

## El archivo `template.txt`

Es el corazón del template. Un archivo HTML completo y autónomo.

### Reglas

- **Un solo archivo** — todo el CSS y JS va inline. Sin dependencias locales.
- **Autónomo** — puede usar CDNs externos (fonts, iconos, librerías).
- **Mobile-first** — la mayoría de usuarios llegan desde el celular.
- **Sin frameworks que requieran build** — React/Vue solo via CDN si es necesario.
- **Funcional sin conexión a APIs** — todos los datos vienen en los placeholders.

### Placeholders obligatorios

```html
<!-- Nombre del comercio -->
{{NOMBRE_COMERCIO}}

<!-- WhatsApp (solo dígitos, ej: 5493412295316) -->
{{WHATSAPP}}

<!-- Catálogo completo como array JSON -->
{{GOODS}}
```

### Ejemplo mínimo

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>{{NOMBRE_COMERCIO}}</title>
</head>
<body>
  <h1>{{NOMBRE_COMERCIO}}</h1>
  <script>
    const WHATSAPP = '{{WHATSAPP}}';
    const GOODS    = {{GOODS}};
    // tu lógica acá
  </script>
</body>
</html>
```

### Estructura de GOODS

```json
[
  {
    "id": "P01",
    "nombre": "Nombre del producto",
    "descripcion": "Descripción opcional",
    "categoria": "Categoría",
    "precio_final": 1000,
    "imagen": "https://url-de-imagen.com/foto.jpg",
    "variantes": [
      { "id": "v1", "label": "Opción A", "precio": 800 },
      { "id": "v2", "label": "Opción B", "precio": 1200 }
    ]
  }
]
```

`imagen` y `variantes` pueden estar ausentes — el template debe manejarlo.

---

## El archivo `metadata.json`

Define cómo aparece el template en el marketplace.

```json
{
  "template_id": "C2_MI_TEMPLATE",
  "name": "Nombre visible en el marketplace",
  "version": "1.0.0",
  "tier": "C2",
  "type": "visual_catalog",
  "status": "stable",
  "description": "Descripción clara de qué hace el template y cuándo usarlo.",
  "ideal_for": [
    "rubro 1",
    "rubro 2"
  ],
  "supports": {
    "categories": true,
    "cart": true,
    "search": false,
    "variants": true,
    "images": true
  },
  "limitations": [
    "Sin pagos integrados",
    "Máximo recomendado: 200 productos"
  ],
  "visual": {
    "preview_html": "previews/preview.html",
    "thumbnail": "previews/thumbnail.png"
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

El `template_id` sigue este formato:

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

## Preview

Incluí un `previews/preview.html` con datos hardcodeados de ejemplo para que el comercio pueda ver el template antes de elegirlo.

Usá datos ficticios pero realistas — nombre de comercio, productos con precios y categorías típicas del rubro objetivo.

---

## Cómo publicar

1. Fork del repositorio
2. Crear la carpeta `public/templates/TU_TEMPLATE_ID/`
3. Agregar `template.txt`, `metadata.json`, `README.md` y `previews/`
4. Validar que `metadata.json` cumple el schema en `schemas/template.metadata.schema.json`
5. Abrir un Pull Request con título: `feat: nuevo template [TU_TEMPLATE_ID]`

El equipo de ÍndiceIA revisa que:
- El template renderiza correctamente con datos reales
- Los placeholders están bien implementados
- El diseño es apropiado para uso comercial
- No hay dependencias rotas o código malicioso

---

## Licencia de tu template

Podés elegir la licencia que quieras — MIT, Apache, comercial propia.  
Declarala en el campo `license` de `metadata.json`.

Los templates bajo `MIT` son libres para cualquier comercio.  
Los templates comerciales pueden tener condiciones propias.

---

## Preguntas

Abrí un issue en el repositorio o escribí a **dev@indiceia.com**.
