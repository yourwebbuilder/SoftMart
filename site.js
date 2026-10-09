(function () {
  document.title = document.title.replace(/WeeWoo/gi, 'SoftMart');
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  var node;
  while ((node = walker.nextNode())) {
    node.nodeValue = node.nodeValue
      .replace(/https:\/\/showroom\.dotpe\.in\/temporary-1weewoo/gi, 'this site')
      .replace(/\+91\s*94375\s*19360|\+919437519360|919437519360|9437519360/g, '+1 3603601075')
      .replace(/@tryweewoo/gi, '@xtarnetdev')
      .replace(/WeeWoo/gi, 'SoftMart');
  }

  var accountSelectors = [
    '.nav-acct', '.login-link', '.mobile-menu-my-account',
    '.mobile-menu-login-btn', '.mobile-menu-logout-btn',
    '.ww-drawer-logout', '.ww-dock a[href*="/my-account/"]'
  ];

  accountSelectors.forEach(function (selector) {
    document.querySelectorAll(selector).forEach(function (el) { el.remove(); });
  });

  document.querySelectorAll('a, button').forEach(function (el) {
    var label = (el.textContent || '').trim().toLowerCase();
    if (['my account', 'log in', 'login', 'account', 'my creds'].indexOf(label) !== -1 || /log in\s*\/\s*my account/i.test(label)) {
      el.closest('a, button').remove();
    }
  });

  document.querySelectorAll('a[href], area[href]').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (/wa\.me\/|api\.whatsapp\.com/i.test(href)) {
      link.setAttribute('href', href.replace(/(?:wa\.me\/|phone=)(?:91)?9437519360/g, '13603601075'));
    }
    if (/t\.me\/(?:tryweewoo|weewoo)/i.test(href)) {
      link.setAttribute('href', href.replace(/t\.me\/(?:tryweewoo|weewoo)/i, 't.me/xtarnetdev'));
    }
  });

  document.querySelectorAll('.logo').forEach(function (logo) {
    logo.setAttribute('href', '/');
    logo.setAttribute('aria-label', 'SOFT MART home');
    logo.innerHTML = '<span>SOFT</span><svg class="logo-bolt" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4.5 14h6L10 22l9.5-12h-6L13 2z"></path></svg><span class="woo">MART</span>';
  });

  /* Replace the cloned WeeWoo brand artwork everywhere, including pages that
     still contain the original static favicon or install image markup. */
  var softMartIcon = '/images/softmart-icon.svg';
  document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="mask-icon"], meta[name="msapplication-TileImage"]').forEach(function (el) {
    if (el.tagName.toLowerCase() === 'meta') el.setAttribute('content', softMartIcon);
    else el.setAttribute('href', softMartIcon);
  });
  document.querySelectorAll('img[src*="weewoo"], img[data-src*="weewoo"], source[srcset*="weewoo"]').forEach(function (el) {
    if (el.hasAttribute('src')) el.setAttribute('src', softMartIcon);
    if (el.hasAttribute('data-src')) el.setAttribute('data-src', softMartIcon);
    if (el.hasAttribute('srcset')) el.setAttribute('srcset', softMartIcon);
    el.setAttribute('alt', 'SoftMart');
  });
  document.querySelectorAll('[src], [data-src], [data-lazy-src], [srcset], [data-srcset]').forEach(function (el) {
    ['src', 'data-src', 'data-lazy-src', 'srcset', 'data-srcset'].forEach(function (attribute) {
      var value = el.getAttribute(attribute);
      if (!value || !/(weewoo|cropped-4\.png)/i.test(value)) return;
      el.setAttribute(attribute, softMartIcon);
      if (el.tagName.toLowerCase() === 'img') el.setAttribute('alt', 'SoftMart');
    });
  });
  document.querySelectorAll('meta[property], meta[name]').forEach(function (meta) {
    var content = meta.getAttribute('content');
    if (!content) return;
    content = content.replace(/WeeWoo/gi, 'SoftMart');
    if (/weewoo-(og|app|icon|wm)/i.test(content)) content = softMartIcon;
    meta.setAttribute('content', content);
  });
  document.querySelectorAll('.nav-links a, .ww-mobile-ul a').forEach(function (link) {
    if (link.textContent.trim().toLowerCase() === 'home') link.href = '/';
  });

  /* Shared bottom navigation: present on every cloned page, mobile only. */
  if (!document.querySelector('.ww-dock')) {
    var dock = document.createElement('nav');
    dock.className = 'ww-dock';
    dock.setAttribute('aria-label', 'Primary mobile navigation');
    dock.innerHTML = '<div class="ww-dock-in">' +
      '<a class="ww-dk" href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11.3 12 4l8.5 7.3M5.6 9.8V19.5a.6.6 0 0 0 .6.6h11.6a.6.6 0 0 0 .6-.6V9.8"></path></svg><span>Home</span></a>' +
      '<a class="ww-dk" href="/shop/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.4 5.5 4.8h13L20 9.4M4 9.4h16M5.6 9.4V19.6a.6.6 0 0 0 .6.6h11.6a.6.6 0 0 0 .6-.6V9.4M10 20.2v-5.2h4v5.2"></path></svg><span>Shop</span></a>' +
      '</div>';
    document.body.appendChild(dock);
  }
  document.querySelectorAll('.ww-dock').forEach(function (dock) {
    Array.prototype.slice.call(dock.querySelectorAll('.ww-dk')).forEach(function (item, index) {
      if (index > 1) item.remove();
    });
  });

  /* Install card under Quick Links in the mobile drawer. */
  var quickLinks = Array.prototype.find.call(document.querySelectorAll('.ww-mobile-ul > li'), function (li) {
    return /quick links/i.test((li.textContent || '').trim());
  });
  if (quickLinks && !quickLinks.parentElement.querySelector('.ww-install-menu-item')) {
    var installItem = document.createElement('li');
    installItem.className = 'ww-install-menu-item';
    installItem.innerHTML = '<button type="button" class="ww-install-card"><span class="ww-install-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0-4-4m4 4 4-4M5 19h14"></path></svg></span><span class="ww-install-tx"><b>Install app</b><i>Add SoftMart to your home screen</i></span></button>';
    quickLinks.parentElement.insertBefore(installItem, quickLinks.nextSibling);
  }

  var installStyle = document.createElement('style');
  installStyle.textContent = '.ww-dock{display:none}.ww-install-card{font:inherit}.ww-install-card,.ww-dock-search{cursor:pointer}.ww-install-card{width:100%;display:flex;align-items:center;gap:12px;padding:9px 12px;border:1px solid #cfe2a4;border-radius:13px;background:#f3f9e8;color:#161a10;text-align:left}.ww-install-ic{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:#161a10;color:#c2f068;flex:0 0 28px}.ww-install-ic svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.ww-install-tx{display:block;min-width:0}.ww-install-card b{display:block;font-size:12px}.ww-install-card i{display:block;font-style:normal;font-size:10px;color:#6f7560;margin-top:2px}.ww-install-pop{position:fixed;left:50%;bottom:20px;z-index:1200;display:flex;align-items:center;gap:12px;width:min(430px,calc(100% - 32px));padding:12px 14px;transform:translate(-50%,140%);opacity:0;visibility:hidden;border:1px solid #d3e8aa;border-radius:16px;background:#fdfcf7;box-shadow:0 18px 50px -20px rgba(22,26,16,.45);transition:transform .3s ease,opacity .3s ease,visibility .3s ease}.ww-install-pop.is-open{transform:translate(-50%,0);opacity:1;visibility:visible}.ww-install-pop b{font-size:13px;display:block}.ww-install-pop span{font-size:11px;color:#606852;display:block;margin-top:2px}.ww-install-pop button{margin-left:auto;border:0;border-radius:999px;padding:10px 15px;background:#c2f068;color:#10130a;font-weight:800;cursor:pointer;white-space:nowrap}@media(max-width:900px){.ww-dock{position:fixed;left:0;right:0;bottom:0;z-index:940;display:block;padding:0 12px calc(env(safe-area-inset-bottom,0px) + 10px);pointer-events:none}.ww-dock-in{max-width:400px;margin:0 auto;display:flex;justify-content:space-around;gap:4px;padding:10px 8px 8px;border:1px solid #e6e1cd;border-radius:22px;background:rgba(253,252,247,.96);box-shadow:0 10px 35px -16px rgba(22,26,16,.4);pointer-events:auto}.ww-dk{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:none;color:#606852;text-decoration:none;font-size:10px;font-weight:600}.ww-dk svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.ww-dk:hover,.ww-dk:focus{color:#4f7a08}.ww-install-pop{bottom:92px}body{padding-bottom:88px!important}.ww-install-menu-item{list-style:none;border:0!important;padding:14px 0 4px!important}.ww-install-menu-item .ww-install-card{margin:0}.ww-install-card{display:flex!important}}@media(min-width:901px){.ww-install-menu-item{display:none}.ww-install-pop{bottom:20px}}';
  document.head.appendChild(installStyle);

  var installPop = document.createElement('div');
  installPop.className = 'ww-install-pop';
  installPop.innerHTML = '<div><b>Install SoftMart</b><span>Add SoftMart to your home screen</span></div><button type="button">Install</button>';
  document.body.appendChild(installPop);
  var deferredInstall;
  function openInstallPrompt() {
    if (deferredInstall) {
      deferredInstall.prompt();
      deferredInstall.userChoice.finally(function () { deferredInstall = null; installPop.classList.remove('is-open'); });
    } else installPop.classList.add('is-open');
  }
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferredInstall = event;
    if (window.matchMedia('(min-width:901px)').matches) setTimeout(function () { installPop.classList.add('is-open'); }, 1200);
  });
  document.querySelectorAll('.ww-install-card').forEach(function (button) { button.addEventListener('click', openInstallPrompt); });
  installPop.querySelector('button').addEventListener('click', openInstallPrompt);
  document.querySelectorAll('link[rel="manifest"]').forEach(function (link) {
    link.href = '/manifest.webmanifest';
  });
  if (!document.querySelector('link[rel="manifest"]')) {
    var manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.webmanifest';
    document.head.appendChild(manifest);
  }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js?v=no-page-cache-2', { updateViaCache: 'none' }).catch(function () {});

  var style = document.createElement('style');
  style.textContent = '.logo > span:first-child{color:#161a10!important;font-family:"Space Grotesk",sans-serif!important;font-weight:700!important;letter-spacing:-.045em!important}.logo{gap:4px!important}.footer .logo > span:first-child{color:#f6f4ea!important}';
  document.head.appendChild(style);
}());
