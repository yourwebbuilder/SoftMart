(function () {
  const root = document.getElementById('productDetail');
  document.querySelectorAll('.nav-links a').forEach(link => {
    if (link.textContent.trim().toLowerCase() === 'shop') link.href = 'shop/';
  });
  const catalogUrl = new URL('/alldigitalproductsinfo.json', location.origin).href;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const localUrl = value => { try { return new URL(value, catalogUrl).pathname + new URL(value, catalogUrl).search + new URL(value, catalogUrl).hash; } catch (e) { return String(value || '#'); } };
  const absoluteUrl = value => { try { return new URL(value, catalogUrl).href; } catch (e) { return String(value || ''); } };
  const slug = new URLSearchParams(location.search).get('slug') || location.pathname.split('/').filter(Boolean).pop();

  fetch(catalogUrl).then(response => response.ok ? response.json() : Promise.reject(new Error('catalog unavailable'))).then(products => {
    const product = products.find(item => item.slug === slug || String(item.originalUrl || '').includes('/' + slug + '/') || String(item.url || '').includes('slug=' + slug));
    if (!product) throw new Error('product not found');
    const image = absoluteUrl(product.image);
    const detailUrl = new URL('/products/?slug=' + encodeURIComponent(product.slug), location.origin).href;
    const planGroups = product.planGroups || [{ title: 'PLAN', options: (product.options || ['1 Month', '3 Months', '6 Months', '12 Months']).map(label => ({ label, price: product.price + '/mo' })) }];
    const firstPlan = planGroups[0]?.options?.[0] || { label: 'Plan', price: product.price };
    const purchaseLinks = (plan = firstPlan) => {
      const message = [
        'Hello SoftMart, I want to buy:',
        'Product: ' + product.name,
        'Plan: ' + plan.label,
        'Price: ' + plan.price,
        'Product link: ' + detailUrl,
        'Image: ' + image,
        'About: ' + product.description
      ].join('\n');
      return {
        whatsapp: 'https://wa.me/919743068739?text=' + encodeURIComponent(message),
        telegram: 'https://t.me/ArisuSoull?text=' + encodeURIComponent(message)
      };
    };
    const initialLinks = purchaseLinks(firstPlan);
    const planMarkup = planGroups.map(group => `<div class="ww-plan-group"><div class="ww-plan-heading">${esc(group.title)}</div><div class="ww-plan-grid">${(group.options || []).map((plan, index, all) => `<button type="button" class="ww-plan-option${plan === firstPlan ? ' is-selected' : ''}" data-plan="${esc(plan.label)}" data-price="${esc(plan.price)}"><span>${esc(plan.label)}</span><b>${esc(plan.price)}</b>${index === all.length - 1 ? '<i>BEST VALUE</i>' : ''}</button>`).join('')}</div></div>`).join('');
    const related = products.filter(item => item.slug !== product.slug && (item.collections || [item.category]).includes(product.category)).slice(0, 12).map(item => {
      const itemUrl = 'products/?slug=' + encodeURIComponent(item.slug || item.id || '');
      const itemImage = absoluteUrl(item.image);
      return `<div class="ww-related-item"><div class="product-card" data-id="${esc(item.id)}"><a class="product-media" href="${esc(itemUrl)}"><img src="${esc(itemImage)}" alt="${esc(item.name)}" loading="lazy" decoding="async" width="640" height="640"><span class="ww-instant-badge ww-badge-grid">⚡ INSTANT</span></a><div class="product-body"><a class="product-name" href="${esc(itemUrl)}">${esc(item.name)}</a><div class="product-price"><b>${esc(item.price)}</b><span>/mo</span>${item.oldPrice ? `<s>${esc(item.oldPrice)}</s>` : ''}</div><div class="product-actions"><a class="btn btn-dark" href="${esc(itemUrl)}">Buy now</a></div></div></div></div>`;
    }).join('');
    const relatedSection = related ? `<section class="ww-related"><div class="ww-related-head"><h2>You may also like</h2><div class="ww-related-nav"><button class="cat-arrow ww-scroll-arrow" data-dir="-1" aria-label="Scroll left"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"></path></svg></button><button class="cat-arrow ww-scroll-arrow" data-dir="1" aria-label="Scroll right"><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"></path></svg></button></div></div><div class="ww-related-scroll">${related}</div></section>` : '';
    document.title = product.name + ' | SoftMart';
    root.innerHTML = `<div class="ww-container"><div class="ww-single-product product type-product"><div class="ww-single-top"><div class="ww-single-media"><img src="${esc(image)}" alt="${esc(product.name)}"><span class="ww-instant-badge ww-badge-single">⚡ INSTANT</span></div><div class="summary entry-summary ww-single-summary"><div class="entry-product-badges product-badges product-badges-label"></div><div class="product-title-wrap"><h1 class="product_title entry-title"><span>${esc(product.name)}</span></h1></div><div class="entry-price-wrap"><div class="price"><ins><span class="woocommerce-Price-amount amount"><bdi>₹${esc(product.price).replace('₹','')}</bdi></span></ins>${product.oldPrice ? ` <del><span class="woocommerce-Price-amount amount"><bdi>₹${esc(product.oldPrice).replace('₹','')}</bdi></span></del>` : ''}</div></div><div class="variations_form cart">${planMarkup}<div class="single_variation_wrap"><div class="woocommerce-variation-add-to-cart variation-add-to-cart-enabled"><div class="entry-product-quantity-wrapper"><div class="quantity"><input type="number" class="qty" value="1" min="1" max="1" aria-label="Quantity"></div></div><div class="product-detail-actions"><a class="single_add_to_cart_button button" href="${esc(initialLinks.whatsapp)}" target="_blank" rel="noopener">Buy on WhatsApp</a><a class="buy-now-button button" href="${esc(initialLinks.telegram)}" target="_blank" rel="noopener">Buy via Telegram</a></div></div></div></div><div class="ww-delivery-box"><div class="ww-delivery-icon-wrap">⚡</div><div><strong>Delivered instantly on WhatsApp</strong><p>${esc(product.delivery)}</p></div></div><p class="woocommerce-product-details__short-description">${esc(product.description)}</p></div></div><section class="ww-single-desc"><h2>Description</h2><div class="ww-single-desc-body"><h3>What’s included</h3><p>${esc(product.includes)}</p></div></section><section class="ww-single-attrs"><h2>Good to know</h2><div class="ww-single-desc-body"><p>${esc(product.goodToKnow || product.support)}</p></div></section>${relatedSection}</div></div><div class="ww-sticky-buy on"><span class="ww-sticky-cart" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6 7h13l-1.5 9h-10L5 3H2"></path><circle cx="9" cy="21" r="1.6"></circle><circle cx="16" cy="21" r="1.6"></circle></svg></span><span class="ww-sticky-price">${esc(firstPlan.price)}</span><a class="btn" href="${esc(initialLinks.whatsapp)}" target="_blank" rel="noopener">Buy Now&nbsp; ⚡</a></div>`;
    const priceWrap = root.querySelector('.entry-price-wrap');
    if (priceWrap) {
      const shareButton = document.createElement('button');
      shareButton.type = 'button';
      shareButton.className = 'ww-share-product';
      shareButton.setAttribute('aria-label', 'Share ' + product.name);
      shareButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6"></path></svg><span>Share</span>';
      shareButton.addEventListener('click', async () => {
        const shareData = { title: product.name + ' | SoftMart', text: product.name + ' on SoftMart', url: detailUrl };
        try {
          if (navigator.share) await navigator.share(shareData);
          else { await navigator.clipboard.writeText(detailUrl); if (typeof showToast === 'function') showToast('Product link copied'); }
        } catch (error) {
          if (error.name !== 'AbortError') { try { await navigator.clipboard.writeText(detailUrl); } catch (e) {} if (typeof showToast === 'function') showToast('Product link copied'); }
        }
      });
      priceWrap.appendChild(shareButton);
    }
    const inPageBuyBar = root.querySelector('.ww-sticky-buy');
    if (inPageBuyBar) {
      const cartIcon = inPageBuyBar.querySelector('.ww-sticky-cart');
      if (cartIcon) {
        const cartButton = document.createElement('button');
        cartButton.type = 'button';
        cartButton.className = 'ww-sticky-cart btn-cart';
        cartButton.dataset.addId = product.addId || product.id || '';
        cartButton.dataset.varId = product.variationId || '';
        cartButton.setAttribute('aria-label', 'Add ' + product.name + ' to cart');
        cartButton.innerHTML = cartIcon.innerHTML;
        cartIcon.replaceWith(cartButton);
        const cartKey = String(product.addId || product.id) + ':' + String(product.variationId || '0');
        const syncCartState = () => {
          try {
            const items = JSON.parse(localStorage.getItem('softmart_cart') || '[]');
            cartButton.classList.toggle('added', items.some(item => item.key === cartKey));
          } catch (e) {}
        };
        syncCartState();
        cartButton.addEventListener('click', () => setTimeout(syncCartState, 80));
        window.addEventListener('storage', syncCartState);
      }
      const whatsappButton = inPageBuyBar.querySelector('.btn');
      whatsappButton.textContent = 'WhatsApp';
      whatsappButton.classList.add('ww-sticky-whatsapp');
      const telegramButton = document.createElement('a');
      telegramButton.className = 'btn ww-sticky-telegram';
      telegramButton.href = initialLinks.telegram;
      telegramButton.target = '_blank';
      telegramButton.rel = 'noopener';
      telegramButton.textContent = 'Telegram';
      inPageBuyBar.appendChild(telegramButton);
      const deliveryBox = root.querySelector('.ww-delivery-box');
      if (deliveryBox) deliveryBox.parentNode.insertBefore(inPageBuyBar, deliveryBox);
    }
    root.querySelectorAll('.ww-plan-option').forEach(button => button.addEventListener('click', () => {
      root.querySelectorAll('.ww-plan-option').forEach(option => option.classList.remove('is-selected'));
      button.classList.add('is-selected');
      const links = purchaseLinks({ label: button.dataset.plan, price: button.dataset.price });
      root.querySelector('.single_add_to_cart_button').href = links.whatsapp;
      root.querySelector('.buy-now-button').href = links.telegram;
      root.querySelector('.ww-sticky-buy .btn').href = links.whatsapp;
      root.querySelector('.ww-sticky-telegram').href = links.telegram;
      root.querySelector('.ww-sticky-price').textContent = button.dataset.price;
    }));
    root.querySelectorAll('.ww-scroll-arrow').forEach(button => button.addEventListener('click', () => {
      const scroller = root.querySelector('.ww-related-scroll');
      if (scroller) scroller.scrollBy({ left: Number(button.dataset.dir || 1) * Math.max(240, scroller.clientWidth * .8), behavior: 'smooth' });
    }));
  }).catch(() => {
    root.innerHTML = '<div class="container"><div class="product-detail-error"><h1>Product not found</h1><p>This product is unavailable or the catalog file could not be loaded.</p><a class="btn btn-dark" href="shop/">Return to shop</a></div></div>';
  });
})();
