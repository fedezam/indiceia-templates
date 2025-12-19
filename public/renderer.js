/* =====================================================
   IndiceIA – Universal Renderer v1.0
   Renderer puro. No piensa. No decide.
   ===================================================== */

(function () {
  const root = document.getElementById("app");

  if (!root) {
    console.error("[Renderer] #app no encontrado");
    return;
  }

  // ---------- Helpers ----------

  const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

  const clear = () => (root.innerHTML = "");

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  };

  // ---------- Renderers de campo ----------

  const renderPrice = (precio) => {
    const box = el("div", "price");

    if (typeof precio === "number") {
      box.textContent = `$${precio}`;
      return box;
    }

    if (isObject(precio)) {
      Object.entries(precio).forEach(([k, v]) => {
        const row = el("div", "price-variant", `${k}: $${v}`);
        box.appendChild(row);
      });
    }

    return box;
  };

  const renderAttribute = (key, value) => {
    const row = el("div", "attr");

    const label = el("strong", null, `${key}: `);
    row.appendChild(label);

    if (Array.isArray(value)) {
      const select = el("select");
      value.forEach((v) => {
        const opt = el("option", null, v);
        select.appendChild(opt);
      });
      row.appendChild(select);
      return row;
    }

    if (typeof value === "boolean") {
      row.appendChild(el("span", null, value ? "Sí" : "No"));
      return row;
    }

    row.appendChild(el("span", null, value));
    return row;
  };

  // ---------- Render de producto ----------

  const renderProduct = (item) => {
    const card = el("div", "product");

    if (item.imagen) {
      const img = el("img");
      img.src = item.imagen;
      img.alt = item.producto || "producto";
      card.appendChild(img);
    }

    if (item.producto) {
      card.appendChild(el("h3", null, item.producto));
    }

    if (item.descripcion) {
      card.appendChild(el("p", "desc", item.descripcion));
    }

    if (item.precio !== undefined) {
      card.appendChild(renderPrice(item.precio));
    }

    // Atributos dinámicos
    if (isObject(item.atributos)) {
      Object.entries(item.atributos).forEach(([k, v]) => {
        card.appendChild(renderAttribute(k, v));
      });
    }

    return card;
  };

  // ---------- Render principal ----------

  window.renderTemplate = function (data) {
    clear();

    // Header comercio
    if (data.comercio) {
      const header = el("header");
      header.appendChild(el("h1", null, data.comercio.nombre || ""));
      header.appendChild(el("p", null, data.comercio.descripcion || ""));
      root.appendChild(header);
    }

    // Catálogo dinámico
    const catalogo = data.catalogo;

    if (!isObject(catalogo)) {
      root.appendChild(el("p", null, "Catálogo no válido"));
      return;
    }

    Object.entries(catalogo).forEach(([grupo, items]) => {
      const section = el("section");
      section.appendChild(el("h2", null, grupo));

      if (Array.isArray(items)) {
        items.forEach((item) => {
          section.appendChild(renderProduct(item));
        });
      }

      root.appendChild(section);
    });
  };
})();
