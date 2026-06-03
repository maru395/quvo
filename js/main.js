'use strict';

/* ── DOM HELPERS ─────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── CART STATE ──────────────────────────────────────────── */
const cart = {
  items: [],

  add(id, name, price) {
    const existing = this.items.find(i => i.id === id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ id, name, price: Number(price), qty: 1 });
    }
    this.save();
    cartUI.render();
    cartUI.open();
    updateCartCount();
  },

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
    cartUI.render();
    updateCartCount();
  },

  changeQty(id, delta) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.remove(id);
      return;
    }
    this.save();
    cartUI.render();
    updateCartCount();
  },

  get total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  get count() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  save() {
    try {
      sessionStorage.setItem('quvocafe_cart', JSON.stringify(this.items));
    } catch (_) {}
  },

  load() {
    try {
      const raw = sessionStorage.getItem('quvocafe_cart');
      if (raw) this.items = JSON.parse(raw);
    } catch (_) {}
  }
};

/* ── CART UI ─────────────────────────────────────────────── */
const cartUI = {
  drawer:  null,
  overlay: null,
  itemsEl: null,
  footerEl: null,
  totalEl:  null,

  init() {
    this.drawer   = $('#cartDrawer');
    this.overlay  = $('#cartOverlay');
    this.itemsEl  = $('#cartItems');
    this.footerEl = $('#cartFooter');
    this.totalEl  = $('#cartTotal');

    // Delegate cart item interactions once — on the container, not re-bound each render
    if (this.itemsEl) {
      this.itemsEl.addEventListener('click', e => {
        const target = e.target;
        const id = target.dataset.id;
        if (!id) return;

        if (target.classList.contains('cart-remove')) {
          cart.remove(id);
        } else if (target.dataset.action === 'inc') {
          cart.changeQty(id, 1);
        } else if (target.dataset.action === 'dec') {
          cart.changeQty(id, -1);
        }
      });
    }
  },

  open() {
    this.drawer?.classList.add('open');
    this.overlay?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.drawer?.classList.remove('open');
    this.overlay?.classList.remove('visible');
    document.body.style.overflow = '';
  },

  render() {
    if (!this.itemsEl) return;

    if (cart.items.length === 0) {
      this.itemsEl.innerHTML = '<p class="cart-empty">Your cart is currently empty.</p>';
      if (this.footerEl) this.footerEl.style.display = 'none';
      return;
    }

    if (this.footerEl) this.footerEl.style.display = 'block';
    if (this.totalEl) this.totalEl.textContent = formatPrice(cart.total);

    this.itemsEl.innerHTML = cart.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-thumb">☕</div>
        <div class="cart-item-info">
          <p class="cart-item-name">${escHtml(item.name)}</p>
          <div class="cart-item-row">
            <div class="cart-item-qty">
              <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <span class="cart-item-price">${formatPrice(item.price * item.qty)}</span>
          </div>
          <button class="cart-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `).join('');
  }
};

/* ── UTILITIES ───────────────────────────────────────────── */
function formatPrice(n) {
  return '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

function escHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}

function updateCartCount() {
  const countEl = $('#cartCount');
  if (!countEl) return;
  const n = cart.count;
  countEl.textContent = n;
  if (n > 0) {
    countEl.classList.add('visible');
  } else {
    countEl.classList.remove('visible');
  }
}

/* ── STICKY NAV ──────────────────────────────────────────── */
function initStickyNav() {
  const header = $('#site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ── MOBILE DRAWER ───────────────────────────────────────── */
function initMobileDrawer() {
  const hamburger   = $('#hamburger');
  const drawer      = $('#mobileDrawer');
  const overlay     = $('#mobileOverlay');
  const drawerClose = $('#drawerClose');

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay?.classList.add('visible');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay?.classList.remove('visible');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // Sub-menu toggles
  $$('.mobile-sub-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.nextElementSibling;
      sub?.classList.toggle('open');
      const chevron = btn.querySelector('span');
      if (chevron) chevron.textContent = sub?.classList.contains('open') ? '▴' : '▾';
    });
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });
}

/* ── CART DRAWER ─────────────────────────────────────────── */
function initCartDrawer() {
  const cartBtn   = $('#cartBtn');
  const cartClose = $('#cartClose');

  cartBtn?.addEventListener('click', () => {
    if (cartUI.drawer?.classList.contains('open')) {
      cartUI.close();
    } else {
      cartUI.open();
    }
  });

  cartClose?.addEventListener('click', () => cartUI.close());
  cartUI.overlay?.addEventListener('click', () => cartUI.close());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cartUI.close();
  });
}

/* ── ADD TO CART BUTTONS ─────────────────────────────────── */
function initAddToCart() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn--add-cart');
    if (!btn) return;

    const { id, name, price } = btn.dataset;
    if (!id) return;

    // Micro-feedback: flash button
    const originalText = btn.textContent;
    btn.textContent = '✓ Added!';
    btn.style.background = '#2e7d32';
    btn.style.borderColor = '#2e7d32';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.disabled = false;
    }, 1400);

    cart.add(id, name, price);
  });
}

/* ── NEWSLETTER FORM ─────────────────────────────────────── */
function initNewsletterForm() {
  const form = $('#newsletterForm');
  const msg  = $('#newsletterMsg');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input?.value) return;

    if (msg) {
      msg.textContent = '🎉 Thank you for subscribing!';
    }
    input.value = '';
    setTimeout(() => { if (msg) msg.textContent = ''; }, 5000);
  });
}

/* ── SUBSCRIBE MODAL ─────────────────────────────────────── */
function initSubscribeModal() {
  const overlay    = $('#subscribeOverlay');
  const modalClose = $('#modalClose');
  const modalSkip  = $('#modalSkip');
  const modalForm  = $('#modalForm');
  const modalSuccess = $('#modalSuccess');

  if (!overlay) return;

  // Show after 4 seconds (first visit only)
  const dismissed = sessionStorage.getItem('quvo_modal_dismissed');
  if (!dismissed) {
    setTimeout(() => {
      overlay.classList.add('visible');
    }, 4000);
  }

  function closeModal() {
    overlay.classList.remove('visible');
    sessionStorage.setItem('quvo_modal_dismissed', '1');
  }

  modalClose?.addEventListener('click', closeModal);
  modalSkip?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  modalForm?.addEventListener('submit', e => {
    e.preventDefault();
    const input = modalForm.querySelector('input[type="email"]');
    if (!input?.value) return;
    if (modalSuccess) {
      modalSuccess.textContent = '🎉 Subscribed! Check your inbox for your 10% discount.';
    }
    input.value = '';
    setTimeout(closeModal, 2500);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ── SCROLL ANIMATIONS ───────────────────────────────────── */
function initScrollAnimations() {
  const elements = $$('.categories-section, .products-section, .story-section, .partners-section, .partner-card, .cat-card, .pillar');
  elements.forEach(el => el.classList.add('fade-up'));

  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ── SMOOTH ANCHOR SCROLL ────────────────────────────────── */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ── IMAGE ERROR FALLBACK ────────────────────────────────── */
function initImageFallbacks() {
  $$('img').forEach(img => {
    img.addEventListener('error', function() {
      const wrap = this.closest('.cat-card__img-wrap, .product-card__img-wrap, .story-img-frame');
      if (wrap) {
        this.style.display = 'none';
        if (!wrap.querySelector('.img-placeholder')) {
          wrap.style.background = 'linear-gradient(145deg, #f0e8db, #d4b896)';
          wrap.style.display = 'flex';
          wrap.style.alignItems = 'center';
          wrap.style.justifyContent = 'center';
          const icon = document.createElement('span');
          icon.textContent = '☕';
          icon.style.fontSize = '2.5rem';
          wrap.appendChild(icon);
        }
      }
    }, { once: true });
  });
}

/* ── ACTIVE NAV LINK ─────────────────────────────────────── */
function initActiveNav() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';
  $$('.nav-link, .mobile-nav-list a').forEach(link => {
    const href = link.getAttribute('href') || '';
    // Normalize: treat '' or '/' as 'index.html'
    const linkFile = href.split('/').pop() || 'index.html';
    if (linkFile === filename || (filename === '' && linkFile === 'index.html')) {
      link.style.color = 'var(--color-primary)';
      link.style.background = 'var(--color-cream)';
    }
  });
}

/* ── HERO VIDEO FALLBACK ─────────────────────────────────── */
function initHeroVideoFallback() {
  const video = document.querySelector('.hero-video');
  if (!video) return;
  video.addEventListener('error', () => {
    video.style.display = 'none';
  });
}

/* ── BOOTSTRAP ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  cart.load();
  cartUI.init();   // initialise refs & attach delegated listener once
  updateCartCount();
  cartUI.render();

  initStickyNav();
  initMobileDrawer();
  initCartDrawer();
  initAddToCart();
  initNewsletterForm();
  initSubscribeModal();
  initScrollAnimations();
  initSmoothScroll();
  initImageFallbacks();
  initActiveNav();
  initHeroVideoFallback();
  initCatCarousel();

  // Announce bar close (double-click to dismiss)
  const bar = document.querySelector('.announcement-bar');
  if (bar) {
    bar.addEventListener('dblclick', () => {
      bar.style.display = 'none';
    });
  }
});

/* ── CATEGORY AUTO-CAROUSEL ──────────────────────────────── */
function initCatCarousel() {
  const viewport = document.getElementById('productsCarousel');
  const track    = document.getElementById('productsTrack');
  if (!track || !viewport) return;

  const SPEED       = 0.6;
  const SLIDE_COUNT = 6; // number of REAL cards only
  let pos           = 0;
  let rafId         = null;
  let dragStartX    = null;
  let dragStartPos  = 0;
  let dragging      = false;

  function getSlideWidth() {
    const slide = track.querySelector('.carousel-slide');
    if (!slide) return 0;
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    return slide.offsetWidth + gap;
  }

  function realWidth() {
    return getSlideWidth() * SLIDE_COUNT;
  }

  function tick() {
    if (!dragging) {
      pos += SPEED;
      if (pos >= realWidth()) {
        pos -= realWidth();
      }
      track.style.transform = `translateX(-${pos}px)`;
    }
    rafId = requestAnimationFrame(tick);
  }

  // Mouse drag
  viewport.addEventListener('mousedown', e => {
    dragging     = true;
    dragStartX   = e.clientX;
    dragStartPos = pos;
    viewport.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', e => {
    if (!dragging || dragStartX === null) return;
    pos = dragStartPos + (dragStartX - e.clientX);
    if (pos < 0) pos += realWidth();
    if (pos >= realWidth()) pos -= realWidth();
    track.style.transform = `translateX(-${pos}px)`;
  });
  window.addEventListener('mouseup', () => {
    dragging = false;
    dragStartX = null;
    viewport.style.cursor = 'grab';
  });

  // Touch
  viewport.addEventListener('touchstart', e => {
    dragStartX   = e.touches[0].clientX;
    dragStartPos = pos;
  }, { passive: true });
  viewport.addEventListener('touchmove', e => {
    if (dragStartX === null) return;
    pos = dragStartPos + (dragStartX - e.touches[0].clientX);
    if (pos < 0) pos += realWidth();
    if (pos >= realWidth()) pos -= realWidth();
    track.style.transform = `translateX(-${pos}px)`;
  }, { passive: true });
  viewport.addEventListener('touchend', () => { dragStartX = null; });

  // Pause when tab is hidden — resume when visible again
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(tick);
    }
  });

  rafId = requestAnimationFrame(tick);
}

/* ── CAREERS APPLY FORM ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('applyForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const s = document.getElementById('applySuccess');
    if (s) {
      s.textContent = '✅ Application received! We\'ll be in touch soon.';
      e.target.reset();
      setTimeout(() => { s.textContent = ''; }, 6000);
    }
  });
});
