/* ════════════════════════════════════════════════════════
   AZIENDANAME — Componenti Condivisi (navbar, footer, admin)
   ════════════════════════════════════════════════════════ */

/* ── Inietta Navbar ────────────────────────────────────── */
function injectNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
    <div class="container">
      <div class="nav-inner">
        <a href="index.html" class="nav-logo">
          <img src="logo.png" alt="GRU SCAR SRL" style="height:48px;width:auto;display:block;object-fit:contain;">
        </a>
        <nav class="nav-links">
          <a href="index.html">Home</a>
          <a href="chi-siamo.html">Chi Siamo</a>
          <a href="cosa-offriamo.html">Servizi</a>
          <a href="prodotti.html">Prodotti</a>
          <a href="usato.html">Usato</a>
          <a href="vendi-usato.html">Vendi</a>
          <a href="contatti.html">Contatti</a>
        </nav>
        <div class="nav-right">
          <button class="nav-admin-btn" onclick="openAdminLogin()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Admin
          </button>
        
        </div>
        <div class="hamburger" onclick="toggleMobileNav()">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
}

/* ── Inietta Mobile Nav ─────────────────────────────────── */
function injectMobileNav() {
  const mob = document.getElementById('mobileNav');
  if (!mob) return;
  mob.innerHTML = `
    <a href="index.html">Home</a>
    <a href="chi-siamo.html">Chi Siamo</a>
    <a href="cosa-offriamo.html">Servizi</a>
    <a href="prodotti.html">Prodotti</a>
    <a href="usato.html">Usato</a>
    <a href="vendi-usato.html">Vendi il tuo Usato</a>
    <a href="contatti.html">Contatti</a>
    <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:.75rem;">
      <button class="btn btn-gold w-full" onclick="closeMobileNav();openAdminLogin();">🔒 Area Admin</button>
    </div>
  `;
}

/* ── Inietta Footer ─────────────────────────────────────── */
function injectFooter() {
  const f = document.getElementById('site-footer');
  if (!f) return;
  f.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div style="margin-bottom:1.25rem;">
            <a href="index.html" style="display:inline-flex;align-items:center;gap:.85rem;">
              <div class="footer-logo-mark">G</div>
              <div>
                <div class="footer-logo-name">GRU SCAR SRL</div>
                <span class="footer-logo-sub">Gru e Attrezzature</span>
              </div>
            </a>
          </div>
          <p class="footer-desc">Vendita, noleggio e assistenza di gru e attrezzature da lavoro. Mercato usato selezionato e verificato dal nostro team.</p>
          <div style="margin:.75rem 0;">
            <a href="tel:+390599282940" style="color:#a8a29a;font-size:.85rem;display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem;" onmouseover="this.style.color='#f6f3ee'" onmouseout="this.style.color='#a8a29a'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              +39 059 928294
            </a>
            <a href="mailto:info@gruscar.it" style="color:#a8a29a;font-size:.85rem;display:flex;align-items:center;gap:.5rem;" onmouseover="this.style.color='#f6f3ee'" onmouseout="this.style.color='#a8a29a'">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              info@gruscar.it
            </a>
          </div>
          <div style="display:flex;gap:.6rem;">
            <a href="https://www.facebook.com/share/1BQ4258SXX/?mibextid=wwXIfr" class="footer-social-icon" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
        
          </div>
        </div>
        <div>
          <div class="footer-heading">Navigazione</div>
          <div class="footer-links">
            <a href="index.html">Home</a>
            <a href="chi-siamo.html">Chi Siamo</a>
            <a href="cosa-offriamo.html">Servizi</a>
            <a href="prodotti.html">Prodotti</a>
            <a href="contatti.html">Contatti</a>
          </div>
        </div>
        <div>
          <div class="footer-heading">Usato</div>
          <div class="footer-links">
            <a href="usato.html">Articoli Usati</a>
            <a href="vendi-usato.html">Vendi il tuo Usato</a>
            <a href="vendi-usato.html">Come Funziona</a>
            <a href="contatti.html">Assistenza</a>
          </div>
        </div>
        <div>
          <div class="footer-heading">Info Legali</div>
          <div class="footer-links">
            <a href="https://www.iubenda.com/privacy-policy/58599161" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-anchor" title="Privacy Policy">Privacy Policy</a>
            <a href="termini-e-condizioni.html">Termini di Servizio</a>
            <a href="https://www.iubenda.com/privacy-policy/58599161/cookie-policy" class="iubenda-white iubenda-noiframe iubenda-embed iubenda-anchor" title="Cookie Policy">Cookie Policy</a>
            <a href="#">FAQ</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-copy">© 2025 GRU SCAR SRL — P.IVA 03113490365 — Tel. +39 059 928294</div>
        <div class="footer-legal">
          <a href="#" onclick="openAdminLogin();return false;">🔒 Area Admin</a>
          <a href="https://www.iubenda.com/privacy-policy/58599161/cookie-policy" class="iubenda-white iubenda-noiframe iubenda-embed" title="Cookie Policy">Cookie</a>
          <a href="https://www.iubenda.com/privacy-policy/58599161" class="iubenda-white iubenda-noiframe iubenda-embed" title="Privacy Policy">Privacy</a>
        </div>
      </div>
    </div>
  `;

  // Iubenda script (caricato una volta per pagina)
  if (!document.getElementById('iubenda-script')) {
    const iub = document.createElement('script');
    iub.id  = 'iubenda-script';
    iub.src = 'https://cdn.iubenda.com/iubenda.js';
    iub.async = true;
    document.head.appendChild(iub);
  }

  // Social icon styles inline
  document.querySelectorAll('.footer-social-icon').forEach(a => {
    Object.assign(a.style, {
      width:'34px', height:'34px', background:'#2d2b27', borderRadius:'var(--radius)',
      display:'inline-flex', alignItems:'center', justifyContent:'center',
      color:'#6b6459', transition:'var(--transition)'
    });
    a.addEventListener('mouseenter', () => { a.style.background='var(--gold)'; a.style.color='#fff'; });
    a.addEventListener('mouseleave', () => { a.style.background='#2d2b27'; a.style.color='#6b6459'; });
  });
}

/* ── Inietta Admin Modal + Panel ────────────────────────── */
function injectAdminUI() {
  const existing = document.getElementById('adminLoginModal');
  if (existing) return;

  document.body.insertAdjacentHTML('beforeend', `
    <!-- TOAST -->
    <div class="toast" id="toast"></div>

    <!-- ADMIN LOGIN MODAL -->
    <div class="modal-bg" id="adminLoginModal" onclick="if(event.target===this)closeAdminLogin()">
      <div class="modal-box">
        <button class="modal-close" onclick="closeAdminLogin()">×</button>
        <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem;">
          <div style="width:44px;height:44px;background:var(--text);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;color:var(--bg);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div>
            <div style="font-family:'Playfair Display',serif;font-size:1.5rem;">Area Riservata</div>
            <div style="font-size:.65rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--text-dim);">Accesso Amministratore</div>
          </div>
        </div>
        <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:1.5rem;">Inserisci le credenziali per accedere al pannello di controllo.</p>
        <div class="form-group">
          <label class="form-label">Username</label>
          <input class="form-input" id="adminUser" type="text" placeholder="admin" maxlength="40" autocomplete="username">
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" id="adminPass" type="password" placeholder="••••••••" maxlength="80" autocomplete="current-password">
        </div>
        <div class="form-error hidden" id="loginError">Credenziali non valide. Riprova.</div>
        <button class="btn btn-gold w-full mt-1" onclick="doAdminLogin()" style="justify-content:center;">Accedi →</button>
        <p style="font-size:.72rem;color:var(--text-dim);margin-top:1.25rem;text-align:center;">Accesso riservato al personale autorizzato.</p>
      </div>
    </div>

    <!-- ADMIN PANEL -->
    <div id="admin-panel">
      <div class="admin-topbar">
        <div style="display:flex;align-items:center;gap:.75rem;">
          <a href="index.html">
            <img src="logo.png" alt="GRU SCAR SRL" style="height:40px;width:auto;display:block;object-fit:contain;">
          </a>
        </div>
        <div style="display:flex;align-items:center;gap:1rem;">
          <span style="font-size:.78rem;color:var(--text-muted);">Logged in as <strong>Admin</strong></span>
          <button class="btn btn-light btn-sm" onclick="adminLogout()">Esci</button>
        </div>
      </div>
      <div class="admin-body">
        <div class="admin-tabs">
          <button class="admin-tab active" data-tab="messaggi">Messaggi Clienti <span id="pendingBadge"></span></button>
          <button class="admin-tab" data-tab="usato-richieste">Richieste Usato</button>
          <button class="admin-tab" data-tab="prodotti-admin">Prodotti</button>
          <button class="admin-tab" data-tab="usato-admin">Usato Pubblicato</button>
        </div>

        <!-- TAB: MESSAGGI -->
        <div class="admin-tab-content active" id="tab-messaggi">
          <div style="margin-bottom:1.5rem;"><h3 style="font-size:1.2rem;">Messaggi dal Modulo Contatti</h3></div>
          <div id="contactsList"></div>
        </div>

        <!-- TAB: RICHIESTE USATO (email) -->
        <div class="admin-tab-content" id="tab-usato-richieste">
          <div style="margin-bottom:1.5rem;">
            <h3 style="font-size:1.2rem;">Segnalazioni Articoli Usato</h3>
            <p style="font-size:.85rem;color:var(--text-muted);margin-top:.4rem;">Questi sono i dati inviati via email dai clienti. Dopo aver trattato l'accordo per email, puoi pubblicare l'articolo direttamente qui.</p>
          </div>
          <div id="usedRequestsList"></div>
        </div>

        <!-- TAB: PRODOTTI -->
        <div class="admin-tab-content" id="tab-prodotti-admin">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <h3 style="font-size:1.2rem;">Gestione Prodotti</h3>
            <button class="btn btn-gold btn-sm" onclick="openAddProduct()">+ Aggiungi Prodotto</button>
          </div>
          <div id="addProductForm" class="hidden" style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;margin-bottom:1.5rem;">
            <h4 style="margin-bottom:1rem;">Nuovo Prodotto</h4>
            <div class="grid-2">
              <div class="form-group"><label class="form-label">Nome *</label><input class="form-input" id="pNome" type="text" placeholder="Nome prodotto" maxlength="120"></div>
              <div class="form-group"><label class="form-label">Prezzo (€) *</label><input class="form-input" id="pPrezzo" type="number" placeholder="0" min="0"></div>
            </div>
            <div class="grid-2">
              <div class="form-group"><label class="form-label">Categoria</label>
                <select class="form-input" id="pCat"><option value="cat1">Categoria 1</option><option value="cat2">Categoria 2</option><option value="cat3">Categoria 3</option><option value="novita">Novità</option></select>
              </div>
              <div class="form-group"><label class="form-label">Prezzo Barrato (€)</label><input class="form-input" id="pPrezzoOld" type="number" placeholder="0 = nessuno" min="0"></div>
            </div>
            <div class="form-group"><label class="form-label">Descrizione</label><textarea class="form-input" id="pDesc" placeholder="Breve descrizione..." maxlength="300" style="min-height:80px;"></textarea></div>
            <div class="form-group">
              <label class="form-label">Foto Prodotto</label>
              <input type="file" id="pFoto" accept="image/*" onchange="previewAdminFoto(this,'pFotoPreview')" style="margin-bottom:8px;font-size:13px;">
              <div id="pFotoPreview"></div>
            </div>
            <div style="display:flex;gap:.75rem;">
              <button class="btn btn-gold btn-sm" onclick="addProduct()">Salva</button>
              <button class="btn btn-light btn-sm" onclick="document.getElementById('addProductForm').classList.add('hidden')">Annulla</button>
            </div>
          </div>
          <table class="admin-table">
            <thead><tr><th>Prodotto</th><th>Categoria</th><th>Prezzo</th><th>Azioni</th></tr></thead>
            <tbody id="productsAdminTable"></tbody>
          </table>
        </div>

        <!-- TAB: USATO PUBBLICATO -->
        <div class="admin-tab-content" id="tab-usato-admin">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem;">
            <h3 style="font-size:1.2rem;">Articoli Usati Pubblicati</h3>
            <button class="btn btn-gold btn-sm" onclick="openAddUsed()">+ Aggiungi Articolo Manualmente</button>
          </div>
          <div id="addUsedForm" class="hidden" style="background:var(--surface);border:1.5px solid var(--border);border-radius:var(--radius-lg);padding:1.5rem;margin-bottom:1.5rem;">
            <h4 style="margin-bottom:1rem;">Nuovo Articolo Usato</h4>
            <div class="grid-2">
              <div class="form-group"><label class="form-label">Nome Articolo *</label><input class="form-input" id="uNome" type="text" placeholder="es. Gru Fassi F110" maxlength="120"></div>
              <div class="form-group"><label class="form-label">Prezzo (€) *</label><input class="form-input" id="uPrezzo" type="number" placeholder="0" min="0"></div>
            </div>
            <div class="grid-2">
              <div class="form-group"><label class="form-label">Venditore / Provenienza</label><input class="form-input" id="uVenditore" type="text" placeholder="es. Cliente privato" maxlength="80"></div>
              <div class="form-group"><label class="form-label">Condizioni</label>
                <select class="form-input" id="uCondizioni">
                  <option value="ottimo">Ottime — Come nuovo</option>
                  <option value="buono">Buone — Qualche segno d'uso</option>
                  <option value="usato">Usato — Segni visibili</option>
                </select>
              </div>
            </div>
            <div class="form-group"><label class="form-label">Descrizione</label><textarea class="form-input" id="uDesc" placeholder="Descrizione articolo, accessori inclusi, note..." maxlength="500" style="min-height:80px;"></textarea></div>
            <div class="form-group"><label class="form-label">Foto dell'Articolo</label>
              <input type="file" id="uFoto" accept="image/*" onchange="previewAdminFoto(this,'uFotoPreview')" style="margin-bottom:8px;font-size:13px;">
              <div id="uFotoPreview"></div>
            </div>
            <div style="display:flex;gap:.75rem;">
              <button class="btn btn-gold btn-sm" onclick="addUsedManual()">✓ Pubblica Articolo</button>
              <button class="btn btn-light btn-sm" onclick="document.getElementById('addUsedForm').classList.add('hidden')">Annulla</button>
            </div>
          </div>
          <table class="admin-table">
            <thead><tr><th>Articolo</th><th>Venditore</th><th>Prezzo</th><th>Condizioni</th><th>Azioni</th></tr></thead>
            <tbody id="usedAdminTable"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MOBILE NAV -->
    <div class="mobile-nav" id="mobileNav"></div>
  `);
}

/* ── INIT COMPONENTI ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  injectNavbar();
  injectAdminUI();
  injectMobileNav();
  injectFooter();
  // Ri-aggancia admin tab listener dopo injection
  document.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      switchAdminTab(this.dataset.tab, this);
      if (this.dataset.tab === 'messaggi') renderAdminContacts();
      if (this.dataset.tab === 'usato-richieste') renderAdminUsedRequests();
      if (this.dataset.tab === 'prodotti-admin') renderProductsAdmin();
      if (this.dataset.tab === 'usato-admin') renderUsedAdmin();
    });
  });
  // Admin pass enter
  document.addEventListener('keydown', e => {
    const modal = document.getElementById('adminLoginModal');
    if (modal?.classList.contains('open') && e.key === 'Enter') doAdminLogin();
    if (e.key === 'Escape') {
      closeAdminLogin();
      const ap = document.getElementById('admin-panel');
      if (ap?.classList.contains('open') && checkAdminSession()) {
        // do nothing on escape if admin panel open
      }
    }
  });
});
