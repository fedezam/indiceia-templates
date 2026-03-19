// =======================================
//  C3_RestaurantMenu — script.js
//  Full cart + modal + WhatsApp checkout
// =======================================

// — Placeholders —
const NOMBRE   = '{{NOMBRE_COMERCIO}}';
const WHATSAPP = '{{WHATSAPP}}';
const GOODS    = {{GOODS}};

// — State —
let cart        = [];
let activeCategory = 'all';
let searchQuery    = '';
let modalProduct   = null;
let modalQty       = 1;
let modalVariant   = null;

// — Emoji fallbacks per category keyword —
const CATEGORY_EMOJI = {
  'entrada': '🥗', 'entradas': '🥗',
  'principal': '🍽️', 'principales': '🍽️', 'plato': '🍽️',
  'postre': '🍮', 'postres': '🍮',
  'bebida': '🥤', 'bebidas': '🥤', 'trago': '🍹',
  'pizza': '🍕', 'burger': '🍔', 'hamburguesa': '🍔',
  'pasta': '🍝', 'ensalada': '🥗', 'sushi': '🍣',
  'taco': '🌮', 'sándwich': '🥪', 'sandwich': '🥪',
  'pollo': '🍗', 'carne': '🥩', 'pescado': '🐟',
  'vegano': '🌿', 'vegetariano': '🥦',
  'desayuno': '☕', 'cafe': '☕', 'café': '☕',
};
function emojiForCategory(cat) {
  if (!cat) return '🍽️';
  const key = cat.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k)) return v;
  }
  return '🍽️';
}

// — Init —
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('shop-name-display').textContent = NOMBRE;
  buildCategories();
  renderProducts();
});

// — Category tabs —
function buildCategories() {
  const cats = ['all', ...new Set(GOODS.map(g => g.categoria).filter(Boolean))];
  const nav = document.getElementById('category-tabs');
  nav.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (cat === 'all' ? ' active' : '');
    btn.textContent = cat === 'all' ? 'Todo' : cat;
    btn.onclick = () => filterCategory(cat, btn);
    nav.appendChild(btn);
  });
}

function filterCategory(cat, btn) {
  activeCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  searchQuery = '';
  document.getElementById('search-input').value = '';
  renderProducts();
}

function filterProducts() {
  searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
  activeCategory = 'all';
  document.querySelectorAll('.cat-tab').forEach((b, i) => {
    b.classList.toggle('active', i === 0);
  });
  renderProducts();
}

// — Render products —
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('empty-state');
  grid.innerHTML = '';

  let items = GOODS;
  if (activeCategory !== 'all') {
    items = items.filter(g => g.categoria === activeCategory);
  }
  if (searchQuery) {
    items = items.filter(g =>
      (g.nombre || '').toLowerCase().includes(searchQuery) ||
      (g.descripcion || '').toLowerCase().includes(searchQuery) ||
      (g.categoria || '').toLowerCase().includes(searchQuery)
    );
  }

  if (items.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  // Group by category when showing all
  if (activeCategory === 'all' && !searchQuery) {
    const grouped = {};
    items.forEach(g => {
      const cat = g.categoria || 'Otros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(g);
    });
    Object.entries(grouped).forEach(([cat, products], idx) => {
      const title = document.createElement('div');
      title.className = 'category-section-title';
      title.style.animationDelay = (idx * 0.05) + 's';
      title.textContent = cat;
      grid.appendChild(title);
      products.forEach(p => grid.appendChild(createCard(p)));
    });
  } else {
    items.forEach(p => grid.appendChild(createCard(p)));
  }
}

function createCard(product) {
  const minPrice = getMinPrice(product);
  const card = document.createElement('div');
  card.className = 'product-card';
  card.onclick = () => openModal(product);

  card.innerHTML = `
    <div class="card-img-wrap">
      ${product.imagen
        ? `<img class="card-img" src="${product.imagen}" alt="${product.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=card-no-img>${emojiForCategory(product.categoria)}</div>'" />`
        : `<div class="card-no-img">${emojiForCategory(product.categoria)}</div>`
      }
    </div>
    <div class="card-body">
      ${product.categoria ? `<div class="card-cat">${product.categoria}</div>` : ''}
      <div class="card-name">${product.nombre}</div>
      ${product.descripcion ? `<div class="card-desc">${product.descripcion}</div>` : ''}
      <div class="card-footer">
        <span class="card-price">${formatPrice(minPrice)}</span>
        <button class="card-add-btn" onclick="event.stopPropagation(); quickAdd(event, '${product.id}')">+</button>
      </div>
    </div>
  `;
  return card;
}

function getMinPrice(product) {
  if (product.variantes && product.variantes.length > 0) {
    return Math.min(...product.variantes.map(v => v.precio));
  }
  return product.precio_final || 0;
}

function formatPrice(num) {
  return '$' + Number(num).toLocaleString('es-AR');
}

// — Quick add (no variants) —
function quickAdd(event, productId) {
  const product = GOODS.find(g => g.id === productId);
  if (!product) return;
  if (product.variantes && product.variantes.length > 1) {
    openModal(product);
    return;
  }
  const variant = (product.variantes && product.variantes.length === 1) ? product.variantes[0] : null;
  const price = variant ? variant.precio : product.precio_final;
  addToCart(product, variant, 1, price);
  animateBadge();
}

// — Cart logic —
function addToCart(product, variant, qty, price) {
  const key = product.id + (variant ? '_' + variant.id : '');
  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      id: product.id,
      nombre: product.nombre,
      variantLabel: variant ? variant.label : null,
      price,
      qty,
    });
  }
  updateCartUI();
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  updateCartUI();
  renderCartItems();
}

function changeCartQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(key); return; }
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = total;
}

function animateBadge() {
  const badge = document.getElementById('cart-count');
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

// — Cart sheet —
function toggleCart() {
  const sheet = document.getElementById('cart-sheet');
  if (sheet.classList.contains('open')) {
    closeCart();
  } else {
    openCart();
  }
}
function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-sheet').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-sheet').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const emptyMsg = document.getElementById('cart-empty-msg');
  const footer = document.getElementById('cart-footer');

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty-msg">Tu carrito está vacío 🍽️</div>';
    footer.style.display = 'none';
    return;
  }
  footer.style.display = '';
  container.innerHTML = '';

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.nombre}</div>
        ${item.variantLabel ? `<div class="cart-item-variant">${item.variantLabel}</div>` : ''}
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-sm" onclick="changeCartQty('${item.key}', -1)">−</button>
        <span class="qty-sm-num">${item.qty}</span>
        <button class="qty-sm" onclick="changeCartQty('${item.key}', 1)">+</button>
      </div>
    `;
    container.appendChild(row);
  });

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-total').textContent = formatPrice(total);
}

// — Product modal —
function openModal(product) {
  modalProduct = product;
  modalQty = 1;
  modalVariant = (product.variantes && product.variantes.length > 0) ? product.variantes[0] : null;

  // Image
  const imgWrap = document.getElementById('modal-img-wrap');
  if (product.imagen) {
    imgWrap.innerHTML = `<img src="${product.imagen}" alt="${product.nombre}" onerror="this.parentElement.innerHTML='<div class=modal-no-img>${emojiForCategory(product.categoria)}</div>'" />`;
  } else {
    imgWrap.innerHTML = `<div class="modal-no-img">${emojiForCategory(product.categoria)}</div>`;
  }

  document.getElementById('modal-cat').textContent = product.categoria || '';
  document.getElementById('modal-name').textContent = product.nombre;
  document.getElementById('modal-desc').textContent = product.descripcion || '';
  document.getElementById('modal-qty').textContent = '1';

  // Variants
  const variantsContainer = document.getElementById('modal-variants');
  if (product.variantes && product.variantes.length > 1) {
    variantsContainer.innerHTML = `
      <div class="variants-label">Tamaño / Variante</div>
      <div class="variants-row" id="variants-row">
        ${product.variantes.map((v, i) => `
          <button class="variant-btn${i === 0 ? ' selected' : ''}"
            onclick="selectVariant('${v.id}')"
            data-variant-id="${v.id}">
            ${v.label}
          </button>
        `).join('')}
      </div>
    `;
  } else {
    variantsContainer.innerHTML = '';
  }

  updateModalPrice();

  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
  modalProduct = null;
}

function selectVariant(variantId) {
  if (!modalProduct) return;
  modalVariant = modalProduct.variantes.find(v => v.id === variantId);
  document.querySelectorAll('.variant-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.variantId === variantId);
  });
  updateModalPrice();
}

function changeQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById('modal-qty').textContent = modalQty;
  updateModalPrice();
}

function updateModalPrice() {
  if (!modalProduct) return;
  const unitPrice = modalVariant ? modalVariant.precio : (modalProduct.precio_final || 0);
  document.getElementById('modal-price').textContent = formatPrice(unitPrice);
  document.getElementById('modal-subtotal').textContent = formatPrice(unitPrice * modalQty);
}

function addFromModal() {
  if (!modalProduct) return;
  const unitPrice = modalVariant ? modalVariant.precio : (modalProduct.precio_final || 0);
  addToCart(modalProduct, modalVariant, modalQty, unitPrice);
  animateBadge();
  closeModal();
}

// — WhatsApp checkout —
function checkoutWhatsApp() {
  if (cart.length === 0) return;

  const lines = cart.map(item => {
    const varLabel = item.variantLabel ? ` (${item.variantLabel})` : '';
    return `• ${item.qty}x ${item.nombre}${varLabel} — ${formatPrice(item.price * item.qty)}`;
  });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  lines.push('');
  lines.push(`*Total: ${formatPrice(total)}*`);

  const msg = `Hola *${NOMBRE}*! Quiero hacer el siguiente pedido:\n\n${lines.join('\n')}\n\n¡Gracias! 🙏`;
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}
