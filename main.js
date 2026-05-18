/* ════════════════════════════════════════════════════════
   AZIENDANAME — JavaScript Condiviso
   ════════════════════════════════════════════════════════ */

/* ── SICUREZZA: XSS prevention ──────────────────────────── */
function sanitize(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str || '')));
  return d.innerHTML;
}

/* ── VALIDAZIONE ────────────────────────────────────────── */
function isValidEmail(e) { return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,10}$/.test(e); }
function isValidPrice(v) { const n = parseFloat(v); return !isNaN(n) && n >= 0 && n < 100000; }

/* ── LOCAL STORAGE (safe) ───────────────────────────────── */
function getData(key, def = []) {
  try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
}
function setData(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { showToast('Errore salvataggio', 'error'); return false; }
}

/* ── TOAST ──────────────────────────────────────────────── */
let _toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  const icons = { success: '✓', error: '✕', '': 'ℹ' };
  t.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${sanitize(msg)}`;
  t.className = `toast show ${type}`;
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = 'toast'; }, 3800);
}

/* ── NAVBAR scroll ──────────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // Active link highlight
  const links = nav.querySelectorAll('.nav-links a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── MOBILE NAV ─────────────────────────────────────────── */
function toggleMobileNav() {
  const mob = document.getElementById('mobileNav');
  const ham = document.querySelector('.hamburger');
  if (!mob) return;
  const open = mob.classList.toggle('open');
  if (ham) ham.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeMobileNav() {
  const mob = document.getElementById('mobileNav');
  const ham = document.querySelector('.hamburger');
  if (mob) { mob.classList.remove('open'); }
  if (ham) { ham.classList.remove('open'); }
  document.body.style.overflow = '';
}

/* ── FADE-IN OBSERVER ───────────────────────────────────── */
function initFadeIn() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

/* ── MODAL ──────────────────────────────────────────────── */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

/* ══ ADMIN AUTH ═══════════════════════════════════════════ */
/* NOTA SICUREZZA: questo è un sistema di accesso front-end per demo.
   In produzione implementare autenticazione server-side con sessioni/JWT. */
const ADMIN_SESSION_KEY = '_adn_sess';
const ADMIN_CREDENTIALS = { user: 'admin', pass: 'Admin2024!' }; // CAMBIA IN PRODUZIONE

function checkAdminSession() { return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'; }
function setAdminSession()   { sessionStorage.setItem(ADMIN_SESSION_KEY, '1'); }
function clearAdminSession() { sessionStorage.removeItem(ADMIN_SESSION_KEY); }

function openAdminLogin() {
  if (checkAdminSession()) { openAdminPanel(); return; }
  openModal('adminLoginModal');
  setTimeout(() => { const u = document.getElementById('adminUser'); if (u) u.focus(); }, 300);
}
function closeAdminLogin() {
  closeModal('adminLoginModal');
  const e = document.getElementById('loginError');
  const p = document.getElementById('adminPass');
  if (e) e.classList.add('hidden');
  if (p) p.value = '';
}

function doAdminLogin() {
  const u = (document.getElementById('adminUser')?.value || '').trim();
  const p = document.getElementById('adminPass')?.value || '';
  const e = document.getElementById('loginError');
  if (!u || !p) return;
  // Piccolo delay anti-brute-force (solo front-end)
  setTimeout(() => {
    if (u === ADMIN_CREDENTIALS.user && p === ADMIN_CREDENTIALS.pass) {
      setAdminSession();
      closeAdminLogin();
      openAdminPanel();
      showToast('Accesso eseguito ✓', 'success');
    } else {
      if (e) e.classList.remove('hidden');
      const pw = document.getElementById('adminPass');
      if (pw) { pw.value = ''; pw.focus(); }
    }
  }, 350);
}

function adminLogout() {
  clearAdminSession();
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.remove('open');
  document.body.style.overflow = '';
  showToast('Disconnesso.');
}

/* ═══ DEFAULT DATA ══════════════════════════════════════ */
function getProducts() {
  const s = getData('products');
  if (s.length) return s;
  const d = [
    { id:'p1', name:'Gru Semovente 25t', cat:'cat1', price:299, oldPrice:399, desc:'Gru usata revisionata con controllo strutturale, pronta per lavori industriali e cantieristici.' },
    { id:'p2', name:'Impianto Scarrabile Completo', cat:'cat2', price:149, oldPrice:0,   desc:'Sistema scarrabile con cassone e gancio rapido, ideale per trasporto e logistica specializzata.' },
    { id:'p3', name:'Sistema di Compattazione', cat:'cat3', price:89,  oldPrice:0,   desc:'Compattatore industriale per raccolta e gestione rifiuti, con impianto testato e certificato.' },
    { id:'p4', name:'Camion Allestito Scarrabile', cat:'novita', price:459, oldPrice:599, desc:'Camion usato con allestimento scarrabile e impianto pronto per consegna e installazione.' },
    { id:'p5', name:'Gru Caricatrice Usata', cat:'cat1', price:199, oldPrice:0,   desc:'Attrezzatura per sollevamento e movimentazione, controllata e disponibile per utilizzo immediato.' },
    { id:'p6', name:'Ribaltabile Usato',  cat:'cat2', price:75,  oldPrice:0,   desc:'Cassone ribaltabile in buone condizioni, ideale per cantiere e trasporto materiale sfuso.' },
    { id:'p7', name:'Telaio Scarrabile Certificato',   cat:'novita', price:329, oldPrice:399, desc:'Telaio scarrabile con gancio rapido, progettato per installazione su camion industriali.' },
    { id:'p8', name:'Camion Compattatore',    cat:'cat3', price:119, oldPrice:0,   desc:'Veicolo attrezzato per raccolta e compattazione, disponibile con supporto tecnico dedicato.' },
  ];
  setData('products', d); return d;
}

function getUsedItems() {
  const s = getData('usedItems');
  if (s.length) return s;
  const d = [
    { id:'u1', name:'Camion Scarrabile 2018', seller:'Mario R.', price:120, condition:'ottimo', desc:'Camion scarrabile in ottime condizioni, completo di cassone e sistema idraulico controllato.', approved:true },
    { id:'u2', name:'Gru Autocarro Usata',   seller:'Sara M.',  price:65,  condition:'buono',  desc:'Gru usata con piccole tracce di utilizzo, testata e funzionante per impieghi professionali.', approved:true },
    { id:'u3', name:'Sistema Compattazione',  seller:'Luca T.',  price:40,  condition:'usato',  desc:'Impianto di compattazione usato ma funzionante, ideale per raccolta rifiuti in area industriale.', approved:true },
    { id:'u4', name:'Telaio Scarrabile',  seller:'Giulia F.', price:85, condition:'ottimo', desc:'Telaio scarrabile in perfetto stato, pronto per installazione su camion nel settore logistics.', approved:true },
  ];
  setData('usedItems', d); return d;
}

function conditionLabel(c) { return { ottimo:'Ottimo', buono:'Buono', usato:'Usato' }[c] || c; }

/* ═══ ADMIN PANEL ═══════════════════════════════════════ */
function openAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (!panel) return;
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (typeof renderAdminRequests === 'function') renderAdminRequests();
  if (typeof renderAdminContacts === 'function') renderAdminContacts();
  if (typeof renderProductsAdmin === 'function') renderProductsAdmin();
  if (typeof renderUsedAdmin === 'function') renderUsedAdmin();
  updateAdminBadge();
}

function updateAdminBadge() {
  const b = document.getElementById('pendingBadge');
  const n = getData('contactMessages').filter(m => !m.read).length;
  if (b) b.innerHTML = n > 0 ? `<span class="notif">${n}</span>` : '';
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const tc = document.getElementById('tab-' + tab);
  if (tc) tc.classList.add('active');
}

/* ── Admin: Prodotti ──────────────────────────────────── */
function renderProductsAdmin() {
  const tb = document.getElementById('productsAdminTable');
  if (!tb) return;
  const prods = getProducts();
  tb.innerHTML = prods.length ? prods.map(p => `
    <tr>
      <td><strong>${sanitize(p.name)}</strong><div style="font-size:.75rem;color:var(--text-muted);margin-top:.2rem;">${sanitize(p.desc.substring(0,60))}…</div></td>
      <td><span class="badge badge-gold">${sanitize(p.cat)}</span></td>
      <td><strong>€${p.price}</strong>${p.oldPrice ? `<span class="prod-price-old">€${p.oldPrice}</span>` : ''}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteProduct('${sanitize(p.id)}')">Elimina</button></td>
    </tr>`).join('') : '<tr><td colspan="4" class="empty-state">Nessun prodotto.</td></tr>';
}

function openAddProduct() { document.getElementById('addProductForm')?.classList.toggle('hidden'); }

async function addProduct() {
  const nome = document.getElementById('pNome')?.value.trim();
  const prezzo = parseFloat(document.getElementById('pPrezzo')?.value) || 0;
  const cat = document.getElementById('pCat')?.value;
  const desc = document.getElementById('pDesc')?.value.trim();
  const old = parseFloat(document.getElementById('pPrezzoOld')?.value) || 0;
  if (!nome || nome.length < 2) return showToast('Inserisci il nome del prodotto.', 'error');
  if (!isValidPrice(prezzo)) return showToast('Prezzo non valido.', 'error');
  const fotoInput = document.getElementById('pFoto');
  let foto = null;
  if (fotoInput.files[0]) {
    foto = await toBase64Admin(fotoInput.files[0]);
  }
  const prods = getProducts();
  prods.unshift({ id:'p-'+Date.now(), name:nome.substring(0,120), cat, price:prezzo, oldPrice:old, desc:(desc||'').substring(0,300), foto });
  setData('products', prods);
  renderProductsAdmin();
  if (typeof renderProducts === 'function') renderProducts();
  document.getElementById('addProductForm')?.classList.add('hidden');
  ['pNome','pPrezzo','pDesc','pPrezzoOld'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  if (fotoInput) fotoInput.value = '';
  document.getElementById('pFotoPreview').innerHTML = '';
  showToast('Prodotto aggiunto!', 'success');
}

function deleteProduct(id) {
  if (!confirm('Rimuovere questo prodotto?')) return;
  setData('products', getProducts().filter(p => p.id !== id));
  renderProductsAdmin();
  if (typeof renderProducts === 'function') renderProducts();
  showToast('Prodotto rimosso.', 'error');
}

/* ── Admin: Usato ─────────────────────────────────────── */
function renderUsedAdmin() {
  const tb = document.getElementById('usedAdminTable');
  if (!tb) return;
  const items = getUsedItems();
  tb.innerHTML = items.length ? items.map(i => `
    <tr>
      <td><strong>${sanitize(i.name)}</strong></td>
      <td style="color:var(--text-muted)">${sanitize(i.seller)}</td>
      <td>€${i.price}</td>
      <td><span class="badge cond-${sanitize(i.condition)}">${conditionLabel(i.condition)}</span></td>
      <td><button class="btn btn-danger btn-sm" onclick="removeUsedItem('${sanitize(i.id)}')">Rimuovi</button></td>
    </tr>`).join('') : '<tr><td colspan="5" class="empty-state">Nessun articolo.</td></tr>';
}

function removeUsedItem(id) {
  if (!confirm('Rimuovere questo articolo?')) return;
  setData('usedItems', getUsedItems().filter(i => i.id !== id));
  renderUsedAdmin();
  if (typeof renderUsedItems === 'function') renderUsedItems();
  showToast('Articolo rimosso.', 'error');
}

function addUsedItemAdmin(data) {
  const items = getUsedItems();
  items.unshift(data);
  setData('usedItems', items);
  renderUsedAdmin();
  if (typeof renderUsedItems === 'function') renderUsedItems();
}

/* ── Admin: Contatti ──────────────────────────────────── */
function renderAdminContacts() {
  const c = document.getElementById('contactsList');
  if (!c) return;
  const contacts = getData('contactMessages');
  if (!contacts.length) { c.innerHTML='<div class="empty-state"><p>Nessun messaggio ricevuto.</p></div>'; return; }
  c.innerHTML = contacts.map(m => `
    <div class="req-card" style="margin-bottom:1rem;">
      <div class="req-header" style="cursor:default;">
        <div>
          <div class="req-id">${sanitize(m.id)} — ${new Date(m.date).toLocaleDateString('it-IT')}</div>
          <div class="req-title">${sanitize(m.oggetto||'Nessun oggetto')}</div>
          <div class="req-meta">${sanitize(m.nome)} · <a href="mailto:${sanitize(m.email)}" style="color:var(--gold)">${sanitize(m.email)}</a></div>
        </div>
        ${!m.read ? '<span class="badge badge-warning">Nuovo</span>' : '<span class="badge badge-neutral">Letto</span>'}
      </div>
      <div style="padding:1rem 1.5rem;border-top:1.5px solid var(--border);font-size:.88rem;color:var(--text-muted);">${sanitize(m.messaggio)}</div>
      <div style="padding:.75rem 1.5rem;border-top:1px solid var(--border);display:flex;gap:.75rem;">
        <a href="mailto:${sanitize(m.email)}?subject=Re: ${sanitize(m.oggetto||'Messaggio')}" class="btn btn-outline btn-sm">↩ Rispondi via Email</a>
        <button class="btn btn-light btn-sm" onclick="markContactRead('${sanitize(m.id)}')">Segna come Letto</button>
      </div>
    </div>`).join('');
}

function markContactRead(id) {
  const contacts = getData('contactMessages');
  const c = contacts.find(x => x.id === id);
  if (c) { c.read = true; setData('contactMessages', contacts); renderAdminContacts(); updateAdminBadge(); }
}

/* ── Admin: Gestione Articoli Usato ricevuti per email ── */
function renderAdminUsedRequests() {
  const c = document.getElementById('usedRequestsList');
  if (!c) return;
  const reqs = getData('usedEmailRequests');
  if (!reqs.length) { c.innerHTML='<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><p>Nessuna segnalazione di usato ricevuta.</p></div>'; return; }
  c.innerHTML = reqs.map(r => `
    <div class="req-card" style="margin-bottom:1rem;">
      <div class="req-header" style="cursor:default;">
        <div>
          <div class="req-id">${sanitize(r.id)} — ${new Date(r.date).toLocaleDateString('it-IT')}</div>
          <div class="req-title">${sanitize(r.articolo)}</div>
          <div class="req-meta">${sanitize(r.nome)} · €${r.prezzo} · ${conditionLabel(r.condizioni)}</div>
        </div>
        <span class="badge badge-warning">Da gestire via Email</span>
      </div>
      <div style="padding:1rem 1.5rem;border-top:1.5px solid var(--border);">
        <p style="font-size:.85rem;color:var(--text-muted);margin-bottom:1rem;">${sanitize(r.descrizione)}</p>
        <div class="req-actions">
          <button class="btn btn-success btn-sm" onclick="publishUsedFromRequest('${sanitize(r.id)}')">✓ Pubblica nell'Usato</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUsedRequest('${sanitize(r.id)}')">✕ Elimina</button>
        </div>
      </div>
    </div>`).join('');
}

function publishUsedFromRequest(id) {
  const reqs = getData('usedEmailRequests');
  const r = reqs.find(x => x.id === id);
  if (!r) return;
  addUsedItemAdmin({ id:'u-'+Date.now(), name:r.articolo, seller:r.nome, price:r.prezzo, condition:r.condizioni, desc:r.descrizione, approved:true });
  setData('usedEmailRequests', reqs.filter(x => x.id !== id));
  renderAdminUsedRequests();
  showToast('Articolo pubblicato nell\'usato!', 'success');
}

function deleteUsedRequest(id) {
  if (!confirm('Eliminare questa segnalazione?')) return;
  setData('usedEmailRequests', getData('usedEmailRequests').filter(x => x.id !== id));
  renderAdminUsedRequests();
  showToast('Segnalazione eliminata.', 'error');
}

/* ── Contact Form ─────────────────────────────────────── */
function sendContact() {
  const nome = document.getElementById('cNome')?.value.trim();
  const email = document.getElementById('cEmail')?.value.trim();
  const msg   = document.getElementById('cMessaggio')?.value.trim();
  if (!nome || nome.length < 2) return showToast('Inserisci il tuo nome.', 'error');
  if (!isValidEmail(email)) return showToast('Inserisci un\'email valida.', 'error');
  if (!msg || msg.length < 10) return showToast('Scrivi un messaggio (min. 10 caratteri).', 'error');
  const contacts = getData('contactMessages');
  contacts.unshift({
    id: 'MSG-' + Date.now(),
    nome: nome.substring(0,80),
    email: email.substring(0,120),
    oggetto: (document.getElementById('cOggetto')?.value || '').trim().substring(0,120),
    messaggio: msg.substring(0,2000),
    date: new Date().toISOString(),
    read: false
  });
  setData('contactMessages', contacts);
  ['cNome','cEmail','cOggetto','cMessaggio'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  showToast('Messaggio inviato! Ti risponderemo presto.', 'success');
  updateAdminBadge();
}

/* ── INIT ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFadeIn();
  initUsedPhotoPreview();
  // Close mobile nav on link click, even if links are injected later.
  document.addEventListener('click', e => {
    if (e.target.closest('#mobileNav a')) closeMobileNav();
  });
  // Admin login: enter key
  document.getElementById('adminPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
  // Admin tab buttons
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', function() { switchAdminTab(this.dataset.tab, this); });
  });
});

/* ── Admin: Aggiungi Usato Manualmente ────────────────── */
function openAddUsed() {
  document.getElementById('addUsedForm')?.classList.toggle('hidden');
}

function addUsedManual() {
  const nome      = document.getElementById('uNome')?.value.trim();
  const prezzo    = parseFloat(document.getElementById('uPrezzo')?.value) || 0;
  const venditore = document.getElementById('uVenditore')?.value.trim() || 'Interno';
  const cond      = document.getElementById('uCondizioni')?.value || 'usato';
  const desc      = document.getElementById('uDesc')?.value.trim() || '';
  const fotoInput = document.getElementById('uFoto');

  if (!nome || nome.length < 2) return showToast('Inserisci il nome dell\'articolo.', 'error');
  if (!isValidPrice(prezzo) || prezzo === 0) return showToast('Inserisci un prezzo valido.', 'error');
  if (!fotoInput || !fotoInput.files || fotoInput.files.length === 0) return showToast('Seleziona una foto.', 'error');

  const file = fotoInput.files[0];
  if (file.size > 10 * 1024 * 1024) return showToast('La foto supera 10MB.', 'error');

  toBase64Admin(file).then(base64 => {
    addUsedItemAdmin({
      id:        'u-manual-' + Date.now(),
      name:      nome.substring(0, 120),
      seller:    venditore.substring(0, 80),
      price:     prezzo,
      condition: cond,
      desc:      desc.substring(0, 500),
      foto:      base64,
      approved:  true
    });
    // Reset form
    ['uNome','uPrezzo','uVenditore','uDesc'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = '';
    });
    if (fotoInput) fotoInput.value = '';
    document.getElementById('uFotoPreview').textContent = '';
    document.getElementById('addUsedForm')?.classList.add('hidden');
    showToast('Articolo pubblicato nell\'usato! ✓', 'success');
  }).catch(err => {
    showToast('Errore nel caricamento della foto.', 'error');
  });
}

// Preview foto selezionate nel form admin usato
function initUsedPhotoPreview() {
  const photoInput = document.getElementById('uFoto');
  if (!photoInput) return;
  photoInput.addEventListener('change', function() {
    previewAdminFoto(this, 'uFotoPreview');
  });
}

function previewAdminFoto(input, previewId) {
  const div = document.getElementById(previewId);
  div.innerHTML = '';
  if (!input.files[0]) return;
  const r = new FileReader();
  r.onload = e => {
    div.innerHTML = `
      <img src="${e.target.result}" style="width:100%;max-height:120px;object-fit:cover;border-radius:6px;margin-top:6px;">`;
  };
  r.readAsDataURL(input.files[0]);
}

function toBase64Admin(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(file);
  });
}
