/* ════════════════════════════════════════════════════════
GRU SCAR SRL — JavaScript Condiviso
════════════════════════════════════════════════════════ */

function sanitize(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str || '')));
  return d.innerHTML;
}

function escapeAttr(str) {
  return sanitize(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function isValidEmail(e) { return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,10}$/.test(e); }
function isValidPrice(v) { const n = parseFloat(v); return !isNaN(n) && n >= 0; }

function getData(key, def = []) {
  try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
}
function setData(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { showToast('Errore salvataggio', 'error'); return false; }
}

const ADMIN_MEDIA_DB_NAME = 'gruscar-admin-media';
const ADMIN_MEDIA_STORE = 'photos';
let adminMediaDbPromise;

function openAdminMediaDatabase() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('Il browser non supporta l\'archivio foto.'));
  if (adminMediaDbPromise) return adminMediaDbPromise;
  adminMediaDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(ADMIN_MEDIA_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ADMIN_MEDIA_STORE)) {
        const store = db.createObjectStore(ADMIN_MEDIA_STORE, { keyPath: 'id' });
        store.createIndex('ownerId', 'ownerId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Impossibile aprire l\'archivio foto.'));
  });
  return adminMediaDbPromise;
}

async function ensureAdminMediaSpace(files) {
  const requestedBytes = files.reduce((total, file) => total + file.size, 0);
  if (!navigator.storage?.estimate) return;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    if (quota && requestedBytes > quota - usage) {
      throw new Error('Spazio disponibile nel browser insufficiente per queste foto.');
    }
  } catch (error) {
    if (error?.message?.includes('Spazio disponibile')) throw error;
  }
}

async function saveAdminPhotos(files, ownerId) {
  const selectedFiles = Array.from(files || []);
  if (!selectedFiles.length) return [];
  if (selectedFiles.some(file => !file.type.startsWith('image/'))) {
    throw new Error('Puoi caricare solo file immagine.');
  }
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch {}
  await ensureAdminMediaSpace(selectedFiles);
  const db = await openAdminMediaDatabase();
  const photoIds = selectedFiles.map((file, index) => `${ownerId}-photo-${index}-${Date.now()}`);
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(ADMIN_MEDIA_STORE, 'readwrite');
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error || new Error('Errore nel salvataggio delle foto.'));
    transaction.onabort = () => reject(transaction.error || new Error('Spazio insufficiente per salvare le foto.'));
    const store = transaction.objectStore(ADMIN_MEDIA_STORE);
    selectedFiles.forEach((file, index) => {
      store.put({
        id: photoIds[index],
        ownerId,
        name: file.name,
        type: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
        blob: file
      });
    });
  });
  return photoIds;
}

async function getAdminPhotoUrls(photoIds) {
  if (!Array.isArray(photoIds) || !photoIds.length) return [];
  try {
    const db = await openAdminMediaDatabase();
    const records = await new Promise((resolve, reject) => {
      const recordsByIndex = new Array(photoIds.length);
      const transaction = db.transaction(ADMIN_MEDIA_STORE, 'readonly');
      transaction.oncomplete = () => resolve(recordsByIndex);
      transaction.onerror = () => reject(transaction.error);
      const store = transaction.objectStore(ADMIN_MEDIA_STORE);
      photoIds.forEach((id, index) => {
        const request = store.get(id);
        request.onsuccess = () => { recordsByIndex[index] = request.result; };
        request.onerror = () => reject(request.error);
      });
    });
    return records.filter(record => record?.blob).map(record => URL.createObjectURL(record.blob));
  } catch {
    return [];
  }
}

async function deleteAdminPhotos(photoIds) {
  if (!Array.isArray(photoIds) || !photoIds.length) return;
  try {
    const db = await openAdminMediaDatabase();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(ADMIN_MEDIA_STORE, 'readwrite');
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      const store = transaction.objectStore(ADMIN_MEDIA_STORE);
      photoIds.forEach(id => store.delete(id));
    });
  } catch {}
}

async function hydrateAdminPhotos(item) {
  const photoIds = Array.isArray(item?.photoIds) ? item.photoIds : [];
  const storedPhotos = photoIds.length ? await getAdminPhotoUrls(photoIds) : [];
  const legacyPhotos = Array.isArray(item?.photos) ? item.photos : (item?.foto ? [item.foto] : []);
  const photos = [...legacyPhotos, ...storedPhotos];
  return { ...item, photos, foto: photos[0] || null };
}

function getAdminPhotoCount(item) {
  if (Array.isArray(item?.photoIds)) return item.photoIds.length;
  if (Array.isArray(item?.photos)) return item.photos.length;
  return item?.foto ? 1 : 0;
}

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

function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
  const links = nav.querySelectorAll('.nav-links a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

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

function initFadeIn() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('open'); document.body.style.overflow = ''; }
}

const ADMIN_SESSION_KEY = '_adn_sess';
const ADMIN_CREDENTIALS = { user: 'admin', pass: 'Admin2024!' };
function checkAdminSession() { return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1'; }
function setAdminSession() { sessionStorage.setItem(ADMIN_SESSION_KEY, '1'); }
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

const LEGACY_DEMO_PRODUCT_IDS = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']);
const LEGACY_DEMO_USED_IDS = new Set(['u1', 'u2', 'u3', 'u4']);

const CATALOG_PRODUCT_DEFAULTS = [
  { id:'catalog-1', catalogId:1, name:'Scania G660', cat:'Mezzo', featured:true, descShort:'SCANIA G660 3 assi con impianto scarrabile MULTILIFT ULTIMA 26Z.', descLong:'SCANIA G660 3 assi allestito con impianto scarrabile MULTILIFT ULTIMA 26Z e cassa con gru PALFINGER EPSILON Q150L allegata con un polipo Minelli da 250 litri.', photos:['prodotto1.jpg'] },
  { id:'catalog-2', catalogId:2, name:'DAF XF', cat:'Mezzo', featured:true, descShort:'DAF XF 3 assi con scarrabile MEC e braccetto per lavori ADR.', descLong:'DAF XF 3 assi allestito con scarrabile MEC SCK267NL equipaggiato con braccetto e pinze per lavori in ADR.', photos:['prodotto2.png'] },
  { id:'catalog-3', catalogId:3, name:'DAF XB', cat:'Mezzo', featured:true, descShort:'DAF XB con cerchi bruniti, ribaltabile e gru MARCHESI M8R 11.67.', descLong:'DAF XB con cerchi bruniti allestito con ribaltabile e gru caricatore MARCHESI M8R 11.67 e polipo Minelli da 250 litri.', photos:['prodotto3.png'] },
  { id:'catalog-4', catalogId:4, name:'Sistema di Compattazione Scarrabile', cat:'Attrezzatura', featured:false, descShort:'Attrezzatura scarrabile per compattazione materiali.', descLong:'Attrezzatura scarrabile dedicata alla compattazione e alla gestione dei materiali in contesti industriali e operativi.', photos:['prodotto5.png'] },
  { id:'catalog-5', catalogId:5, name:'Allestimento con Gru Marchesi', cat:'Allestimento', featured:false, descShort:'Allestimento con gru Marchesi integrata.', descLong:'Allestimento dedicato alla movimentazione dei materiali con gru Marchesi integrata e struttura professionale di supporto.', photos:['prodotto6.png'] },
  { id:'catalog-6', catalogId:6, name:'Servizio di Riparazione compattatore', cat:'Servizio', featured:false, descShort:'Intervento di riparazione su allestimento scarrabile.', descLong:'Intervento di riparazione e ripristino eseguito in officina su un allestimento scarrabile, con lavorazione dedicata alle parti strutturali.', photos:['prodotto7.png', 'prodotto7_1.1.png', 'prodotto7_1.2.png', 'prodotto7_1.3.png'] }
];
const CATALOG_PRODUCT_IDS = new Set(CATALOG_PRODUCT_DEFAULTS.map(product => product.id));
const MAX_HOME_FEATURED_PRODUCTS = 3;

function getAdminCollection(key) {
  const data = getData(key);
  return Array.isArray(data) ? data : [];
}

function removeLegacyDemoData() {
  const products = getAdminCollection('products');
  const productsWithoutDemo = products.filter(item => !LEGACY_DEMO_PRODUCT_IDS.has(item.id));
  if (productsWithoutDemo.length !== products.length) setData('products', productsWithoutDemo);
  const usedItems = getAdminCollection('usedItems');
  const usedWithoutDemo = usedItems.filter(item => !LEGACY_DEMO_USED_IDS.has(item.id));
  if (usedWithoutDemo.length !== usedItems.length) setData('usedItems', usedWithoutDemo);
}

function getStoredProducts() { return getAdminCollection('products'); }

function getProducts() {
  const storedProducts = getStoredProducts();
  const storedById = new Map(storedProducts.map(product => [product.id, product]));
  const hiddenCatalogProducts = new Set(getAdminCollection('hiddenCatalogProducts'));
  const catalogProducts = CATALOG_PRODUCT_DEFAULTS
    .filter(product => !hiddenCatalogProducts.has(product.id))
    .map(product => ({ ...product, ...(storedById.get(product.id) || {}) }));
  const customProducts = storedProducts.filter(product => !CATALOG_PRODUCT_IDS.has(product.id));
  return [...customProducts, ...catalogProducts];
}

function getUsedItems() { return getAdminCollection('usedItems'); }

removeLegacyDemoData();

// Categorie condivise tra Prodotti pubblicati e Usato (pannello admin)
const PRODUCT_CATEGORIES = [
  'Mezzo', 'Attrezzatura', 'Allestimento', 'Servizio', 'Novità',
  'Compattatore mobile', 'Compattatore fisso', 'Allestimento semirimorchi',
  'Semirimorchi', 'Rimorchi', 'Cassone', 'Gru', 'Impianto scarrabile',
  'Motrice', 'Trattore', 'Pressa fissa'
];

function categoryOptionsHTML() {
  return PRODUCT_CATEGORIES.map(c => `<option value="${escapeAttr(c)}">${sanitize(c)}</option>`).join('');
}

function conditionLabel(c) { return { ottimo:'Ottimo', buono:'Buono', usato:'Usato' }[c] || c; }

function openAdminPanel() {
  const panel = document.getElementById('admin-panel');
  if (!panel) return;
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderAdminContacts();
  renderAdminUsedRequests();
  renderProductsAdmin();
  renderUsedAdmin();
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

function renderProductsAdmin() {
  const tb = document.getElementById('productsAdminTable');
  if (!tb) return;
  const prods = getProducts();
  tb.innerHTML = prods.length ? prods.map(p => `<tr>
    <td><strong>${sanitize(p.name)}</strong><div style="font-size:.75rem;color:var(--text-muted);margin-top:.2rem;">${sanitize((p.descShort || p.desc || '').substring(0,60))}…</div></td>
    <td><span class="badge badge-gold">${sanitize(p.cat)}</span></td>
    <td>${getAdminPhotoCount(p)} foto</td>
    <td><button class="btn btn-light btn-sm" onclick="toggleProductFeatured('${sanitize(p.id)}')">${p.featured ? '✓ In evidenza' : 'Metti in evidenza'}</button></td>
    <td style="white-space:nowrap;">
      <button class="btn btn-outline btn-sm" onclick="openEditProduct('${sanitize(p.id)}')">Modifica</button>
      <button class="btn btn-danger btn-sm" onclick="deleteProduct('${sanitize(p.id)}')">Elimina</button>
    </td>
  </tr>`).join('') : '<tr><td colspan="5" class="empty-state">Nessun prodotto.</td></tr>';
}

let editingProductId = null;

function getProductFormValues() {
  return {
    name: document.getElementById('pNome')?.value.trim() || '',
    cat: document.getElementById('pCat')?.value || 'Mezzo',
    descShort: document.getElementById('pDescShort')?.value.trim() || '',
    descLong: document.getElementById('pDescLong')?.value.trim() || '',
    featured: Boolean(document.getElementById('pFeatured')?.checked)
  };
}

function isCatalogProduct(id) { return CATALOG_PRODUCT_IDS.has(id); }

function canFeatureProduct(id, featured) {
  if (!featured) return true;
  const featuredProducts = getProducts().filter(product => product.featured && product.id !== id);
  if (featuredProducts.length < MAX_HOME_FEATURED_PRODUCTS) return true;
  showToast(`Puoi mettere in evidenza al massimo ${MAX_HOME_FEATURED_PRODUCTS} prodotti.`, 'error');
  return false;
}

function saveProductRecord(product) {
  const storedProducts = getStoredProducts();
  const index = storedProducts.findIndex(item => item.id === product.id);
  const isCatalog = isCatalogProduct(product.id);
  const baseProduct = CATALOG_PRODUCT_DEFAULTS.find(item => item.id === product.id);
  const record = isCatalog ? {
    id: product.id,
    name: product.name,
    cat: product.cat,
    descShort: product.descShort,
    descLong: product.descLong,
    featured: Boolean(product.featured),
    photoIds: Array.isArray(product.photoIds) ? product.photoIds : [],
    descriptionEdited: Boolean(product.descriptionEdited || (product.descShort !== baseProduct?.descShort || product.descLong !== baseProduct?.descLong))
  } : product;
  const nextProducts = index >= 0
    ? storedProducts.map((item, itemIndex) => itemIndex === index ? record : item)
    : [record, ...storedProducts];
  return setData('products', nextProducts);
}

function refreshProductViews() {
  renderProductsAdmin();
  renderProducts();
  renderHomeProducts();
}

function resetAddProductForm() {
  editingProductId = null;
  ['pNome', 'pDescShort', 'pDescLong'].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = '';
  });
  const category = document.getElementById('pCat');
  if (category) category.selectedIndex = 0;
  const featured = document.getElementById('pFeatured');
  if (featured) featured.checked = false;
  const photo = document.getElementById('pFoto');
  if (photo) photo.value = '';
  const preview = document.getElementById('pFotoPreview');
  if (preview) preview.innerHTML = '';
  const title = document.getElementById('productFormTitle');
  if (title) title.textContent = 'Nuovo Prodotto';
  const saveButton = document.getElementById('saveProductButton');
  if (saveButton) saveButton.textContent = 'Salva';
}

function openAddProduct() {
  const form = document.getElementById('addProductForm');
  if (!form) return;
  const willOpen = form.classList.contains('hidden');
  if (willOpen) resetAddProductForm();
  form.classList.toggle('hidden');
}

function closeAddProduct() {
  resetAddProductForm();
  document.getElementById('addProductForm')?.classList.add('hidden');
}

function openEditProduct(id) {
  const product = getProducts().find(item => item.id === id);
  if (!product) return;
  resetAddProductForm();
  editingProductId = id;
  document.getElementById('pNome').value = product.name || '';
  document.getElementById('pDescShort').value = product.descShort || product.desc || '';
  document.getElementById('pDescLong').value = product.descLong || '';
  document.getElementById('pCat').value = product.cat || 'Mezzo';
  document.getElementById('pFeatured').checked = Boolean(product.featured);
  document.getElementById('productFormTitle').textContent = `Modifica: ${product.name}`;
  document.getElementById('saveProductButton').textContent = 'Salva modifiche';
  document.getElementById('pFotoPreview').innerHTML = `<p style="font-size:.75rem;color:var(--text-muted);margin:0;">${getAdminPhotoCount(product)} foto già presenti. Le nuove foto selezionate verranno aggiunte alla galleria.</p>`;
  document.getElementById('addProductForm').classList.remove('hidden');
}

async function addProduct() {
  if (editingProductId) return updateProduct(editingProductId);
  const values = getProductFormValues();
  if (!values.name || values.name.length < 2) return showToast('Inserisci il nome del prodotto.', 'error');
  if (!canFeatureProduct(null, values.featured)) return;
  const fotoInput = document.getElementById('pFoto');
  const id = 'p-' + Date.now();
  let photoIds = [];
  try {
    photoIds = await saveAdminPhotos(fotoInput?.files, id);
  } catch (error) {
    return showToast(error.message || 'Errore nel caricamento delle foto.', 'error');
  }
  const product = { id, name:values.name.substring(0,120), cat:values.cat, descShort:values.descShort.substring(0,150), descLong:values.descLong.substring(0,1000), featured:values.featured, photoIds };
  if (!saveProductRecord(product)) {
    await deleteAdminPhotos(photoIds);
    return;
  }
  refreshProductViews();
  closeAddProduct();
  showToast('Prodotto aggiunto!', 'success');
}

async function updateProduct(id) {
  const existingProduct = getProducts().find(product => product.id === id);
  if (!existingProduct) return showToast('Prodotto non trovato.', 'error');
  const values = getProductFormValues();
  if (!values.name || values.name.length < 2) return showToast('Inserisci il nome del prodotto.', 'error');
  if (!canFeatureProduct(id, values.featured)) return;
  const fotoInput = document.getElementById('pFoto');
  let newPhotoIds = [];
  try {
    newPhotoIds = await saveAdminPhotos(fotoInput?.files, id);
  } catch (error) {
    return showToast(error.message || 'Errore nel caricamento delle foto.', 'error');
  }
  const baseProduct = CATALOG_PRODUCT_DEFAULTS.find(product => product.id === id);
  const updatedProduct = {
    ...existingProduct,
    name: values.name.substring(0, 120),
    cat: values.cat,
    descShort: values.descShort.substring(0, 150),
    descLong: values.descLong.substring(0, 1000),
    featured: values.featured,
    photoIds: [...(existingProduct.photoIds || []), ...newPhotoIds],
    descriptionEdited: Boolean(existingProduct.descriptionEdited || (baseProduct && (values.descShort !== baseProduct.descShort || values.descLong !== baseProduct.descLong)))
  };
  if (!saveProductRecord(updatedProduct)) {
    await deleteAdminPhotos(newPhotoIds);
    return;
  }
  refreshProductViews();
  closeAddProduct();
  showToast('Prodotto aggiornato!', 'success');
}

function toggleProductFeatured(id) {
  const product = getProducts().find(item => item.id === id);
  if (!product) return;
  const featured = !product.featured;
  if (!canFeatureProduct(id, featured)) return;
  if (!saveProductRecord({ ...product, featured })) return;
  refreshProductViews();
  showToast(featured ? 'Prodotto aggiunto alla home.' : 'Prodotto rimosso dalla home.', 'success');
}

async function deleteProduct(id) {
  if (!confirm('Rimuovere questo prodotto?')) return;
  const product = getProducts().find(p => p.id === id);
  if (!product) return;
  if (isCatalogProduct(id)) {
    const hiddenProducts = getAdminCollection('hiddenCatalogProducts');
    if (!setData('hiddenCatalogProducts', [...new Set([...hiddenProducts, id])])) return;
    setData('products', getStoredProducts().filter(item => item.id !== id));
  } else if (!setData('products', getStoredProducts().filter(item => item.id !== id))) {
    return;
  }
  await deleteAdminPhotos(product?.photoIds);
  refreshProductViews();
  showToast('Prodotto rimosso.', 'error');
}

function renderUsedAdmin() {
  const tb = document.getElementById('usedAdminTable');
  if (!tb) return;
  const items = getUsedItems();
  tb.innerHTML = items.length ? items.map(i => `<tr>
    <td><strong>${sanitize(i.name)}</strong></td>
    <td style="color:var(--text-muted)">${sanitize(i.cat || '—')}</td>
    <td>${getAdminPhotoCount(i)} foto</td>
    <td><strong>€${Number(i.price).toLocaleString('it-IT')}</strong> <span style="font-size:.7rem;color:var(--text-dim);">+ IVA</span></td>
    <td><span class="badge cond-${sanitize(i.condition)}">${conditionLabel(i.condition)}</span></td>
    <td><button class="btn btn-danger btn-sm" onclick="removeUsedItem('${sanitize(i.id)}')">Rimuovi</button></td>
  </tr>`).join('') : '<tr><td colspan="6" class="empty-state">Nessun articolo.</td></tr>';
}

async function removeUsedItem(id) {
  if (!confirm('Rimuovere questo articolo?')) return;
  const item = getUsedItems().find(i => i.id === id);
  if (!setData('usedItems', getUsedItems().filter(i => i.id !== id))) return;
  await deleteAdminPhotos(item?.photoIds);
  renderUsedAdmin();
  renderUsedItems();
  renderHomeUsed();
  showToast('Articolo rimosso.', 'error');
}

function addUsedItemAdmin(data) {
  const items = getUsedItems();
  items.unshift(data);
  if (!setData('usedItems', items)) return false;
  renderUsedAdmin();
  renderUsedItems();
  renderHomeUsed();
  return true;
}

function renderAdminContacts() {
  const c = document.getElementById('contactsList');
  if (!c) return;
  const contacts = getData('contactMessages');
  if (!contacts.length) { c.innerHTML='<div class="empty-state"><p>Nessun messaggio ricevuto.</p></div>'; return; }
  c.innerHTML = contacts.map(m => `<div class="req-card" style="margin-bottom:1rem;">
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

function renderAdminUsedRequests() {
  const c = document.getElementById('usedRequestsList');
  if (!c) return;
  const reqs = getData('usedEmailRequests');
  if (!reqs.length) { c.innerHTML='<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><p>Nessuna segnalazione di usato ricevuta.</p></div>'; return; }
  c.innerHTML = reqs.map(r => `<div class="req-card" style="margin-bottom:1rem;">
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
  if (!addUsedItemAdmin({ id:'u-'+Date.now(), name:r.articolo, cat:'', price:r.prezzo, condition:r.condizioni, descShort:r.descrizione.substring(0,150), descLong:r.descrizione, approved:true })) return;
  if (!setData('usedEmailRequests', reqs.filter(x => x.id !== id))) return;
  renderAdminUsedRequests();
  showToast('Articolo pubblicato nell\'usato!', 'success');
}

function deleteUsedRequest(id) {
  if (!confirm('Eliminare questa segnalazione?')) return;
  setData('usedEmailRequests', getData('usedEmailRequests').filter(x => x.id !== id));
  renderAdminUsedRequests();
  showToast('Segnalazione eliminata.', 'error');
}

function sendContact() {
  const nome = document.getElementById('cNome')?.value.trim();
  const email = document.getElementById('cEmail')?.value.trim();
  const msg = document.getElementById('cMessaggio')?.value.trim();
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

/* ══════════════════════════════════════════════════════════
   RICERCA SITO — barra in alto, valida per tutte le pagine
   Cerca in: pagine del sito, prodotti (anche quelli aggiunti
   dall'admin) e articoli usati pubblicati.
   ══════════════════════════════════════════════════════════ */
const SITE_PAGES = [
  { title: 'Home', url: 'index.html', keywords: 'home principale gru scar camion scarrabili compattatori' },
  { title: 'Chi Siamo', url: 'chi-siamo.html', keywords: 'azienda storia esperienza famiglia 30 anni valori missione officina' },
  { title: 'Servizi', url: 'cosa-offriamo.html', keywords: 'servizi cosa offriamo riparazione allestimento consulenza tecnica assistenza garanzia collaudo certificazione vendita nuovo usato' },
  { title: 'Prodotti', url: 'prodotti.html', keywords: 'prodotti catalogo mezzi camion gru scarrabili compattatori attrezzature' },
  { title: 'Usato', url: 'usato.html', keywords: 'usato articoli usati mercato camion gru occasioni' },
  { title: 'Vendi il tuo usato', url: 'vendi-usato.html', keywords: 'vendi vendere usato valutazione proponi articolo' },
  { title: 'Contatti', url: 'contatti.html', keywords: 'contatti telefono email indirizzo scrivici richiesta informazioni' },
  { title: 'Termini e Condizioni', url: 'termini-e-condizioni.html', keywords: 'termini condizioni legale privacy' }
];

function normalizeSearch(str) {
  return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function matchesQuery(tokens, ...fields) {
  const haystack = normalizeSearch(fields.join(' '));
  return tokens.every(t => haystack.includes(t));
}

function searchSite(query) {
  const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return { pages: [], products: [], used: [] };
  const byNameFirst = q => (a, b) => {
    const an = normalizeSearch(a.name).includes(tokens[0]) ? 0 : 1;
    const bn = normalizeSearch(b.name).includes(tokens[0]) ? 0 : 1;
    return an - bn;
  };
  const products = getProducts()
    .filter(p => matchesQuery(tokens, p.name, p.cat, p.descShort, p.descLong, p.desc))
    .sort(byNameFirst()).slice(0, 5);
  const used = getUsedItems()
    .filter(i => i.approved && matchesQuery(tokens, i.name, i.cat, conditionLabel(i.condition), i.descShort, i.descLong, i.desc))
    .sort(byNameFirst()).slice(0, 5);
  const pages = SITE_PAGES
    .filter(p => matchesQuery(tokens, p.title, p.keywords)).slice(0, 4);
  return { pages, products, used };
}

function renderSearchResults(query) {
  const box = document.getElementById('siteSearchResults');
  if (!box) return;
  const q = (query || '').trim();
  if (q.length < 2) { box.innerHTML = ''; return; }
  const { pages, products, used } = searchSite(q);
  let html = '';
  if (products.length) {
    html += '<div class="search-group-title">Prodotti</div>' + products.map(p => {
      const id = p.catalogId || p.id;
      return `<a class="search-result-item" href="prodotti.html#apri-${encodeURIComponent(id)}">
        <div><div class="search-result-name">${sanitize(p.name)}</div><div class="search-result-cat">${sanitize(p.cat || 'Prodotto')}</div></div>
        <span class="search-result-side">Vedi →</span></a>`;
    }).join('');
  }
  if (used.length) {
    html += '<div class="search-group-title">Usato</div>' + used.map(i => `
      <a class="search-result-item" href="usato.html#articolo-${encodeURIComponent(i.id)}">
        <div><div class="search-result-name">${sanitize(i.name)}</div><div class="search-result-cat">Usato · ${sanitize(conditionLabel(i.condition))}</div></div>
        <span class="search-result-side">€${Number(i.price).toLocaleString('it-IT')} + IVA</span></a>`).join('');
  }
  if (pages.length) {
    html += '<div class="search-group-title">Pagine</div>' + pages.map(p => `
      <a class="search-result-item" href="${escapeAttr(p.url)}">
        <div><div class="search-result-name">${sanitize(p.title)}</div><div class="search-result-cat">Pagina del sito</div></div>
        <span class="search-result-side">Apri →</span></a>`).join('');
  }
  box.innerHTML = html || '<div class="search-no-results">Nessun risultato per “' + sanitize(q) + '”.</div>';
}

function openSiteSearch() {
  const panel = document.getElementById('siteSearch');
  if (!panel) return;
  closeMobileNav();
  panel.classList.add('open');
  document.getElementById('siteSearchBtn')?.setAttribute('aria-expanded', 'true');
  const input = document.getElementById('siteSearchInput');
  if (input) { input.focus(); input.select(); renderSearchResults(input.value); }
}

function closeSiteSearch() {
  document.getElementById('siteSearch')?.classList.remove('open');
  document.getElementById('siteSearchBtn')?.setAttribute('aria-expanded', 'false');
}

function toggleSiteSearch() {
  const panel = document.getElementById('siteSearch');
  if (!panel) return;
  panel.classList.contains('open') ? closeSiteSearch() : openSiteSearch();
}

// Compatibilità con la vecchia funzione
function handleSearch(query) { renderSearchResults(query); }

function initSiteSearch() {
  const input = document.getElementById('siteSearchInput');
  const panel = document.getElementById('siteSearch');
  if (!input || !panel || panel.dataset.ready) return;
  panel.dataset.ready = '1';
  input.addEventListener('input', () => renderSearchResults(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSiteSearch(); return; }
    if (e.key === 'Enter') {
      const first = document.querySelector('#siteSearchResults .search-result-item');
      if (first) { e.preventDefault(); window.location.href = first.getAttribute('href'); }
    }
  });
  // Clic su un risultato: chiudi il pannello (utile quando si è già nella stessa pagina)
  document.getElementById('siteSearchResults')?.addEventListener('click', e => {
    if (e.target.closest('a')) setTimeout(closeSiteSearch, 50);
  });
  // Clic fuori o tasto Esc
  document.addEventListener('click', e => {
    if (!panel.classList.contains('open')) return;
    if (e.target.closest('#siteSearch') || e.target.closest('#siteSearchBtn')) return;
    closeSiteSearch();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSiteSearch(); });
}

/* ══════════════════════════════════════════════════════════
   RENDER PRODOTTI — FUNZIONI AGGIUNTE (MANCAVANO!)
   ══════════════════════════════════════════════════════════ */
async function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  const prods = await Promise.all(getProducts().map(hydrateAdminPhotos));
  grid.innerHTML = prods.length ? prods.map(p => `
    <div class="product-card fade-in">
      <div class="product-img"><img src="${p.foto || 'https://via.placeholder.com/400x300?text=Prodotto'}" alt="${sanitize(p.name)}"></div>
      <div class="product-body">
        <div class="prod-cat">${sanitize(p.cat)}</div>
        <div class="prod-name">${sanitize(p.name)}</div>
        <div class="prod-desc">${sanitize(p.descShort || p.desc || '')}</div>
        <div class="prod-footer"><span class="prod-no-price">Prezzo su richiesta</span></div>
      </div>
    </div>`).join('') : '<p class="empty-state">Nessun prodotto disponibile.</p>';
  initFadeIn();
}

async function renderHomeProducts() {
  const grid = document.getElementById('homeProductsGrid');
  if (!grid) return;
  const featured = await Promise.all(getProducts().filter(p => p.featured).slice(0, 3).map(hydrateAdminPhotos));
  grid.innerHTML = featured.map(p => `
    <div class="product-card fade-in">
      <div class="product-img"><img src="${p.foto || 'https://via.placeholder.com/400x300?text=Prodotto'}" alt="${sanitize(p.name)}"><div class="prod-badge"><span class="badge badge-gold">In Evidenza</span></div></div>
      <div class="product-body">
        <div class="prod-cat">${sanitize(p.cat)}</div>
        <div class="prod-name">${sanitize(p.name)}</div>
        <div class="prod-desc">${sanitize(p.descShort || p.desc || '')}</div>
        <div class="prod-footer"><span class="prod-no-price">Prezzo su richiesta</span></div>
      </div>
    </div>`).join('');
  initFadeIn();
}

/* ══════════════════════════════════════════════════════════
   RENDER USATO — FUNZIONI AGGIUNTE (QUESTO ERA IL BUG!)
   ══════════════════════════════════════════════════════════ */
async function renderUsedItems() {
  const grid = document.getElementById('usedGrid');
  if (!grid) return;
  const items = await Promise.all(getUsedItems().filter(i => i.approved).map(hydrateAdminPhotos));
  grid.innerHTML = items.length ? items.map(i => `
    <div class="product-card fade-in">
      <div class="product-img"><img src="${i.foto || 'https://via.placeholder.com/400x300?text=Usato'}" alt="${sanitize(i.name)}"><div class="prod-badge"><span class="badge cond-${sanitize(i.condition)}">${conditionLabel(i.condition)}</span></div></div>
      <div class="product-body">
        <div class="prod-cat">Usato Garantito</div>
        <div class="prod-name">${sanitize(i.name)}</div>
        <div class="prod-desc">${sanitize(i.descShort || i.desc || '')}</div>
        <div class="prod-footer">
          <span class="prod-price">€${Number(i.price).toLocaleString('it-IT')}<span class="prod-price-iva">+ IVA</span></span>
        </div>
      </div>
    </div>`).join('') : '<p class="empty-state">Nessun articolo usato disponibile.</p>';
  initFadeIn();
}

async function renderHomeUsed() {
  const grid = document.getElementById('homeUsedGrid');
  if (!grid) return;
  const items = await Promise.all(getUsedItems().filter(i => i.approved).slice(0, 3).map(hydrateAdminPhotos));
  grid.innerHTML = items.map(i => `
    <div class="product-card fade-in">
      <div class="product-img"><img src="${i.foto || 'https://via.placeholder.com/400x300?text=Usato'}" alt="${sanitize(i.name)}"><div class="prod-badge"><span class="badge cond-${sanitize(i.condition)}">${conditionLabel(i.condition)}</span></div></div>
      <div class="product-body">
        <div class="prod-cat">Usato Garantito</div>
        <div class="prod-name">${sanitize(i.name)}</div>
        <div class="prod-desc">${sanitize(i.descShort || i.desc || '')}</div>
        <div class="prod-footer">
          <span class="prod-price">€${Number(i.price).toLocaleString('it-IT')}<span class="prod-price-iva">+ IVA</span></span>
        </div>
      </div>
    </div>`).join('');
  initFadeIn();
}

function resetAddUsedForm() {
  ['uNome', 'uPrezzo', 'uDescShort', 'uDescLong'].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = '';
  });
  const condition = document.getElementById('uCondizioni');
  if (condition) condition.selectedIndex = 0;
  const usedCat = document.getElementById('uCat');
  if (usedCat) usedCat.selectedIndex = 0;
  const photo = document.getElementById('uFoto');
  if (photo) photo.value = '';
  const preview = document.getElementById('uFotoPreview');
  if (preview) preview.innerHTML = '';
}

function openAddUsed() {
  const form = document.getElementById('addUsedForm');
  if (!form) return;
  const willOpen = form.classList.contains('hidden');
  if (willOpen) resetAddUsedForm();
  form.classList.toggle('hidden');
}

function closeAddUsed() {
  resetAddUsedForm();
  document.getElementById('addUsedForm')?.classList.add('hidden');
}

async function addUsedManual() {
  const nome = document.getElementById('uNome')?.value.trim();
  const prezzo = parseFloat(document.getElementById('uPrezzo')?.value) || 0;
  const categoria = document.getElementById('uCat')?.value || PRODUCT_CATEGORIES[0];
  const cond = document.getElementById('uCondizioni')?.value || 'usato';
  const descShort = document.getElementById('uDescShort')?.value.trim() || '';
  const descLong = document.getElementById('uDescLong')?.value.trim() || '';
  const fotoInput = document.getElementById('uFoto');
  if (!nome || nome.length < 2) return showToast('Inserisci il nome dell\'articolo.', 'error');
  if (!isValidPrice(prezzo) || prezzo === 0) return showToast('Inserisci un prezzo valido.', 'error');
  if (!fotoInput || !fotoInput.files || fotoInput.files.length === 0) return showToast('Seleziona una foto.', 'error');
  const id = 'u-manual-' + Date.now();
  let photoIds;
  try {
    photoIds = await saveAdminPhotos(fotoInput.files, id);
  } catch (error) {
    return showToast(error.message || 'Errore nel caricamento delle foto.', 'error');
  }
  const saved = addUsedItemAdmin({
    id,
    name: nome.substring(0, 120),
    cat: categoria,
    price: prezzo,
    condition: cond,
    descShort: descShort.substring(0, 150),
    descLong: descLong.substring(0, 1000),
    photoIds,
    approved: true
  });
  if (!saved) {
    await deleteAdminPhotos(photoIds);
    return;
  }
  closeAddUsed();
  showToast('Articolo pubblicato nell\'usato! ✓', 'success');
}

function initUsedPhotoPreview() {
  const photoInput = document.getElementById('uFoto');
  if (!photoInput) return;
  photoInput.addEventListener('change', function() {
    previewAdminFoto(this, 'uFotoPreview');
  });
}

function previewAdminFoto(input, previewId) {
  const div = document.getElementById(previewId);
  if (!div) return;
  div.innerHTML = '';
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  const previewFiles = files.slice(0, 24);
  div.innerHTML = `<p style="font-size:.75rem;color:var(--text-muted);margin:.25rem 0 .5rem;">${files.length} foto selezionate · ${(totalSize / (1024 * 1024)).toFixed(1)} MB${files.length > previewFiles.length ? ' · anteprima delle prime 24' : ''}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:.5rem;">
    ${previewFiles.map((file, index) => `<img src="${URL.createObjectURL(file)}" alt="Anteprima foto ${index + 1}" style="width:100%;height:76px;object-fit:cover;border-radius:6px;border:1px solid var(--border);">`).join('')}
    </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFadeIn();
  initUsedPhotoPreview();
  renderProducts();
  renderHomeProducts();
  renderUsedItems();
  renderHomeUsed();
  document.addEventListener('click', e => {
    if (e.target.closest('#mobileNav a')) closeMobileNav();
  });
  document.getElementById('adminPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', function() { switchAdminTab(this.dataset.tab, this); });
  });
});
