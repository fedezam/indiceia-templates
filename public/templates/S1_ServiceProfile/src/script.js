const NOMBRE   = '{{NOMBRE_COMERCIO}}';
const WHATSAPP = '{{WHATSAPP}}';
const SERVICES = {{SERVICES}};
const PROFILE  = {{PROFILE}};

// ── Estado ──────────────────────────────────────────────────
let selectedService = null;

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderServices();
  renderGallery();
  renderHorarios();
  renderContacto();
  updateCTA();
});

// ── Servicios ───────────────────────────────────────────────
function renderServices() {
  const list = document.getElementById('services-list');
  if (!list) return;

  const activos = SERVICES.filter(s => s.activo !== false);

  if (activos.length === 0) {
    list.innerHTML = '<p style="color:#999;font-size:14px;padding:16px 0">Sin servicios disponibles</p>';
    return;
  }

  activos.forEach((svc, i) => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.dataset.id = svc.id;

    const modalidadLabels = {
      'presencial':   'En el local',
      'a_domicilio':  'A domicilio',
      'remoto':       'Online',
    };

    const dispLabels = {
      'inmediata':    'Sin turno',
      'a_coordinar':  'Con turno',
    };

    const modalidades = Array.isArray(svc.modalidad)
      ? svc.modalidad.map(m => modalidadLabels[m] || m)
      : [modalidadLabels[svc.modalidad] || svc.modalidad || ''];

    const dispLabel = dispLabels[svc.disponibilidad] || svc.disponibilidad || '';

    const precioHTML = svc.precio && svc.precio.tipo === 'fijo'
      ? `<span class="service-price">$${svc.precio.valor.toLocaleString('es-AR')}</span>`
      : `<span class="service-price consultar">A consultar</span>`;

    const tagsHTML = [
      ...modalidades.map(m => `<span class="service-tag tag-modalidad">${m}</span>`),
      dispLabel ? `<span class="service-tag tag-disponibilidad">${dispLabel}</span>` : ''
    ].join('');

    card.innerHTML = `
      <div class="service-header">
        <div class="service-name">${svc.nombre}</div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          ${precioHTML}
          <div class="service-select-indicator"></div>
        </div>
      </div>
      ${svc.descripcion ? `<p class="service-desc">${svc.descripcion.replace(/\n/g, '<br>')}</p>` : ''}
      <div class="service-tags">${tagsHTML}</div>
    `;

    card.addEventListener('click', () => selectService(svc, card));
    list.appendChild(card);
  });
}

function selectService(svc, card) {
  // Deseleccionar anterior
  document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));

  if (selectedService?.id === svc.id) {
    selectedService = null;
    updateSelectedLabel(null);
    updateCTA();
    return;
  }

  card.classList.add('selected');
  selectedService = svc;
  updateSelectedLabel(svc);
  updateCTA();

  // Scroll suave al CTA
  setTimeout(() => {
    document.querySelector('.cta-float')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function updateSelectedLabel(svc) {
  const label = document.getElementById('selected-label');
  if (!label) return;
  if (svc) {
    label.textContent = `✓ Seleccionaste: ${svc.nombre}`;
    label.classList.add('visible');
  } else {
    label.classList.remove('visible');
  }
}

// ── Galería ─────────────────────────────────────────────────
function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  const section = document.getElementById('gallery-section');
  if (!grid) return;

  const fotos = PROFILE.galeria || [];

  if (fotos.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }

  fotos.forEach((url, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.innerHTML = `<img src="${url}" alt="Trabajo ${i+1}" loading="lazy">`;
    item.addEventListener('click', () => openLightbox(url));
    grid.appendChild(item);
  });
}

function openLightbox(url) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lb || !img) return;
  img.src = url;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Horarios ────────────────────────────────────────────────
function renderHorarios() {
  const container = document.getElementById('horarios-grid');
  if (!container) return;

  const horarios = PROFILE.horarios || {};
  const dias = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  const diasLabels = {
    lunes:'Lunes', martes:'Martes', miercoles:'Miércoles',
    jueves:'Jueves', viernes:'Viernes', sabado:'Sábado', domingo:'Domingo'
  };

  const hoy = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'][new Date().getDay()];

  dias.forEach(dia => {
    const h = horarios[dia];
    if (!h) return;

    const row = document.createElement('div');
    row.className = 'horario-row';

    const diaEl = document.createElement('div');
    diaEl.className = 'horario-dia' + (dia === hoy ? ' hoy' : '');
    diaEl.textContent = diasLabels[dia] + (dia === hoy ? ' ·' : '');

    const valEl = document.createElement('div');
    valEl.className = 'horario-valor';

    if (h.closed) {
      valEl.innerHTML = '<span class="horario-cerrado">Cerrado</span>';
    } else if (h.continuous) {
      valEl.textContent = `${h.open} – ${h.close}`;
    } else {
      const partes = [];
      if (h.morning?.enabled)   partes.push(`${h.morning.open} – ${h.morning.close}`);
      if (h.afternoon?.enabled) partes.push(`${h.afternoon.open} – ${h.afternoon.close}`);
      valEl.textContent = partes.join('  /  ') || `${h.open} – ${h.close}`;
    }

    row.appendChild(diaEl);
    row.appendChild(valEl);
    container.appendChild(row);
  });
}

// ── Contacto ────────────────────────────────────────────────
function renderContacto() {
  const container = document.getElementById('contact-rows');
  if (!container) return;

  const contacto = PROFILE.contacto || {};

  const items = [
    { key: 'zona',      icon: iconPin,   label: PROFILE.ubicacion?.zona },
    { key: 'whatsapp',  icon: iconPhone, label: contacto.whatsapp ? `+${contacto.whatsapp}` : null },
    { key: 'email',     icon: iconMail,  label: contacto.email },
    { key: 'instagram', icon: iconInsta, label: contacto.instagram },
  ];

  items.forEach(({ icon, label }) => {
    if (!label) return;
    const row = document.createElement('div');
    row.className = 'contact-row';
    row.innerHTML = `
      <div class="contact-icon">${icon}</div>
      <span>${label}</span>
    `;
    container.appendChild(row);
  });
}

// ── CTA ─────────────────────────────────────────────────────
function updateCTA() {
  const btn = document.getElementById('cta-btn');
  if (!btn) return;

  const svc = selectedService;
  const msg = svc
    ? `Hola ${NOMBRE}! Quiero consultar por el servicio: *${svc.nombre}*. ¿Podemos coordinar?`
    : `Hola ${NOMBRE}! Vi tu perfil y quiero hacer una consulta.`;

  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  btn.href = url;

  const label = btn.querySelector('.cta-label');
  if (label) {
    label.textContent = svc ? `Consultar por ${svc.nombre}` : 'Contactar por WhatsApp';
  }
}

// ── SVG Icons ────────────────────────────────────────────────
const iconPin = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
const iconPhone = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
const iconMail = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
const iconInsta = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`;
