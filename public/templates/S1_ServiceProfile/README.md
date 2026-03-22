# S1_ServiceProfile

Template para prestadores de servicios. Diseñado para plomeros, electricistas, manicuras, peluqueros, fotógrafos, albañiles y cualquier oficio o servicio personal.

## Qué muestra

- **Hero** — nombre, especialidad, zona y años de experiencia
- **Servicios** — cards seleccionables con descripción, modalidad y precio
- **Galería** — fotos de trabajos realizados con lightbox
- **Horarios** — disponibilidad semanal con el día actual destacado
- **CTA flotante** — botón WhatsApp con mensaje pre-armado según el servicio seleccionado

## Placeholders

| Placeholder | Tipo | Descripción |
|---|---|---|
| `{{NOMBRE_COMERCIO}}` | string | Nombre del prestador o marca |
| `{{WHATSAPP}}` | string | Solo dígitos, ej: `5493412295316` |
| `{{SERVICES}}` | JSON array | Lista de servicios del prestador |
| `{{PROFILE}}` | JSON object | Datos del perfil (ubicacion, contacto, horarios, galeria) |

### Estructura de `{{SERVICES}}`
```json
[
  {
    "id": "s1",
    "nombre": "Instalación de agua",
    "descripcion": "Descripción del servicio",
    "modalidad": ["a_domicilio"],
    "disponibilidad": "a_coordinar",
    "precio": { "tipo": "fijo", "valor": 5000 },
    "activo": true
  }
]
```

`precio` puede ser `null` o ausente — el template muestra "A consultar".
`modalidad` acepta: `presencial`, `a_domicilio`, `remoto`.
`disponibilidad` acepta: `inmediata`, `a_coordinar`.

### Estructura de `{{PROFILE}}`
```json
{
  "especialidad": "Plomero",
  "descripcion": "Instalaciones de agua y desagües",
  "experiencia": "5 años",
  "ubicacion": {
    "zona": "Casilda y alrededores",
    "pais": "Argentina"
  },
  "contacto": {
    "whatsapp": "5493412295316",
    "email": "contacto@ejemplo.com",
    "instagram": "@usuario"
  },
  "horarios": {
    "lunes": {
      "closed": false,
      "morning": { "enabled": true, "open": "08:00", "close": "12:00" },
      "afternoon": { "enabled": true, "open": "15:00", "close": "19:00" }
    },
    "domingo": { "closed": true }
  },
  "galeria": [
    "https://url.com/foto1.jpg",
    "https://url.com/foto2.jpg"
  ]
}
```

`galeria` puede ser array vacío — la sección se oculta automáticamente.

## Comportamiento del CTA

- Sin servicio seleccionado → "Hola [nombre]! Vi tu perfil y quiero hacer una consulta."
- Con servicio seleccionado → "Hola [nombre]! Quiero consultar por el servicio: *[servicio]*. ¿Podemos coordinar?"

## Ideal para

Plomeros, electricistas, gasistas, albañiles, pintores, manicuras, peluqueros, profesores particulares, fotógrafos, diseñadores, cocineros a domicilio.
