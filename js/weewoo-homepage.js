'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (location.search.includes('noanim')) document.documentElement.classList.add('noanim');

/* No preloader any more — the page paints straight away. `loaded` only gates the
   hero's one-shot entrance, so set it on the next frame. */
requestAnimationFrame(() => document.body.classList.add('loaded'));
/* rAF never fires in a background tab, which would leave the hero H1 invisible
   until focus. setTimeout still fires (throttled), so guarantee the reveal. */
setTimeout(() => document.body.classList.add('loaded'), 600);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) document.body.classList.add('loaded');
}, { once: true });


/* nav scroll */
const nav = $('#nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  const keepProductNavVisible = document.body.classList.contains('single-product');
  nav?.classList.toggle('scrolled', keepProductNavVisible || y > 30);
  if (nav && keepProductNavVisible) nav.classList.remove('hidden');
  if (nav && !keepProductNavVisible) nav.classList.toggle('hidden', !nav.classList.contains('nav-locked') && y > 700 && y > lastY);
  lastY = y;
  const sp = $('#scrollProgress');
  if (sp) sp.style.width = (y / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
}, { passive: true });

/* reveal on scroll */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const siblings = $$('.reveal', el.parentElement).filter(s => !s.classList.contains('in'));
    const idx = Math.max(0, siblings.indexOf(el));
    setTimeout(() => el.classList.add('in'), Math.min(idx, 5) * 85);
    revealObserver.unobserve(el);
  });
}, { threshold: .15, rootMargin: '0px 0px -5% 0px' });
$$('.reveal').forEach(el => revealObserver.observe(el));
/* safety net: never leave content invisible if an observer misses (fast scroll,
   anchor jump to #plans, or bfcache restore) */
setTimeout(() => { $$('.reveal:not(.in)').forEach(el => el.classList.add('in')); $$('.product-card:not(.shown)').forEach(el => el.classList.add('shown')); }, 2200);

/* magnetic buttons */
if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduceMotion) {
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* stagger product cards */
function observeProductCards(scope = document) {
  const cards = $$('.product-card', scope);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      obs.unobserve(en.target);
      setTimeout(() => en.target.classList.add('shown'), (cards.indexOf(en.target) % 6) * 70);
    });
  }, { threshold: .12 });
  cards.forEach(c => obs.observe(c));
}

/* marquee pause */
function bindMarqueePause() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => en.target.classList.toggle('offscreen', !en.isIntersecting));
  }, { rootMargin: '80px' });
  $$('.hero-rails, .reviews-marquee').forEach(el => obs.observe(el));
}

/* FAQ smooth */
function bindFaq() {
  $$('.faq-item').forEach(d => {
    const body = $('.faq-body', d);
    body.style.maxHeight = '0px';
    body.style.transition = 'max-height .5s cubic-bezier(.22,1,.36,1)';
    $('summary', d).addEventListener('click', e => {
      e.preventDefault();
      const open = d.hasAttribute('open');
      if (open) { body.style.maxHeight = '0px'; setTimeout(() => d.removeAttribute('open'), 480); }
      else { d.setAttribute('open', ''); body.style.maxHeight = body.scrollHeight + 'px'; }
    });
  });
}

/* CTA dot canvas */
function bindCtaCanvas() {
  const cv = $('#ctaCanvas'); if (!cv || reduceMotion) return;
  const ctx = cv.getContext('2d');
  let w, h, visible = false;
  function size() { w = cv.clientWidth; h = cv.clientHeight; cv.width = Math.max(2, w); cv.height = Math.max(2, h); }
  size(); addEventListener('resize', size);
  new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(cv);
  const GAP = 26;
  (function frame(t) {
    requestAnimationFrame(frame);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(23,26,18,.4)';
    for (let x = GAP / 2; x < w; x += GAP)
      for (let y = GAP / 2; y < h; y += GAP) {
        const rr = 1 + Math.sin(t * .0012 + x * .02 + y * .03) * .8;
        if (rr > 0.15) { ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill(); }
      }
  })(0);
}

/* horizontal scroller arrows (homepage category rows + product-page related) */
function bindScrollerArrows() {
  $$('.ww-scroll-arrow').forEach(btn => {
    const wrap = btn.closest('.cat-row, .ww-related');
    const track = wrap ? wrap.querySelector('.cat-scroll, .ww-related-scroll') : null;
    if (!track) return;
    const dir = parseInt(btn.getAttribute('data-dir') || '1', 10);
    btn.addEventListener('click', () => {
      track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.85), behavior: 'smooth' });
    });
  });
  $$('.cat-row, .ww-related').forEach(wrap => {
    const track = wrap.querySelector('.cat-scroll, .ww-related-scroll');
    if (!track) return;
    const prev = wrap.querySelector('.ww-scroll-arrow[data-dir="-1"]');
    const next = wrap.querySelector('.ww-scroll-arrow[data-dir="1"]');
    const update = () => {
      const max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    };
    track.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  });
}

/* drawer */
/* Drawer menu comes from the WordPress "Mobile" menu, which renders plain nested
   <ul>s — turn parent items into tap-to-open accordions (collapsed by default). */
function bindMobileMenuAccordion() {
  $$('.ww-mobile-ul li.menu-item-has-children > a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      a.parentElement.classList.toggle('ww-open');
    });
  });
  /* Desktop dropdown parents are href="#" placeholders (their children are the real
     links). Without this, clicking one scrolls the page to the top and appends "#". */
  $$('.ww-pc-ul li.menu-item-has-children > a').forEach(a => {
    if ((a.getAttribute('href') || '#') === '#') {
      a.addEventListener('click', e => e.preventDefault());
    }
  });
}

function bindDrawers() {
  const overlay = $('#drawerOverlay');
  const closeAll = window.wwCloseDrawers
    || (() => { $$('.drawer').forEach(d => d.classList.remove('open')); overlay?.classList.remove('open'); document.body.style.overflow = ''; });

  /* The inline bootstrap in weewoo-storefront.php already owns open/close — it
     binds while the header parses, so the first tap works even before this file
     has downloaded. Binding again here would give the hamburger two listeners
     and one tap would open the drawer and immediately close it. Everything
     below the guard is cart-specific and still belongs to this file. */
  if (!window.__wwDrawerBoot) {
    $('#openMenu')?.addEventListener('click', () => { $('#menuDrawer')?.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow = 'hidden'; });
    overlay?.addEventListener('click', closeAll);
    $$('.drawer-close').forEach(b => b.addEventListener('click', closeAll));
    addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#searchOverlay')?.classList.contains('open')) closeAll(); });
  }

  $('#navCart')?.addEventListener('click', e => { e.preventDefault(); openCart(); });
  $('#cartBody')?.addEventListener('click', e => {
    const rm = e.target.closest('.cart-remove');
    if (rm) { e.preventDefault(); removeCartItem(rm.getAttribute('data-key')); }
  });
  /* overlay / .drawer-close / Escape are bound inside the guard above — they
     used to be repeated here as well, which is precisely the double-listener
     the guard exists to prevent. */
}

/* toast */
let toastTimer;
function showToast(msg) {
  let t = $('#wwToast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    t.id = 'wwToast';
    document.body.appendChild(t);
  }
  t.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>${msg}`;
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── slide cart ── */
const WW_CATALOG_URL = (() => {
  const script = document.querySelector('script[src*="weewoo-homepage.js"]');
  return script ? new URL('../alldigitalproductsinfo.json', script.src).href : 'alldigitalproductsinfo.json';
})();
let wwCatalogPromise;
function loadCatalog() {
  if (!wwCatalogPromise) {
    wwCatalogPromise = fetch(WW_CATALOG_URL).then(r => r.ok ? r.json() : []).catch(() => []);
  }
  return wwCatalogPromise;
}
function wwEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
function wwLocalUrl(value) {
  if (!value) return '#';
  try { return new URL(value, WW_CATALOG_URL).pathname + new URL(value, WW_CATALOG_URL).search + new URL(value, WW_CATALOG_URL).hash; }
  catch (e) { return String(value); }
}
function renderProductCard(product) {
  const url = wwEscape('products/?slug=' + encodeURIComponent(product.slug || product.id || ''));
  const name = wwEscape(product.name || 'Digital product');
  const image = wwEscape(wwLocalUrl(product.image));
  const price = wwEscape(product.price || '');
  const oldPrice = product.oldPrice ? `<s>${wwEscape(product.oldPrice)}</s>` : '';
  const addId = wwEscape(product.addId || product.id || '');
  const variationId = wwEscape(product.variationId || '0');
  const cartKey = String(product.addId || product.id || '') + ':' + String(product.variationId || '0');
  const alreadyInCart = localCart().some(item => item.key === cartKey);
  return `<a class="product-media" href="${url}">
    <img src="${image}" alt="${name}" loading="lazy" decoding="async" width="640" height="640">
  </a><div class="product-body">
    <a class="product-name" href="${url}">${name}</a><div class="product-price">
      <b>${price}</b><span>/mo</span>${oldPrice}</div><div class="product-actions">
      <a class="btn-cart${alreadyInCart ? ' added' : ''}" href="${url}" data-add-id="${addId}" data-var-id="${variationId}" aria-label="${alreadyInCart ? 'Already in cart: ' : 'Add '}${name} to cart">
        <svg viewBox="0 0 24 24"><path d="M6 7h13l-1.5 9h-10L5 3H2"></path><circle cx="9" cy="21" r="1.6"></circle><circle cx="16" cy="21" r="1.6"></circle></svg>
      </a>
      <a class="btn btn-dark" href="${url}">Buy now</a></div></div>`;
}
function renderCatalogCards(products) {
  const grids = [...document.querySelectorAll('.cat-grid')];
  const groups = ['subscriptions', 'combo', 'software'];
  grids.forEach((grid, index) => {
    const category = grid.closest('.cat-row')?.id.replace(/^cat-/, '') || groups[index];
    const list = products.filter(product => (product.collections || [product.category]).includes(category));
    if (!list.length) return;
    grid.innerHTML = '';
    list.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.dataset.id = product.id;
      card.innerHTML = renderProductCard(product);
      grid.appendChild(card);
    });
  });

  const shopGrid = document.querySelector('#wwShopGrid');
  if (shopGrid && products.length) {
    const path = location.pathname;
    const category = path.includes('/plans/subscriptions/') ? 'subscriptions'
      : path.includes('/plans/combo/') ? 'combo'
      : path.includes('/plans/software/') ? 'software'
      : path.includes('/plans/adult/') ? 'adult'
      : path.includes('/plans/music/') ? 'music'
      : path.includes('/plans/more-plans/') ? 'more-plans'
      : path.includes('/shop/') ? null : '';
    const list = category === '' ? [] : products.filter(product => !category || (product.collections || [product.category]).includes(category));
    const countNode = document.querySelector('#wwShopCount');
    if (countNode) countNode.textContent = String(list.length);
    if (list.length) {
      shopGrid.innerHTML = '';
      list.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        card.innerHTML = renderProductCard(product);
        shopGrid.appendChild(card);
      });
    }
  } else {
    const countNode = document.querySelector('#wwShopCount');
    if (countNode) countNode.textContent = '0';
  }
}
function localCart() {
  try { return JSON.parse(localStorage.getItem('softmart_cart') || '[]'); } catch (e) { return []; }
}
function saveLocalCart(items) { localStorage.setItem('softmart_cart', JSON.stringify(items)); }
function localCartData() {
  const items = localCart();
  const total = items.reduce((sum, item) => sum + (parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0) * item.qty, 0);
  return { count: items.reduce((sum, item) => sum + item.qty, 0), items, total: '₹' + total.toLocaleString('en-IN'), checkout_url: 'checkout/' };
}

/* These pages are edge-cached, so the badge ships EMPTY in the HTML (a server-rendered
   count would be shared with every other visitor). WooCommerce keeps the real count in a
   JS-readable cookie, so we can hydrate instantly with zero network requests. */
function hydrateCartBadgeFromCookie() {
  updateCartBadge(localCartData().count);
}

function updateCartBadge(count) {
  const badge = $('#cartCount');
  if (!badge) return;
  const n = parseInt(count, 10) || 0;
  /* Empty (not "0") — otherwise a stray "0" can paint before CSS applies. */
  badge.textContent = n > 0 ? n : '';
  badge.classList.toggle('on', n > 0);
  /* Only pop when there IS something to show. The cartPop keyframes animate
     `transform:scale(1)`, and a running animation beats the `transform:scale(0)`
     that hides an empty badge — so popping on 0 flashed a green "0" for 0.4s. */
  badge.classList.remove('pop');
  if (n > 0) { void badge.offsetWidth; badge.classList.add('pop'); }
}

function renderCart(data) {
  const body = $('#cartBody'), foot = $('#cartFoot'), hc = $('#cartHeadCount');
  if (!body) return;
  updateCartBadge(data.count);
  if (hc) hc.textContent = data.count ? '(' + data.count + ')' : '';
  if (!data.items || !data.items.length) {
    body.innerHTML = '<div class="cart-empty"><svg viewBox="0 0 24 24"><path d="M6 7h13l-1.5 9h-10L5 3H2"/><circle cx="9" cy="21" r="1.6"/><circle cx="16" cy="21" r="1.6"/></svg><p>Your cart is empty.</p></div>';
    if (foot) foot.hidden = true;
    return;
  }
  body.innerHTML = data.items.map(it => `
    <div class="cart-item" data-key="${it.key}">
      <img src="${it.img}" alt="" loading="eager">
      <div class="cart-item-info">
        <b>${it.name}</b>
        ${it.meta ? `<span>${it.meta}</span>` : ''}
        <div class="cart-item-row">
          <span class="cart-item-price">${it.price}${it.qty > 1 ? ' × ' + it.qty : ''}</span>
          <button class="cart-remove" data-key="${it.key}">Remove</button>
        </div>
      </div>
    </div>`).join('') + (data.offer || '');
  /* data.offer is the combo/cross-sell card from the server (same engine as cart & checkout).
     Its wwCuAccept handler + CSS are already on the page via ww_cu_print_assets, and inline
     onclick handlers fire even when set through innerHTML, so it works with no extra wiring. */
  if (foot) {
    foot.hidden = false;
    $('#cartSubtotal').textContent = data.total;
    $('#cartCheckoutBtn').href = data.checkout_url;
  }
}

function fetchCart() {
  const data = localCartData();
  renderCart(data);
  return Promise.resolve(data);
}

function openCart() {
  const d = $('#cartDrawer'), o = $('#drawerOverlay');
  $('#menuDrawer')?.classList.remove('open');
  d?.classList.add('open'); o?.classList.add('open'); document.body.style.overflow = 'hidden';
  fetchCart();
}

function removeCartItem(key) {
  saveLocalCart(localCart().filter(item => item.key !== key));
  renderCart(localCartData());
}

/* reveal the header so the shopper sees the cart count update, even mid-scroll */
function revealNav() {
  const nav = $('#nav');
  if (!nav) return;
  nav.classList.remove('hidden');
  nav.classList.add('nav-locked');
  clearTimeout(nav._lockT);
  nav._lockT = setTimeout(() => nav.classList.remove('nav-locked'), 2800);
}

/* AJAX add-to-cart — adds without leaving the page */
function bindAddToCart() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-cart[data-add-id]');
    if (!btn) return;
    e.preventDefault();
    if (btn.classList.contains('loading')) return;
    const id = btn.getAttribute('data-add-id');
    const varId = btn.getAttribute('data-var-id') || '0';
    btn.classList.add('loading');
    loadCatalog().then(products => {
      const product = products.find(p => String(p.addId || p.id) === String(id) && (!varId || String(p.variationId) === String(varId)))
        || products.find(p => String(p.addId || p.id) === String(id));
      if (!product) { btn.classList.remove('loading'); return; }
      const key = String(product.addId || product.id) + ':' + String(product.variationId || varId || '0');
      const items = localCart();
      const existing = items.find(item => item.key === key);
      if (existing) {
        btn.classList.remove('loading');
        btn.classList.add('added');
        updateCartBadge(localCartData().count);
        revealNav();
        showToast('Already in cart');
        return;
      }
      items.push({ key, id: product.id, name: product.name, img: new URL(product.image, WW_CATALOG_URL).href, price: product.price, qty: 1, meta: 'SoftMart digital product' });
      saveLocalCart(items);
      btn.classList.remove('loading');
      btn.classList.add('added');
      setTimeout(() => {
        const stillInCart = localCart().some(item => item.key === key);
        if (!stillInCart) btn.classList.remove('added');
      }, 1400);
      updateCartBadge(localCartData().count);
      revealNav();
      if ($('#cartDrawer')?.classList.contains('open')) fetchCart();
      showToast('Added to cart');
    });
  });
}

/* ── search popup ── */
function bindSearch() {
  const overlay = $('#searchOverlay');
  const input   = $('#searchInput');
  const results = $('#searchResults');
  const clearBtn = $('#searchClear');
  if (!overlay || !input) return;

  let debounceT, abortC;

  function openSearch() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 120);
  }
  function closeSearch() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    input.value = '';
    clearBtn?.classList.remove('show');
    if (results) results.innerHTML = '';
    if (abortC) abortC.abort();
  }

  $('#openSearch')?.addEventListener('click', openSearch);
  $('#searchCloseBtn')?.addEventListener('click', closeSearch);
  $('.search-overlay-bg')?.addEventListener('click', closeSearch);
  addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeSearch(); });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearBtn?.classList.toggle('show', q.length > 0);
    clearTimeout(debounceT);
    if (q.length < 2) { if (results) results.innerHTML = ''; return; }
    debounceT = setTimeout(() => searchProducts(q), 280);
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('show');
    if (results) results.innerHTML = '';
    input.focus();
  });

  function searchProducts(q) {
    if (abortC) abortC.abort();
    abortC = new AbortController();
    if (results) results.innerHTML = '<p class="search-loading">Searching...</p>';

    loadCatalog()
      .then(items => {
        items = items.filter(p => (p.name || '').toLowerCase().includes(q.toLowerCase())).slice(0, 8);
        if (!results) return;
        if (!items || !items.length) {
          results.innerHTML = '<p class="search-no-results">No products found for "' + q.replace(/</g, '&lt;') + '"</p>';
          return;
        }
        results.innerHTML = items.map(p => {
          const img = p.image ? new URL(p.image, WW_CATALOG_URL).href : '';
          const name = p.name || '';
          const link = p.slug ? 'products/?slug=' + encodeURIComponent(p.slug) : (p.url ? new URL(p.url, WW_CATALOG_URL).href : '#');
          const price = p.price || '';
          return '<a class="search-result" href="' + link + '">'
            + (img ? '<img class="search-result-img" src="' + img + '" alt="" loading="lazy">' : '<div class="search-result-img"></div>')
            + '<div class="search-result-info"><div class="search-result-name">' + name + '</div>'
            + '<div class="search-result-price">' + price + '</div></div></a>';
        }).join('');
      })
      .catch(e => { if (e.name !== 'AbortError' && results) results.innerHTML = ''; });
  }

  function formatPrice(raw, prices) {
    if (!raw) return '';
    const dp = parseInt(prices.currency_minor_unit || '0', 10);
    const n = (parseInt(raw, 10) / Math.pow(10, dp)).toFixed(dp);
    const sym = prices.currency_symbol || '₹';
    const pre = prices.currency_prefix || sym;
    const suf = prices.currency_suffix || '';
    return pre + n + suf;
  }
}

/* ── page init ──
   wwReady() instead of a raw DOMContentLoaded listener so this still runs when the
   script is deferred/combined by LiteSpeed (in which case DOMContentLoaded may
   have already fired before the script executes). */
function wwReady(fn){ if (document.readyState !== 'loading') { fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
wwReady(() => {
  loadCatalog().then(renderCatalogCards);
  observeProductCards();
  bindMarqueePause();
  bindFaq();
  bindCtaCanvas();
  bindDrawers();
  bindAddToCart();
  bindScrollerArrows();
  bindMobileMenuAccordion();
  hydrateCartBadgeFromCookie();
  bindSearch();
});
