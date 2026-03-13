# ÍndiceIA Templates

Repositorio oficial de templates visuales para el ecosistema **ÍndiceIA**.

Cada template es una **mini app HTML** que se sirve directamente en el browser. Recibe los datos del comercio mediante un merge de placeholders y se despliega como experiencia visual completa — catálogo, carrito, checkout por WhatsApp, y lo que el template defina.

---

## Cómo funciona

Cuando un comercio registrado en ÍndiceIA genera su entidad, el `entity-factory` hace:

```
1. Descarga template.txt del repo
2. Reemplaza placeholders con datos reales del comercio
3. Sube el HTML resultante a Vercel Blob
4. La mini app queda disponible en:
   https://indiceia-public.vercel.app/m/[slug]
```

El template nunca necesita conocer al comercio. Solo define la estructura y el comportamiento. Los datos llegan via placeholders.

---

## Placeholders disponibles

| Placeholder | Descripción |
|---|---|
| `{{NOMBRE_COMERCIO}}` | Nombre del comercio |
| `{{WHATSAPP}}` | Número de WhatsApp (solo dígitos) |
| `{{GOODS}}` | Array JSON con el catálogo completo |

### Estructura de `{{GOODS}}`

```json
[
  {
    "id": "P01",
    "nombre": "Producto",
    "descripcion": "Descripción opcional",
    "categoria": "Categoría",
    "precio_final": 1000,
    "imagen": "https://...",
    "variantes": [
      { "id": "v1", "label": "Chica", "precio": 800 },
      { "id": "v2", "label": "Grande", "precio": 1200 }
    ]
  }
]
```

`variantes` es opcional. Si no existe, se usa `precio_final`.

---

## Estructura del repositorio

```
indiceia-templates/
  schemas/
    template.metadata.schema.json   ← schema oficial de metadata
  public/
    templates/
      C1_SimpleCatalog/             ← template de ejemplo
        template.txt                ← el archivo principal
        metadata.json               ← descripción para el marketplace
        previews/
          C1_SimpleCatalog_full.html
        README.md
  CONTRIBUTING.md                   ← guía para crear templates
  vercel.json
```

---

## Templates disponibles

| ID | Nombre | Rubros ideales | Tier |
|---|---|---|---|
| `C1_SimpleCatalog` | Menú Simple | Gastronomía, delivery, comercios con catálogo básico | C1 |

---

## Tiers

| Tier | Descripción |
|---|---|
| **C1** | Template simple. Catálogo, carrito, WhatsApp. Sin configuración. |
| **C2** | Template intermedio. Variantes complejas, filtros, búsqueda. |
| **C3** | Template avanzado. Diseño a medida, funcionalidades especiales. |

---

## Crear un template nuevo

Leé [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Licencia

Uso comercial permitido únicamente dentro del ecosistema ÍndiceIA.  
Templates de terceros pueden tener licencia propia — verificar `metadata.json` de cada template.
