// ============================================================
//  C1_SimpleCatalog — script.js
//  Lógica: categorías, variantes, carrito, delivery, checkout WhatsApp
// ============================================================

const NOMBRE         = '{{NOMBRE_COMERCIO}}';
const WHATSAPP       = '{{WHATSAPP}}';
const GOODS = JSON.parse(
  document.getElementById('__DATA__').textContent
);
const DELIVERY_COSTO = {{DELIVERY_COSTO}};  // número o null

// ── State ──
const cart             = {};
const selectedVariants = {};
let isDelivery         = false;

// ── Init ──
document.addEventListener('DOMContentLoaded', init);

function init() {
  document.getElementById('header-title').textContent = NOMBRE;
  buildTabs();
  buildSections();
  updateCartCount();
}

// ── Categorías ──
function getCategories() {
  return [...new Set(GOODS.map(g => g.categoria || 'General'))];
}

function buildTabs() {
  const categories = getCategories();
  const tabsEl = document.getElementById('tabs');
  tabsEl.innerHTML = '';

  categories.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (i === 0 ? ' active' : '');
    btn.textContent = cat;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.onclick = () => switchTab(cat, btn);
    tabsEl.appendChild(btn);
  });
}

function buildSections() {
  const categories = getCategories();
  const main = document.getElementById('main');
  main.innerHTML = '';

  categories.forEach((cat, i) => {
    const section = document.createElement('div');
    section.className = 'section' + (i === 0 ? ' active' : '');
    section.id = 'section-' + i;
    section.setAttribute('role', 'tabpanel');

    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = cat;
    section.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'grid';

    GOODS
      .filter(g => (g.categoria || 'General') === cat)
      .forEach(item => grid.appendChild(buildCard(item)));

    section.appendChild(grid);
    main.appendChild(section);
  });
}

function switchTab(cat, btn) {
  const categories = getCategories();

  // Update tabs
  document.querySelectorAll('.tab').forEach((t, i) => {
    const isActive = categories[i] === cat;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update sections
  document.querySelectorAll('.section').forEach((s, i) => {
    s.classList.toggle('active', categories[i] === cat);
  });

  // Scroll tab into view
  btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// ── Card builder ──
function buildCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  card.onclick = (e) => {
    // Prevent double-fire when clicking buttons inside
    if (e.target.closest('.add-btn') || e.target.closest('.variant-chip')) return;
  };

  // Image
  const imgWrap = document.createElement('div');
  imgWrap.className = 'card-img-wrap';
  if (item.imagen) {
    const img = document.createElement('img');
    img.className = 'card-img';
    img.src = item.imagen;
    img.alt = item.nombre;
    img.loading = 'lazy';
    img.onerror = () => {
      imgWrap.innerHTML = `<div class="card-no-img">🏪</div>`;
    };
    imgWrap.appendChild(img);
  } else {
    imgWrap.innerHTML = `<div class="card-no-img">🏪</div>`;
  }
  card.appendChild(imgWrap);

  // Body
  const body = document.createElement('div');
  body.className = 'card-body';

  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = item.nombre;
  body.appendChild(name);

  if (item.descripcion) {
    const desc = document.createElement('div');
    desc.className = 'card-desc';
    desc.textContent = item.descripcion;
    body.appendChild(desc);
  }

  // Variants
  if (item.variantes && item.variantes.length > 1) {
    selectedVariants[item.id] = item.variantes[0];

    const varRow = document.createElement('div');
    varRow.className = 'card-variants';

    item.variantes.forEach((v, i) => {
      const chip = document.createElement('button');
      chip.className = 'variant-chip' + (i === 0 ? ' active' : '');
      chip.textContent = v.label;
      chip.id = `chip-${item.id}-${v.id}`;
      chip.onclick = (e) => {
        e.stopPropagation();
        selectedVariants[item.id] = v;
        item.variantes.forEach(vv => {
          const el = document.getElementById(`chip-${item.id}-${vv.id}`);
          if (el) el.classList.toggle('active', vv.id === v.id);
        });
        const priceEl = document.getElementById(`price-${item.id}`);
        if (priceEl) priceEl.textContent = formatPrice(v.precio);
      };
      varRow.appendChild(chip);
    });
    body.appendChild(varRow);
  } else if (item.variantes && item.variantes.length === 1) {
    selectedVariants[item.id] = item.variantes[0];
  }

  // Footer
  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const price = document.createElement('span');
  price.className = 'card-price';
  price.id = `price-${item.id}`;
  const basePrice = item.variantes?.[0]?.precio ?? item.precio_final ?? 0;
  price.textContent = formatPrice(basePrice);
  footer.appendChild(price);

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.setAttribute('aria-label', `Agregar ${item.nombre}`);
  addBtn.innerHTML = '+';
  addBtn.onclick = (e) => {
    e.stopPropagation();
    addToCart(item);
    showToast('✓ ' + item.nombre);
  };
  footer.appendChild(addBtn);

  body.appendChild(footer);
  card.appendChild(body);
  return card;
}

// ── Cart logic ──
function addToCart(item) {
  const variant = selectedVariants[item.id] || null;
  const precio  = variant ? variant.precio : (item.precio_final ?? 0);
  const label   = variant ? `${item.nombre} (${variant.label})` : item.nombre;
  const key     = item.id + (variant ? '_' + variant.id : '');

  if (cart[key]) {
    cart[key].qty++;
  } else {
    cart[key] = { key, label, precio, qty: 1 };
  }

  updateCartCount();
}

function updateCartCount() {
  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-count');
  badge.textContent = total;
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
}

// ── Delivery ──
function setDelivery(val) {
  isDelivery = val;
  document.getElementById('opt-retiro').classList.toggle('active', !val);
  document.getElementById('opt-delivery').classList.toggle('active', val);
  document.getElementById('delivery-address').style.display = val ? 'block' : 'none';
  if (!val) document.getElementById('address-input').value = '';
  updateWaLink();
}

// ── Cart sheet ──
function openCart() {
  renderCartItems();
  document.getElementById('overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeCart();
}

function renderCartItems() {
  const items     = Object.values(cart);
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (!items.length) {
    container.innerHTML = '<p class="cart-empty">Todavía no agregaste nada 🛒</p>';
    document.getElementById('cart-total').textContent = formatPrice(0);
    document.getElementById('wa-btn').href = '#';
    return;
  }

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div class="cart-row-info">
        <div class="cart-row-name">${item.label}</div>
        ${item.qty > 1 ? `<div class="cart-row-sub">x${item.qty}</div>` : ''}
      </div>
      <div class="cart-row-price">${formatPrice(item.precio * item.qty)}</div>
    `;
    container.appendChild(row);
  });

  updateWaLink();
}

function updateWaLink() {
  const items    = Object.values(cart);
  if (!items.length) return;

  const subtotal    = items.reduce((s, i) => s + i.precio * i.qty, 0);
  const costoEnvio  = isDelivery && DELIVERY_COSTO > 0 ? DELIVERY_COSTO : null;
  const costoDesconocido = isDelivery && !costoEnvio;
  const total       = costoEnvio ? subtotal + costoEnvio : subtotal;

  // Total label
  document.getElementById('cart-total-label').textContent =
    costoDesconocido ? 'Subtotal' : 'Total';
  document.getElementById('cart-total').textContent = formatPrice(total);

  // Build message lines
  const lines = items.map(i =>
    `• ${i.label}${i.qty > 1 ? ' x' + i.qty : ''} — ${formatPrice(i.precio * i.qty)}`
  );

  if (isDelivery) {
    if (costoEnvio) {
      lines.push(`• 🛵 Envío a domicilio — ${formatPrice(costoEnvio)}`);
      lines.push('');
      lines.push(`*Total: ${formatPrice(total)}*`);
    } else {
      lines.push('');
      lines.push(`*Subtotal: ${formatPrice(subtotal)}*`);
      lines.push(`• 🛵 Envío a domicilio — a convenir`);
    }
    const address = document.getElementById('address-input')?.value?.trim();
    if (address) lines.push(`📍 ${address}`);
  } else {
    lines.push('');
    lines.push(`*Total: ${formatPrice(total)}*`);
    lines.push(`🏪 Retiro en local`);
  }

  const msg = `Hola *${NOMBRE}*! Vengo desde ÍndiceIA 🟣\n\nQuiero hacer el siguiente pedido:\n\n${lines.join('\n')}\n\nGracias 🙏`;
  document.getElementById('wa-btn').href =
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

// ── Toast ──
let toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

// ── Helpers ──
function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}
