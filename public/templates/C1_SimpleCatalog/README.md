# C3_RestaurantMenu

**Template premium para restaurantes, bares y delivery.**

Diseño oscuro y elegante con tipografía Playfair Display. Ideal para comercios gastronómicos que quieren una presencia digital de alta gama.

---

## Características

- 🎨 Diseño oscuro premium con paleta dorada
- 📂 Agrupado automático por categorías
- 🔍 Búsqueda en tiempo real
- 🛒 Carrito como bottom sheet con animación smooth
- 🔀 Soporte de variantes (tamaños, opciones)
- 📱 Mobile-first, 100% responsive
- 💬 Checkout por WhatsApp con mensaje pre-armado
- 🖼️ Fallback emoji por categoría cuando no hay imagen
- ✨ Animaciones CSS staggered en tarjetas

---

## Placeholders

| Placeholder | Ejemplo |
|---|---|
| `{{NOMBRE_COMERCIO}}` | `La Brasserie` |
| `{{WHATSAPP}}` | `5493412295316` |
| `{{GOODS}}` | Array JSON (ver estructura abajo) |

---

## Estructura de GOODS

```json
[
  {
    "id": "P01",
    "nombre": "Bife de chorizo",
    "descripcion": "400g con papas rústicas y chimichurri",
    "categoria": "Principales",
    "precio_final": null,
    "variantes": [
      { "id": "v1", "label": "300g", "precio": 7200 },
      { "id": "v2", "label": "400g", "precio": 8900 }
    ]
  }
]
```

- `imagen` y `variantes` son **opcionales**
- Si hay variantes, `precio_final` puede ser `null`
- Si hay una sola variante, se agrega sin abrir el modal

---

## Categorías con emoji automático

El template detecta emojis según palabras clave en el nombre de la categoría:

| Categoría | Emoji |
|---|---|
| Entradas | 🥗 |
| Principales | 🍽️ |
| Postres | 🍮 |
| Bebidas | 🥤 |
| Pizza | 🍕 |
| Burger / Hamburguesa | 🍔 |

---

## Paleta de colores

| Variable | Valor |
|---|---|
| `--gold` | `#D4AF37` |
| `--gold-light` | `#F0CC5A` |
| `--dark` | `#111111` |
| `--accent` | `#E85D26` |
| WhatsApp | `#25D366` |

---

## Tier: C3

Template de diseño a medida para el rubro gastronómico. Incluye funcionalidades avanzadas como búsqueda en tiempo real, variantes seleccionables, modal de detalle y agrupado por categorías.
