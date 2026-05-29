/* ============================================================
   ACHADINHOS DA LILU — script.js
   ============================================================ */

const STORAGE_KEY = 'lilu_products_v2';

// ── Helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const getProducts = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Menu ─────────────────────────────────────────────────────
function initMenu() {
  const menuBtn  = $('menu-btn');
  const sideMenu = $('side-menu');
  const overlay  = $('overlay');
  const closeBtn = $('menu-close');

  function open()  { sideMenu.classList.add('open'); overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function close() { sideMenu.classList.remove('open'); overlay.classList.remove('open'); document.body.style.overflow = ''; }

  menuBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);

  // Nav links close menu
  document.querySelectorAll('.menu-nav a').forEach(a => {
    a.addEventListener('click', () => { close(); });
  });
}

// ── Search ───────────────────────────────────────────────────
let activeCategory = null;
let searchQuery = '';

function initSearch() {
  const input    = $('search-input');
  const clearBtn = $('search-clear');

  input.addEventListener('input', () => {
    searchQuery = input.value.trim().toLowerCase();
    clearBtn.classList.toggle('visible', searchQuery.length > 0);
    renderAll();
  });

  clearBtn.addEventListener('click', () => {
    input.value = ''; searchQuery = '';
    clearBtn.classList.remove('visible');
    renderAll();
  });
}

// ── Category filter ───────────────────────────────────────────
function initCategories() {
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat;
      if (activeCategory === cat) {
        activeCategory = null;
        chip.classList.remove('active');
      } else {
        document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
        activeCategory = cat;
        chip.classList.add('active');
      }
      renderAll();

      // Close menu and scroll to products
      document.getElementById('side-menu').classList.remove('open');
      document.getElementById('overlay').classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        $('products-section') && $('products-section').scrollIntoView({ behavior: 'smooth' });
      }, 200);
    });
  });
}

// ── Filter helper ─────────────────────────────────────────────
function filterProducts(products) {
  return products.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory;
    const q = searchQuery;
    const matchQ  = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

// ── Render media ─────────────────────────────────────────────
function mediaEl(product, cssClass) {
  if (product.video) {
    return `<video src="${product.video}" class="${cssClass}" autoplay loop muted playsinline poster="${product.image || ''}"></video>`;
  }
  if (product.image) {
    return `<img src="${product.image}" alt="${product.title}" class="${cssClass}" loading="lazy">`;
  }
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f0ecff;font-size:2.5rem;">🛍️</div>`;
}

// ── Render Offers ─────────────────────────────────────────────
function renderOffers() {
  const grid = $('offers-grid');
  const section = $('offers-section');
  if (!grid) return;

  const all = getProducts();
  const offers = filterProducts(all.filter(p => p.offerOfDay));

  if (offers.length === 0) {
    section.style.display = 'none';
    return;
  }
  section.style.display = '';

  grid.innerHTML = offers.map(p => `
    <div class="offer-card" onclick="window.open('${p.affiliateLink}','_blank')">
      <span class="offer-badge">⭐ Oferta do Dia</span>
      <div class="offer-img-wrap">${mediaEl(p, '')}</div>
      <div class="offer-info">
        <div class="offer-name">${p.title}</div>
        ${p.description ? `<div class="offer-desc">${p.description}</div>` : ''}
        <div class="offer-price">${p.price}</div>
        <button class="offer-btn" onclick="event.stopPropagation();window.open('${p.affiliateLink}','_blank')">Ver Oferta ↗</button>
      </div>
    </div>
  `).join('');
}

// ── Render Products ───────────────────────────────────────────
function renderProducts() {
  const grid = $('products-grid');
  if (!grid) return;

  const filterBar = $('filter-bar');

  const all = getProducts().filter(p => !p.offerOfDay);
  const filtered = filterProducts(all);

  // Active filter display
  if (filterBar) {
    filterBar.innerHTML = '';
    if (activeCategory) {
      filterBar.innerHTML = `
        <div class="filter-tag">
          ${activeCategory}
          <button onclick="clearFilter()">✕</button>
        </div>`;
    }
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="emoji">🔍</div>
        <p>Nenhum produto encontrado.<br>Tente outra busca ou categoria.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, i) => `
    <div class="product-card" style="animation-delay:${(i % 10) * 0.04}s" onclick="window.open('${p.affiliateLink}','_blank')">
      <div class="product-img-wrap">
        ${mediaEl(p, '')}
        <span class="product-cat-badge">${p.category}</span>
      </div>
      <div class="product-info">
        <div class="product-name">${p.title}</div>
        ${p.description ? `<div class="product-desc-mini">${p.description}</div>` : ''}
        <div class="product-price">${p.price}</div>
        <button class="product-btn" onclick="event.stopPropagation();window.open('${p.affiliateLink}','_blank')">Ver Oferta ↗</button>
      </div>
    </div>
  `).join('');
}

window.clearFilter = function () {
  activeCategory = null;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  renderAll();
};

function renderAll() {
  renderOffers();
  renderProducts();
}

// ── Nav scroll-to ─────────────────────────────────────────────
function initNavLinks() {
  $('nav-inicio')   && $('nav-inicio').addEventListener('click',   () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  $('nav-ofertas')  && $('nav-ofertas').addEventListener('click',  () => $('offers-section').scrollIntoView({ behavior: 'smooth' }));
  $('nav-sobre')    && $('nav-sobre').addEventListener('click',    () => $('about-section').scrollIntoView({ behavior: 'smooth' }));
  $('nav-cats')     && $('nav-cats').addEventListener('click',     () => $('products-section').scrollIntoView({ behavior: 'smooth' }));
}

// ── Hero button ───────────────────────────────────────────────
function initHero() {
  $('hero-btn') && $('hero-btn').addEventListener('click', () => {
    const offerSec = $('offers-section');
    const target = offerSec && offerSec.style.display !== 'none' ? offerSec : $('products-section');
    target && target.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── Storage event (cross-tab) ─────────────────────────────────
window.addEventListener('storage', e => {
  if (e.key === STORAGE_KEY) renderAll();
});

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSearch();
  initCategories();
  initNavLinks();
  initHero();
  renderAll();

  // Demo products if empty
  if (getProducts().length === 0) {
    const demos = [
      { id: 'demo1', title: 'Kit Skincare Glow Vitamina C', description: 'Sérum + hidratante + protetor solar', category: 'Beleza', price: 'R$ 89,90', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80', offerOfDay: true },
      { id: 'demo2', title: 'Perfume Floral Rosé 100ml', description: 'Fragrância leve e feminina', category: 'Perfumes', price: 'R$ 149,00', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80', offerOfDay: true },
      { id: 'demo3', title: 'Vestido Midi Floral', description: 'Perfeito para o verão', category: 'Moda', price: 'R$ 79,90', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80', offerOfDay: false },
      { id: 'demo4', title: 'Porta Joias Espelhado', description: 'Organização com estilo', category: 'Decoração', price: 'R$ 59,90', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1619043668765-5e977e1bdb6c?w=400&q=80', offerOfDay: false },
      { id: 'demo5', title: 'Fone Bluetooth Rosa', description: 'Qualidade de som premium', category: 'Eletrônicos', price: 'R$ 199,00', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80', offerOfDay: false },
      { id: 'demo6', title: 'Jogo de Xícaras Dourado', description: 'Porcelana premium 6 peças', category: 'Cozinha', price: 'R$ 129,00', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', offerOfDay: false },
      { id: 'demo7', title: 'Bolsa Estruturada Vinho', description: 'Couro sintético premium', category: 'Moda', price: 'R$ 189,00', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80', offerOfDay: false },
      { id: 'demo8', title: 'Vaso Marmorizado Rose', description: 'Decoração moderna', category: 'Casa', price: 'R$ 49,90', affiliateLink: '#', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80', offerOfDay: false },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
    renderAll();
  }
});
