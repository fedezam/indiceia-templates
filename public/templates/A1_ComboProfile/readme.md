# A1_ComboProfile

Template para negocios que combinan productos y servicios. Navegación por tabs estilo app móvil.

## Tabs

- **Inicio** — resumen del negocio, accesos rápidos a productos y servicios, botón WhatsApp directo
- **Productos** — grid con filtro por categoría, carrito persistente, checkout por WhatsApp
- **Servicios** — cards con imagen opcional, selección y consulta por WhatsApp
- **Info** — horarios, contacto, galería de fotos

## Placeholders

| Placeholder | Tipo | Descripción |
|---|---|---|
| `{{NOMBRE_COMERCIO}}` | string | Nombre del negocio |
| `{{WHATSAPP}}` | string | Solo dígitos |
| `{{GOODS}}` | JSON array | Productos del catálogo |
| `{{SERVICES}}` | JSON array | Servicios ofrecidos |
| `{{PROFILE}}` | JSON object | Datos del perfil (ubicacion, contacto, horarios, galeria) |

## Ideal para

Ópticas, talleres mecánicos, estéticas, veterinarias, ferreterías con instalación, y cualquier negocio que venda productos Y preste servicios.
