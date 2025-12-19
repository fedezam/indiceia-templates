// indiceia-templates/core/productClassifier.js

/**
 * Clasifica productos en destacados y normales
 * sin exigir un esquema rígido.
 *
 * Reglas de destacado (OR):
 * - producto.destacado === true
 * - producto.destacado.activo === true
 * - producto.etiquetas incluye "destacado"
 *
 * @param {Array<Object>} productos
 * @returns {{ destacados: Array<Object>, normales: Array<Object> }}
 */
export function classifyProducts(productos = []) {
  const destacados = [];
  const normales = [];

  if (!Array.isArray(productos)) {
    return { destacados, normales };
  }

  productos.forEach((producto) => {
    if (!producto || typeof producto !== "object") {
      return;
    }

    const esDestacado =
      producto.destacado === true ||
      (typeof producto.destacado === "object" &&
        producto.destacado?.activo === true) ||
      (Array.isArray(producto.etiquetas) &&
        producto.etiquetas.map(e => String(e).toLowerCase()).includes("destacado"));

    if (esDestacado) {
      destacados.push(producto);
    } else {
      normales.push(producto);
    }
  });

  return { destacados, normales };
}
