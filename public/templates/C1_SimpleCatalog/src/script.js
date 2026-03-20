// ============================================================
//  C1_SimpleCatalog — script.js
// ============================================================

// ── Datos (se sobreescriben en init desde window.__DATA__)
let NOMBRE   = '';
let WHATSAPP = '';

// ── State ──
let GOODS = [];
const cart = {};
const selectedVariants = {};
let isDelivery = false;

// ── Init ──
document.addEventListener('DOMContentLoaded', init);

function init() {
  GOODS    = loadData();
  NOMBRE   = window.__DATA__?.nombre   || '';
  WHATSAPP = window.__DATA__?.whatsapp || '';
  document.getElementById('header-title').textContent = NOMBRE;
  buildTabs();
  buildSections();
  updateCartCount();
}

// ── DATA ──
function loadData() {
  // nueva arquitectura: window.__DATA__ inyectado por indiceia-public
  if (window.__DATA__?.goods) return window.__DATA__.goods;
  // fallback legacy: tag __DATA__ base64
  try {
    const el = document.getElementById('__DATA__');
    if (el?.textContent) return JSON.parse(atob(el.textContent));
  } catch (e) {
    console.error('DATA ERROR', e);
  }
  return [];
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
    t.classList.toggle('active', categories[i] === cat);
  });
  document.querySelectorAll('.section').forEach((s, i) => {
    s.classList.toggle('active', categories[i] === cat);
  });
  btn?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
}

// ── Card ──
function buildCard(item) {
  const card = document.createElement('div');
  card.className = 'card';
  const body = document.createElement('div');
  body.className = 'card-body';
  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = item.nombre;
  body.appendChild(name);
  const footer = document.createElement('div');
  footer.className = 'card-footer';
  const price = document.createElement('span');
  const basePrice = item.variantes?.[0]?.precio ?? item.precio_final ?? 0;
  price.textContent = formatPrice(basePrice);
  const btn = document.createElement('button');
  btn.textContent = '+';
  btn.onclick = () => addToCart(item);
  footer.appendChild(price);
  footer.appendChild(btn);
  body.appendChild(footer);
  card.appendChild(body);
  return card;
}

// ── Cart ──
function addToCart(item) {
  const key = item.id;
  if (cart[key]) cart[key].qty++;
  else cart[key] = { precio: item.precio_final ?? 0, qty: 1 };
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
