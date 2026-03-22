const NOMBRE   = '{{NOMBRE_COMERCIO}}';
const WHATSAPP = '{{WHATSAPP}}';
const GOODS    = {{GOODS}};
const SERVICES = {{SERVICES}};
const PROFILE  = {{PROFILE}};

// ── Estado ──────────────────────────────────────────────────
let cart            = {};  // { id: { producto, qty } }
let selectedService = null;
let activeCat       = 'all';
let activeTab       = 'inicio';

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  initInicio();
  initProductos();
  initServicios();
  initInfo();
  updateCartUI();
});

// ── TABS ────────────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  // Mostrar/ocultar CTAs según tab
  const cartBtn = document.getElementById('cart-float-btn');
  const svcCta  = document.getElementById('svc-cta');

  if (tab === 'productos') {
    updateCartUI();
  } else {
    if (cartBtn) cartBtn.classList.remove('visible');
  }

  if (tab === 'servicios') {
    updateSvcCTA();
  } else {
    if (svcCta) svcCta.classList.remove('visible');
  }
}

// ── HERO ────────────────────────────────────────────────────
function initHero() {
  const eyebrow = document.getElementById('hero-eyebrow');
  const desc    = document.getElementById('hero-desc');
  const pills   = document.getElementById('hero-pills');
  const stats   = document.getElementById('hero-stats');

  if (eyebrow) eyebrow.textContent = PROFILE.especialidad || 'Negocio';
  if (desc && PROFILE.descripcion) desc.textContent = PROFILE.descripcion;

  if (pills) {
    const items = [];
    if (PROFILE.ubicacion?.zona) items.push({ icon: '📍', text: PROFILE.ubicacion.zona });
    if (PROFILE.experiencia)     items.push({ icon: '⏱', text: PROFILE.experiencia });
    items.forEach(({ icon, text }) => {
      const pill = document.createElement('div');
      pill.className = 'hero-pill';
      pill.innerHTML = `<span>${icon}</span>${text}`;
      pills.appendChild(pill);
    });
  }

  if (stats) {
    const items = [];
    const prods = (GOODS || []).filter(p => !p.paused).length;
    const svcs  = (SERVICES || []).filter(s => s.activo !== false).length;
    if (prods > 0) items.push({ num: prods, label: 'Productos' });
    if (svcs  > 0) items.push({ num: svcs,  label: 'Servicios' });
    items.forEach(({ num, label }) => {
      const stat = document.createElement('div');
      stat.className = 'hero-stat';
      stat.innerHTML = `<span class="hero-stat-num">${num}</span><span class="hero-stat-label">${label}</span>`;
      stats.appendChild(stat);
    });
  }
}

// ── INICIO ──────────────────────────────────────────────────
function initInicio() {
  const links   = document.getElementById('quick-links');
  const waDirect = document.getElementById('wa-direct');

  if (links) {
    const prods = (GOODS || []).filter(p => !p.paused).length;
    const svcs  = (SERVICES || []).filter(s => s.activo !== false).length;

    if (prods > 0) {
      const btn = document.createElement('button');
      btn.className = 'quick-link';
      btn.innerHTML = `
        <div class="quick-link-icon productos">🛍</div>
        <div class="quick-link-label">Productos</div>
        <div class="quick-link-count">${prods} disponibles</div>
      `;
      btn.onclick = () => switchTab('productos');
      links.appendChild(btn);
    }

    if (svcs > 0) {
      const btn = document.createElement('button');
      btn.className = 'quick-link';
      btn.innerHTML = `
        <div class="quick-link-icon servicios">🔧</div>
        <div class="quick-link-label">Servicios</div>
        <div class="quick-link-count">${svcs} disponibles</div>
      `;
      btn.onclick = () => switchTab('servicios');
      links.appendChild(btn);
    }
  }

  if (waDirect) {
    waDirect.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola ${NOMBRE}! Vi tu perfil y quiero consultar.`)}`;
  }
}

// ── PRODUCTOS ───────────────────────────────────────────────
function initProductos() {
  const items = (GOODS || []).filter(p => !p.paused);
  const catScroll = document.getElementById('cat-scroll');
  const grid      = document.getElementById('product-grid');
  const countEl   = document.getElementById('prod-count');

  if (!items.length) {
    if (grid) grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📦</div><p>Sin productos disponibles</p></div>';
    const navBtn = document.getElementById('nav-productos');
    if (navBtn) navBtn.style.display = 'none';
    return;
  }

  if (countEl) countEl.textContent = `${items.length} productos`;

  // Categorías
  const cats = ['all', ...new Set(items.map(p => p.categoria).filter(Boolean))];

  if (catScroll && cats.length > 2) {
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn' + (cat === 'all' ? ' active' : '');
      btn.textContent = cat === 'all' ? 'Todo' : cat;
      btn.addEventListener('click', () => {
        activeCat = cat;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderProductos(items);
      });
      catScroll.appendChild(btn);
    });
  } else if (catScroll) {
    catScroll.style.display = 'none';
  }

  renderProductos(items);
}

function renderProductos(items) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = activeCat === 'all' ? items : items.filter(p => p.categoria === activeCat);

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🔍</div><p>Sin productos en esta categoría</p></div>';
    return;
  }

  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${i * 0.04}s`;

    const imgHtml = p.imagen
      ? `<img class="product-img" src="${p.imagen}" alt="${p.nombre}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'product-img-placeholder\\'>🛍</div>'">`
      : `<div class="product-img-placeholder">🛍</div>`;

    card.innerHTML = `
      ${imgHtml}
      <div class="product-body">
        <div class="product-name">${p.nombre}</div>
        ${p.descripcion ? `<div class="product-desc">${p.descripcion}</div>` : ''}
        <div class="product-footer">
          <span class="product-price">${p.precio_final ? `$${p.precio_final.toLocaleString('es-AR')}` : 'Consultar'}</span>
          ${p.precio_final ? `<button class="product-add" onclick="addToCart('${p.id || p.nombre}', event)">+</button>` : ''}
        </div>
      </div>
    `;

    // Guardar referencia del producto
    card.dataset.pid = p.id || p.nombre;
    window.__productos = window.__productos || {};
    window.__productos[p.id || p.nombre] = p;

    grid.appendChild(card);
  });
}

// ── CARRITO ─────────────────────────────────────────────────
function addToCart(id, e) {
  e?.stopPropagation();
  const p = window.__productos?.[id];
  if (!p) return;

  if (cart[id]) cart[id].qty++;
  else cart[id] = { producto: p, qty: 1 };

  updateCartUI();

  // Micro feedback
  const btn = e?.target;
  if (btn) {
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '+'; }, 600);
  }
}

function updateCartUI() {
  const total    = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const badge    = document.getElementById('cart-badge');
  const floatBtn = document.getElementById('cart-float-btn');
  const floatLbl = document.getElementById('cart-float-label');

  if (badge) {
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
  }

  if (activeTab === 'productos') {
    if (floatBtn) floatBtn.classList.toggle('visible', total > 0);
    if (floatLbl) floatLbl.textContent = `Ver pedido (${total})`;
  }
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-sheet')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sheet')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total-value');
  const checkoutBtn = document.getElementById('cart-checkout');
  if (!container) return;

  container.innerHTML = '';
  let total = 0;

  Object.entries(cart).forEach(([id, { producto: p, qty }]) => {
    const subtotal = (p.precio_final || 0) * qty;
    total += subtotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-name">${p.nombre}</div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" onclick="changeQty('${id}', -1)">−</button>
        <span class="cart-qty">${qty}</span>
        <button class="cart-qty-btn" onclick="changeQty('${id}', 1)">+</button>
      </div>
      <div class="cart-item-price">${subtotal ? `$${subtotal.toLocaleString('es-AR')}` : 'Consultar'}</div>
    `;
    container.appendChild(row);
  });

  if (totalEl) totalEl.textContent = total ? `$${total.toLocaleString('es-AR')}` : '$0';

  if (checkoutBtn) {
    const lines = Object.values(cart).map(({ producto: p, qty }) =>
      `• ${p.nombre} x${qty}${p.precio_final ? ` — $${(p.precio_final * qty).toLocaleString('es-AR')}` : ''}`
    );
    const msg = `Hola ${NOMBRE}! Quiero hacer este pedido:\n\n${lines.join('\n')}\n\nTotal: $${total.toLocaleString('es-AR')}`;
    checkoutBtn.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  renderCartItems();
  updateCartUI();
}

// ── SERVICIOS ───────────────────────────────────────────────
function initServicios() {
  const list   = document.getElementById('services-list');
  const countEl = document.getElementById('svc-count');
  const items  = (SERVICES || []).filter(s => s.activo !== false);

  if (!items.length) {
    if (list) list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔧</div><p>Sin servicios disponibles</p></div>';
    const navBtn = document.getElementById('nav-servicios');
    if (navBtn) navBtn.style.display = 'none';
    return;
  }

  if (countEl) countEl.textContent = `${items.length} servicios`;

  const mLabels = { presencial: 'En el local', a_domicilio: 'A domicilio', remoto: 'Online' };
  const dLabels = { inmediata: 'Sin turno', a_coordinar: 'Con turno' };

  items.forEach((svc, i) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.dataset.id = svc.id;

    const mods = (Array.isArray(svc.modalidad) ? svc.modalidad : [svc.modalidad])
      .map(m => mLabels[m] || m).filter(Boolean);
    const disp = dLabels[svc.disponibilidad] || svc.disponibilidad || '';

    const precioHTML = svc.precio?.tipo === 'fijo'
      ? `<span class="service-price">$${svc.precio.valor.toLocaleString('es-AR')}</span>`
      : `<span class="service-price consultar">A consultar</span>`;

    card.innerHTML = `
      ${svc.imagen ? `<img class="service-img" src="${svc.imagen}" alt="${svc.nombre}" loading="lazy">` : ''}
      <div class="service-body">
        <div class="service-header">
          <div class="service-name">${svc.nombre}</div>
          ${precioHTML}
        </div>
        ${svc.descripcion ? `<p class="service-desc">${svc.descripcion.replace(/\n/g,'<br>')}</p>` : ''}
        <div class="service-tags">
          ${mods.map(m => `<span class="service-tag tag-modalidad">${m}</span>`).join('')}
          ${disp ? `<span class="service-tag tag-disp">${disp}</span>` : ''}
        </div>
        <div class="service-select-row">
          <span style="font-size:12px;color:var(--ink-mute)">Tocá para consultar</span>
          <button class="service-select-btn" onclick="selectService('${svc.id}', event)">Consultar</button>
        </div>
      </div>
    `;

    if (list) list.appendChild(card);
  });

  // Guardar servicios en window para referencia
  window.__servicios = {};
  items.forEach(s => { window.__servicios[s.id] = s; });
}

function selectService(id, e) {
  e?.stopPropagation();
  const svc = window.__servicios?.[id];
  if (!svc) return;

  const isSame = selectedService?.id === id;
  selectedService = isSame ? null : svc;

  document.querySelectorAll('.service-card').forEach(c => {
    const isSelected = c.dataset.id === id && !isSame;
    c.classList.toggle('selected', isSelected);
    const btn = c.querySelector('.service-select-btn');
    if (btn) btn.textContent = isSelected ? 'Seleccionado ✓' : 'Consultar';
  });

  updateSvcCTA();
}

function updateSvcCTA() {
  const cta = document.getElementById('svc-cta');
  const btn = document.getElementById('svc-cta-btn');
  const lbl = document.getElementById('svc-cta-label');

  if (!cta || !btn) return;

  if (activeTab !== 'servicios') { cta.classList.remove('visible'); return; }

  const svc = selectedService;
  const msg = svc
    ? `Hola ${NOMBRE}! Quiero consultar por el servicio: *${svc.nombre}*. ¿Podemos coordinar?`
    : `Hola ${NOMBRE}! Vi tus servicios y quiero hacer una consulta.`;

  btn.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  if (lbl) lbl.textContent = svc ? `Consultar por ${svc.nombre}` : 'Consultar por WhatsApp';
  cta.classList.add('visible');
}

// ── INFO ────────────────────────────────────────────────────
function initInfo() {
  initHorarios();
  initContacto();
  initGaleria();
}

function initHorarios() {
  const container = document.getElementById('horarios-rows');
  if (!container) return;

  const horarios = PROFILE.horarios || {};
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const labels = { lunes:'Lunes', martes:'Martes', miercoles:'Miércoles', jueves:'Jueves', viernes:'Viernes', sabado:'Sábado', domingo:'Domingo' };
  const hoy = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][new Date().getDay()];

  dias.forEach(dia => {
    const h = horarios[dia];
    if (!h) return;
    const row = document.createElement('div');
    row.className = 'horario-row';

    const diaEl = document.createElement('div');
    diaEl.className = 'horario-dia' + (dia === hoy ? ' hoy' : '');
    diaEl.textContent = labels[dia] + (dia === hoy ? ' ·' : '');

    const valEl = document.createElement('div');
    valEl.className = 'horario-valor';

    if (h.closed) {
      valEl.innerHTML = '<span class="horario-cerrado">Cerrado</span>';
    } else {
      const partes = [];
      if (h.morning?.enabled)   partes.push(`${h.morning.open} – ${h.morning.close}`);
      if (h.afternoon?.enabled) partes.push(`${h.afternoon.open} – ${h.afternoon.close}`);
      valEl.textContent = partes.join('  /  ') || `${h.open || ''}–${h.close || ''}`;
    }

    row.appendChild(diaEl);
    row.appendChild(valEl);
    container.appendChild(row);
  });
}

function initContacto() {
  const container = document.getElementById('contact-rows');
  if (!container) return;

  const c = PROFILE.contacto || {};
  const iconPin   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const iconPhone = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
  const iconMail  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
  const iconInsta = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;

  const items = [
    { icon: iconPin,   label: PROFILE.ubicacion?.zona },
    { icon: iconPhone, label: c.whatsapp ? `+${c.whatsapp}` : null },
    { icon: iconMail,  label: c.email },
    { icon: iconInsta, label: c.instagram },
  ];

  items.forEach(({ icon, label }) => {
    if (!label) return;
    const row = document.createElement('div');
    row.className = 'contact-row';
    row.innerHTML = `<div class="contact-icon">${icon}</div><span>${label}</span>`;
    container.appendChild(row);
  });
}

function initGaleria() {
  const grid    = document.getElementById('gallery-grid');
  const section = document.getElementById('gallery-section');
  const fotos   = PROFILE.galeria || [];

  if (!fotos.length || !section) return;

  section.style.display = 'block';

  fotos.forEach((url, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `<img src="${url}" alt="Foto ${i+1}" loading="lazy">`;
    item.addEventListener('click', () => openLightbox(url));
    grid?.appendChild(item);
  });
}

function openLightbox(url) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img) return;
  img.src = url;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
  document.body.style.overflow = '';
}
