# C1_SimpleCatalog

Template base del ecosistema ÍndiceIA. Catálogo visual con categorías, carrito y checkout por WhatsApp.

---

## Para qué sirve

Ideal para cualquier comercio que quiera mostrar su catálogo online y recibir pedidos por WhatsApp. Sin instalación, sin cuenta, sin base de datos.

## Características

- Categorías con tabs navegables
- Cards con imagen opcional y variantes de precio
- Toggle retiro en local / envío a domicilio
- Carrito como bottom sheet
- Checkout directo por WhatsApp con mensaje pre-armado
- Mobile-first, responsive hasta desktop
- Animaciones sutiles (fadeUp, microinteracciones)
- Fallback emoji si la imagen no carga

## Placeholders

| Placeholder | Descripción |
|---|---|
| `{{NOMBRE_COMERCIO}}` | Nombre que aparece en el header |
| `{{WHATSAPP}}` | Número en formato internacional sin `+` (ej: `5493412295316`) |
| `{{GOODS}}` | Array JSON con el catálogo |
| `{{DELIVERY_COSTO}}` | Número con el costo de envío, o `null` si es a convenir |

## Estructura de GOODS

```json
[
  {
    "id": "P01",
    "nombre": "Pizza Margherita",
    "descripcion": "Opcional",
    "categoria": "Pizzas",
    "precio_final": null,
    "imagen": "https://...",
    "variantes": [
      { "id": "v1", "label": "Personal", "precio": 4200 },
      { "id": "v2", "label": "Familiar", "precio": 7800 }
    ]
  }
]
```

- `imagen` → opcional, muestra emoji placeholder si no existe o si la URL falla
- `variantes` → opcional, si no hay se usa `precio_final`
- Si hay una sola variante, se usa automáticamente sin mostrar chips

---

## Imágenes de productos

Las imágenes se cargan via URL pública. El template no hostea ni procesa imágenes.

### Opción 1 — URL de cualquier sitio (más simple)

Si el producto ya tiene foto en Instagram, MercadoLibre, Facebook u otro sitio:

1. Abrí la foto en el navegador
2. Click derecho → **Copiar dirección de imagen**
3. Pegá esa URL en el campo "URL de imagen" del producto

### Opción 2 — ImageKit.io (recomendada para fotos propias)

Para subir fotos desde el celular o la computadora y obtener una URL estable con CDN mundial:

1. Entrá a **[imagekit.io](https://imagekit.io)** → *Sign up with Google* (un clic)
2. Subí la foto de tu producto
3. Click derecho en la imagen → copiá la URL
4. Pegala en el campo "URL de imagen" de tu producto en ÍndiceIA

> ImageKit tiene un free tier generoso (20GB storage, 20GB bandwidth/mes) y las imágenes se sirven desde CDN mundial. Cada comercio usa su propia cuenta — las imágenes son tuyas.

---

## Delivery

El template soporta dos modalidades de entrega:

- **Retiro en local** — el cliente elige esta opción, se indica en el mensaje de WhatsApp
- **Envío a domicilio** — el cliente ingresa su dirección; si `DELIVERY_COSTO` tiene valor se suma al total, si es `null` aparece como "a convenir"
