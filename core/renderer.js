// ===========================
// renderer.js – Universal Renderer
// ===========================

// Encapsulamos todo para no contaminar window
(function() {
  // ✅ Helper para crear elementos
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };

  // 🔹 Función principal expuesta al window
  window.renderTemplate = function(bloqueB) {
    if (!bloqueB || !bloqueB.catalogo || !bloqueB.catalogo.productos) {
      console.error("[Renderer] BloqueB inválido o incompleto");
      return;
    }

    const { productos, productosDestacados, moneda } = bloqueB.catalogo;
    const comercio = bloqueB.comercio;

    // ✅ Clasificación de productos
    // productClassifier.js debe estar cargado previamente
    const { destacados, resto } = window.classifyProducts(productos, productosDestacados);

    // ✅ Contenedor principal en el HTML
    const app = document.getElementById("app");
    if (!app) {
      console.error("[Renderer] No se encontró contenedor #app");
      return;
    }

    // Limpiamos contenedor previo
    app.innerHTML = "";

    // Renderizamos destacados primero
    if (destacados.length) {
      const dSection = el("section", "destacados");
      const title = el("h2", "titulo-seccion", "Productos Destacados");
      dSection.appendChild(title);

      destacados.forEach(prod => {
        const card = el("div", "card");
        card.appendChild(el("h3", "producto-nombre", prod.nombre));
        card.appendChild(el("p", "producto-precio", `${prod.precio_final} ${moneda}`));
        dSection.appendChild(card);
      });

      app.appendChild(dSection);
    }

    // Renderizamos resto de productos
    if (resto.length) {
      const rSection = el("section", "productos");
      const title = el("h2", "titulo-seccion", "Catálogo");
      rSection.appendChild(title);

      resto.forEach(prod => {
        const card = el("div", "card");
        card.appendChild(el("h3", "producto-nombre", prod.nombre));
        card.appendChild(el("p", "producto-precio", `${prod.precio_final} ${moneda}`));
        rSection.appendChild(card);
      });

      app.appendChild(rSection);
    }

    console.log("[Renderer] Renderizado completo:", { comercio, destacados, resto });
  };
})();
