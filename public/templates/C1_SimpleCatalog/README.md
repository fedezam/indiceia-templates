# C1_SimpleCatalog

Template visual de **catálogo simple con carrito y checkout vía WhatsApp**.  
Forma parte del marketplace de templates de **ÍndiceIA**.

---

## 🧩 ¿Qué es este template?

`C1_SimpleCatalog` es una interfaz visual lista para usar que permite:

- Mostrar productos organizados por categorías
- Agregar productos a un carrito
- Calcular totales automáticamente
- Enviar el pedido por WhatsApp al comercio

Todo el contenido se renderiza **exclusivamente desde Bloque B**.  
No hay datos hardcodeados ni lógica de negocio embebida.

---

## ✅ Casos ideales de uso

Este template es ideal si tu comercio:

- Tiene **catálogo simple**
- Usa **WhatsApp como canal de ventas**
- No requiere configuraciones complejas por producto

### Rubros frecuentes
- Pizzerías
- Restaurantes
- Cafeterías
- Panaderías
- Bares
- Heladerías
- Comercios gastronómicos en general

---

## ❌ Cuándo NO usar este template

No es recomendado si necesitás:

- Variantes complejas (toppings, combinaciones)
- Múltiples imágenes por producto
- Búsqueda o filtros avanzados
- Checkout con pagos integrados

En esos casos, se recomienda un template C2 o C3.

---

## 📦 Datos requeridos (Bloque B)

```json
{
  "identity": {
    "nombre_comercio": "Mi Comercio"
  },
  "contacto": {
    "whatsapp_number": "549XXXXXXXXXX"
  },
  "catalogo": {
    "categorias": ["Categoria A", "Categoria B"],
    "items": [
      {
        "id": "A01",
        "nombre": "Producto",
        "categoria": "Categoria A",
        "image_url": "https://...",
        "precio": 1000
      }
    ]
  }
}

⚠️ **Si falta `whatsapp_number`, el checkout no puede funcionar.**

---

## 🧠 Integración con ÍndiceIA

Este template se activa cuando:

- Bloque C declara `template_id: C1_SimpleCatalog`
- El chat ofrece pasar de vista conversacional a vista visual
- El iframe recibe Bloque B completo vía `postMessage`

El template no toma decisiones: **solo renderiza**.

---

## 🛒 Marketplace & Templates Personalizados

Este template forma parte del marketplace oficial de ÍndiceIA.

Si sos comercio o desarrollador y necesitás:

- Branding personalizado
- Nuevas variantes visuales
- Funcionalidades adicionales

👉 ÍndiceIA ofrece templates a medida bajo esquema comercial.  
**Contacto:** contacto@indiceia.com

---

## 📄 Licencia

Uso comercial permitido únicamente dentro del ecosistema ÍndiceIA.