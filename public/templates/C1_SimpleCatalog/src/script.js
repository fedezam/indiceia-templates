// ============================================================
//  C1_SimpleCatalog — script.js
// ============================================================

let NOMBRE   = '';
let WHATSAPP = '';
let GOODS    = [];
const cart   = {};
const selectedVariants = {};
let isDelivery = false;

document.addEventListener('DOMContentLoaded', init);

function init() {
  console.log('✅ DOMContentLoaded — init arrancó');
  console.log('📦 window.__DATA__:', window.__DATA__);

  GOODS    = loadData();
  NOMBRE   = window.__DATA__?.nombre   || '';
  WHATSAPP = window.__DATA__?.whatsapp || '';

  console.log('🏪 NOMBRE:', NOMBRE);
  console.log('📱 WHATSAPP:', WHATSAPP);
  console.log('🛒 GOODS cantidad:', GOODS.length);
  console.log('🛒 GOODS:', GOODS);

  const headerEl = document.getElementById('header-title');
  console.log('🔍 header-title element:', headerEl);
  if (headerEl) headerEl.textContent = NOMBRE;

  buildTabs();
  buildSections();
  updateCartCount();

  console.log('✅ init terminó');
}

function loadData() {
  console.log('🔍 loadData — chequeando window.__DATA__:', window.__DATA__);

  if (window.__DATA__?.goods) {
    console.log('✅ datos desde window.__DATA__');
    return window.__DATA__.goods;
  }

  console.warn('⚠️ window.__DATA__ no tiene goods, probando fallback...');

  try {
    const el = document.getElementById('__DATA__');
    console.log('🔍 tag __DATA__:', el);
    if (el?.textContent) {
      const parsed = JSON.parse(el.textContent);
      console.log('✅ datos desde tag __DATA__ base64:', parsed);
      return parsed.goods || parsed;
    }
  } catch (e) {
    console.error('❌ DATA ERROR:', e);
  }

  console.error('❌ no hay datos de ningún lado');
  return [];
}

function getCategories() {
  return [...new Set(GOODS.map(g => g.categoria || 'General'))];
}

function buildTabs() {
  const categories = getCategories();
  console.log('🗂 categorías:', categories);
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
    console.log(`🏗 buildSection: ${cat}`);
    const section = document.createElement('div');
    section.className = 'section' + (i === 0 ? ' active' : '');
    const title = document.createElement('div');
    title.className = 'section-title';
    title.textContent = cat;
    section.appendChild(title);
    const grid = document.createElement('div');
    grid.className = 'grid';
    const items = GOODS.filter(g => (g.categoria || 'General') === cat);
    console.log(`📋 items en ${cat}:`, items.length);
    items.forEach(item => grid.appendChild(buildCard(item)));
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

function buildCard(item) {
  console.log('🃏 buildCard:', item.nombre);
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

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}
