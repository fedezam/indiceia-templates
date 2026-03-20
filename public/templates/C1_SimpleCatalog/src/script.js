// ============================================================
//  C1_SimpleCatalog — script.js
// ============================================================

// 🔐 Datos seguros (sin romper JS)
const NOMBRE   = '{{NOMBRE_COMERCIO}}';
const WHATSAPP = '{{WHATSAPP}}';

// 🧠 DATA desde <script type="application/json">
const dataEl = document.getElementById('__DATA__');
const dataEl = document.getElementById('__DATA__');

const GOODS = dataEl
  ? JSON.parse(atob(dataEl.textContent))
  : [];

// 🧠 Delivery seguro (evita romper JS)
const RAW_DELIVERY_COSTO = '{{DELIVERY_COSTO}}';
const DELIVERY_COSTO = RAW_DELIVERY_COSTO === 'null'
  ? null
  : Number(RAW_DELIVERY_COSTO);

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

  document.querySelectorAll('.tab').forEach((t, i) => {
    const isActive = categories[i] === cat;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  document.querySelectorAll('.section').forEach((s, i) => {
    s.classList.toggle('active', categories[i] === cat);
  });

  btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// ── Card builder ──
function buildCard(item) {
  const card = document.createElement('div');
  card.className = 'card';

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

  if (item.variantes && item.variantes.length > 1) {
    selectedVariants[item.id] = item.variantes[0];

    const varRow = document.createElement('div');
    varRow.className = 'card-variants';

    item.variantes.forEach((v, i) => {
      const chip = document.createElement('button');
      chip.className = 'variant-chip' + (i === 0 ? ' active' : '');
      chip.textContent = v.label;
      chip.onclick = (e) => {
        e.stopPropagation();
        selectedVariants[item.id] = v;
      };
      varRow.appendChild(chip);
    });

    body.appendChild(varRow);
  }

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const price = document.createElement('span');
  price.className = 'card-price';
  const basePrice = item.variantes?.[0]?.precio ?? item.precio_final ?? 0;
  price.textContent = formatPrice(basePrice);

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.innerHTML = '+';
  addBtn.onclick = (e) => {
    e.stopPropagation();
    addToCart(item);
  };

  footer.appendChild(price);
  footer.appendChild(addBtn);
  body.appendChild(footer);
  card.appendChild(body);

  return card;
}

// ── Cart ──
function addToCart(item) {
  const variant = selectedVariants[item.id] || null;
  const precio  = variant ? variant.precio : (item.precio_final ?? 0);
  const key     = item.id + (variant ? '_' + variant.id : '');

  if (cart[key]) {
    cart[key].qty++;
  } else {
    cart[key] = { key, precio, qty: 1 };
  }

  updateCartCount();
}

function updateCartCount() {
  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = total;
}

// ── Helpers ──
function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}
