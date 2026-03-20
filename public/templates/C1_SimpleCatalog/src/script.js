// ============================================================
//  C1_SimpleCatalog — script.js
// ============================================================

let NOMBRE   = '';
let WHATSAPP = '';
let GOODS    = [];
const cart   = {};
let isDelivery = false;

document.addEventListener('DOMContentLoaded', init);

function init() {
  const data = JSON.parse(document.getElementById('__DATA__').textContent);
  GOODS    = data.goods || [];
  NOMBRE   = data.nombre   || '';
  WHATSAPP = data.whatsapp || '';

  const headerEl = document.getElementById('header-title');
  if (headerEl) headerEl.textContent = NOMBRE;

  buildTabs();
  buildSections();
  updateCartCount();
}

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
    const items = GOODS.filter(g => (g.categoria || 'General') === cat);
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
  const card = document.createElement('div');
  card.className = 'card';

  // Imagen
  const imagen = item.imagen;
  if (imagen && !imagen.startsWith('data:') && !imagen.startsWith('https://www.google.com')) {
    const wrap = document.createElement('div');
    wrap.className = 'card-img-wrap';
    const img = document.createElement('img');
    img.className = 'card-img';
    img.src = imagen;
    img.alt = item.nombre;
    img.onerror = () => wrap.remove();
    wrap.appendChild(img);
    card.appendChild(wrap);
  }

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

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const price = document.createElement('span');
  price.className = 'card-price';
  const basePrice = item.variantes?.[0]?.precio ?? item.precio_final ?? 0;
  price.textContent = formatPrice(basePrice);

  const btn = document.createElement('button');
  btn.className = 'add-btn';
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
  else cart[key] = { nombre: item.nombre, precio: item.precio_final ?? 0, qty: 1 };
  updateCartCount();
  showToast(`${item.nombre} agregado`);
}

function updateCartCount() {
  const total = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) {
    el.textContent = total;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}

function openCart() {
  renderCartItems();
  updateWaLink();
  document.getElementById('overlay').classList.add('open');
}

function closeCart() {
  document.getElementById('overlay').classList.remove('open');
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeCart();
}

function setDelivery(val) {
  isDelivery = val;
  document.getElementById('opt-retiro').classList.toggle('active', !val);
  document.getElementById('opt-delivery').classList.toggle('active', val);
  document.getElementById('delivery-address').style.display = val ? 'block' : 'none';
  updateWaLink();
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const items = Object.entries(cart).map(([id, v]) => ({ id, ...v }));

  if (!items.length) {
    container.innerHTML = '<p class="cart-empty">Todavía no agregaste nada 🛒</p>';
    document.getElementById('cart-total').textContent = formatPrice(0);
    return;
  }

  container.innerHTML = '';
  let total = 0;
  items.forEach(({ nombre, precio, qty }) => {
    const subtotal = precio * qty;
    total += subtotal;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div class="cart-row-info">
        <div class="cart-row-name">${nombre}</div>
        <div class="cart-row-sub">x${qty}</div>
      </div>
      <div class="cart-row-price">${formatPrice(subtotal)}</div>
    `;
    container.appendChild(row);
  });

  document.getElementById('cart-total').textContent = formatPrice(total);
}

function updateWaLink() {
  const items = Object.entries(cart).map(([, v]) => `• ${v.nombre} x${v.qty} = ${formatPrice(v.precio * v.qty)}`);
  if (!items.length) return;

  const total = Object.values(cart).reduce((s, v) => s + v.precio * v.qty, 0);
  const address = isDelivery ? `\n📍 Dirección: ${document.getElementById('address-input')?.value || '(no ingresada)'}` : '\n🏪 Retiro en local';
  const msg = `Hola ${NOMBRE}, quiero hacer un pedido:\n\n${items.join('\n')}\n\n💰 Total: ${formatPrice(total)}${address}`;

  const link = document.getElementById('wa-btn');
  if (link) link.href = `https://wa.me/54${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('es-AR');
}
