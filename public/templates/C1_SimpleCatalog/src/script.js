// ============================================================
//  C1_SimpleCatalog — script.js
// ============================================================

let NOMBRE   = '';
let WHATSAPP = '';
let GOODS    = [];
let ENTREGA  = null;
const cart   = {};
let isDelivery = false;

let _data = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  _data    = JSON.parse(document.getElementById('__DATA__').textContent);
  GOODS    = _data.goods    || [];
  NOMBRE   = _data.nombre   || '';
  WHATSAPP = _data.whatsapp || '';
  ENTREGA  = _data.entrega  || null;

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
  renderCartItems();
  updateWaLink();
}

function getDeliveryCost() {
  const costo = ENTREGA?.delivery?.costo;
  if (!costo) return null;
  if (costo.tipo === 'fijo') return costo.valor;
  return null; // zona u otro = a convenir
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const items = Object.entries(cart).map(([id, v]) => ({ id, ...v }));

  if (!items.length) {
    container.innerHTML = '<p class="cart-empty">Todavía no agregaste nada 🛒</p>';
    document.getElementById('cart-total').textContent = formatPrice(0);
    document.getElementById('cart-total-label').textContent = 'Total';
    return;
  }

  container.innerHTML = '';

  // Items
  let subtotal = 0;
  items.forEach(({ nombre, precio, qty }) => {
    const s = precio * qty;
    subtotal += s;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <div class="cart-row-info">
        <div class="cart-row-name">${nombre}</div>
        <div class="cart-row-sub">x${qty}</div>
      </div>
      <div class="cart-row-price">${formatPrice(s)}</div>
    `;
    container.appendChild(row);
  });

  // Subtotal row
  const subtotalRow = document.createElement('div');
  subtotalRow.className = 'cart-row';
  subtotalRow.innerHTML = `
    <div class="cart-row-info"><div class="cart-row-name">Subtotal</div></div>
    <div class="cart-row-price">${formatPrice(subtotal)}</div>
  `;
  container.appendChild(subtotalRow);

  // Delivery row
  let total = subtotal;
  if (isDelivery) {
    const costVal = getDeliveryCost();
    const deliveryRow = document.createElement('div');
    deliveryRow.className = 'cart-row';
    if (costVal !== null) {
      total += costVal;
      deliveryRow.innerHTML = `
        <div class="cart-row-info"><div class="cart-row-name">🛵 Envío</div></div>
        <div class="cart-row-price">${formatPrice(costVal)}</div>
      `;
    } else {
      deliveryRow.innerHTML = `
        <div class="cart-row-info"><div class="cart-row-name">🛵 Envío</div></div>
        <div class="cart-row-price">a convenir</div>
      `;
    }
    container.appendChild(deliveryRow);
  }

  // Total
  const totalLabel = isDelivery && getDeliveryCost() === null ? 'Total (+ envío a convenir)' : 'Total';
  document.getElementById('cart-total-label').textContent = totalLabel;
  document.getElementById('cart-total').textContent = formatPrice(total);
}

function updateWaLink() {
  const items = Object.entries(cart).map(([, v]) => `• ${v.nombre} x${v.qty} = ${formatPrice(v.precio * v.qty)}`);
  if (!items.length) return;

  const subtotal = Object.values(cart).reduce((s, v) => s + v.precio * v.qty, 0);
  const costVal  = getDeliveryCost();

  let entregaLinea = '';
  let total = subtotal;

  if (isDelivery) {
    if (costVal !== null) {
      total += costVal;
      entregaLinea = `\n🛵 Envío: ${formatPrice(costVal)}`;
    } else {
      entregaLinea = `\n🛵 Envío: a convenir`;
    }
    const address = document.getElementById('address-input')?.value;
    if (address) entregaLinea += `\n📍 Dirección: ${address}`;
  } else {
    entregaLinea = `\n🏪 Retiro en local`;
  }

  const msg =
    `Hola ${NOMBRE}, vengo de ÍndiceIA 🤖 y quiero hacer un pedido:\n\n` +
    `${items.join('\n')}\n\n` +
    `💰 Subtotal: ${formatPrice(subtotal)}` +
    entregaLinea +
    (isDelivery && costVal !== null ? `\n✅ Total: ${formatPrice(total)}` : '');

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
