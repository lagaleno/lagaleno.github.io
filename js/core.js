/* Núcleo compartilhado: idioma, dados, header/footer, ícones e utilitários.
   Cada página registra sua função em App.page e ela é chamada com o site.json carregado. */
(function () {
  'use strict';

  /* ---------- Idioma ---------- */
  const LANGS = ['pt', 'en'];
  const LANG_KEY = 'lang';

  function detectLang() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(fromUrl)) {
      try { localStorage.setItem(LANG_KEY, fromUrl); } catch {}
      return fromUrl;
    }
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (LANGS.includes(saved)) return saved;
    } catch {}
    return (navigator.language || '').toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }
  const lang = detectLang();
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  function setLang(next) {
    if (next === lang || !LANGS.includes(next)) return;
    try { localStorage.setItem(LANG_KEY, next); } catch {}
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    location.replace(url);
  }

  // Texto da interface (js/i18n.js), com {variáveis}
  function tr(key, vars = {}) {
    const str = window.I18N?.[lang]?.[key] ?? window.I18N?.pt?.[key] ?? key;
    return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }

  // Campo de conteúdo: string simples ou { "pt": ..., "en": ... }
  function t(value) {
    if (value && typeof value === 'object' && !Array.isArray(value) && ('pt' in value || 'en' in value)) {
      return value[lang] ?? value.pt ?? value.en;
    }
    return value;
  }

  // Tipo de publicação: chave conhecida (article, chapter...) vira rótulo traduzido; outro texto é usado como está
  function typeLabel(type) {
    const value = t(type);
    const key = `type.${value}`;
    const label = tr(key);
    return label === key ? value : label;
  }

  // Aplica traduções em elementos estáticos: data-i18n="chave" e data-i18n-attr="atributo:chave"
  function applyStatic(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = tr(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      el.dataset.i18nAttr.split(',').forEach((pair) => {
        const [attr, key] = pair.split(':').map((s) => s.trim());
        el.setAttribute(attr, tr(key));
      });
    });
  }

  const NAV = [
    { id: 'home', key: 'nav.home', href: 'index.html' },
    { id: 'publicacoes', key: 'nav.pubs', href: 'publicacoes.html' },
    { id: 'cursos', key: 'nav.courses', href: 'cursos.html' },
    { id: 'curriculo', key: 'nav.cv', href: 'curriculo.html' },
    { id: 'contato', key: 'nav.contact', href: 'index.html#contato' },
  ];

  // Ícones em traço (paths derivados do Lucide, licença ISC)
  const ICON_PATHS = {
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    email: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    telegram: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    website: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    external: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    copy: '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    pdf: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
    slides: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
    video: '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4Z"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  };

  function icon(name, cls = '') {
    const d = ICON_PATHS[name] || ICON_PATHS.link;
    return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }

  function esc(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Aceita apenas http(s), mailto, tel e caminhos relativos
  function safeUrl(url) {
    const u = String(t(url) ?? '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u) || !/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
    return '';
  }

  function isExternal(url) { return /^https?:/i.test(url) && !url.includes(location.host); }
  function linkAttrs(url) {
    return isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
  }

  function normalize(text) {
    return String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  const cache = {};
  function loadJSON(name) {
    cache[name] ??= fetch(`data/${name}.json`, { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`${name}.json: HTTP ${r.status}`);
      return r.json();
    });
    return cache[name];
  }

  const byYearDesc = (a, b) => (b.year || 0) - (a.year || 0);

  /* ---------- Header ---------- */
  function renderHeader(page) {
    const el = document.getElementById('site-header');
    if (!el) return;
    const items = NAV.map((n) => {
      const current = n.id === page ? ' aria-current="page"' : '';
      return `<li><a class="nav__link" href="${n.href}"${current}>${esc(tr(n.key))}</a></li>`;
    }).join('');
    const langs = LANGS.map((l) =>
      `<button class="lang-switch__btn" type="button" lang="${l === 'pt' ? 'pt-BR' : 'en'}" data-lang="${l}" aria-pressed="${l === lang}">${l.toUpperCase()}</button>`
    ).join('');

    el.innerHTML = `
      <div class="container site-header__inner">
        <a class="brand" href="index.html" aria-label="${esc(tr('nav.brand'))}">
          <img src="assets/img/brand/logo.svg" alt="" width="28" height="40">
          <span class="brand__name">Larissa Galeno</span>
        </a>
        <nav class="nav" aria-label="${esc(tr('nav.main'))}">
          <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-list" aria-label="${esc(tr('nav.open'))}">
            ${icon('menu', 'icon-menu')}${icon('close', 'icon-close')}
          </button>
          <ul class="nav__list" id="nav-list">
            ${items}
            <li class="nav__lang">
              <div class="lang-switch" role="group" aria-label="${esc(tr('nav.lang'))}">${langs}</div>
            </li>
          </ul>
        </nav>
      </div>`;

    const nav = el.querySelector('.nav');
    const toggle = el.querySelector('.nav__toggle');
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', tr(open ? 'nav.close' : 'nav.open'));
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    el.querySelectorAll('.nav__link').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    el.querySelectorAll('.lang-switch__btn').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    const onScroll = () => el.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Footer ---------- */
  function renderFooter(site) {
    const el = document.getElementById('site-footer');
    if (!el) return;
    const nav = NAV.map((n) => `<li><a href="${n.href}">${esc(tr(n.key))}</a></li>`).join('');
    const credits = (site?.credits || []).map((c) => {
      const url = safeUrl(c.url);
      const name = url ? `<a href="${esc(url)}"${linkAttrs(url)}>${esc(t(c.name))}</a>` : `<strong>${esc(t(c.name))}</strong>`;
      return `<li>${esc(t(c.label))}: ${name}</li>`;
    }).join('');

    el.innerHTML = `
      <div class="container site-footer__inner">
        <div class="site-footer__brand">
          <img src="assets/img/brand/logo-mono.svg" alt="" width="30" height="44">
          <ul class="site-footer__nav">${nav}</ul>
        </div>
        <ul class="site-footer__credits">${credits}</ul>
      </div>`;
  }

  /* ---------- Cartão de contato ---------- */
  function renderBizcard(site) {
    const items = (site.contact || []).map((c) => {
      const url = safeUrl(c.url);
      const inner = `<span>${esc(t(c.label))}</span>${icon(c.type)}`;
      return `<li>${url ? `<a href="${esc(url)}"${linkAttrs(url)}>${inner}</a>` : `<a>${inner}</a>`}</li>`;
    }).join('');
    return `
      <div class="bizcard" data-tilt>
        <div class="bizcard__art" aria-hidden="true"><div class="pattern"></div></div>
        <div class="bizcard__body">
          <div class="bizcard__wordmark" role="img" aria-label="${esc(site.name)}"></div>
          <ul class="bizcard__list">${items}</ul>
          <img class="bizcard__logo" src="assets/img/brand/logo-white.svg" alt="" width="36" height="52">
        </div>
      </div>`;
  }

  // Leve inclinação 3D do cartão acompanhando o ponteiro
  function enableTilt(root = document) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    root.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', `${x * 10}deg`);
        card.style.setProperty('--rx', `${-y * 10}deg`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });
  }

  /* ---------- Revelar ao rolar ---------- */
  let revealObserver;
  function observeReveal(root = document) {
    const els = root.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-visible')); return; }
    revealObserver ??= new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((e) => revealObserver.observe(e));
  }

  function showError(target, err) {
    console.error(err);
    const local = location.protocol === 'file:';
    target.innerHTML = `
      <div class="notice">
        <strong>${tr('error.title')}</strong><br>
        ${tr(local ? 'error.local' : 'error.retry')}
      </div>`;
  }

  const App = {
    page: null,
    lang, tr, t, typeLabel,
    icon, esc, safeUrl, linkAttrs, normalize, loadJSON, byYearDesc,
    renderBizcard, enableTilt, observeReveal, showError,
  };
  window.App = App;

  document.addEventListener('DOMContentLoaded', async () => {
    const page = document.body.dataset.page;
    applyStatic();
    renderHeader(page);
    try {
      const site = await loadJSON('site');
      renderFooter(site);
      if (App.page) await App.page(site);
    } catch (err) {
      renderFooter(null);
      showError(document.getElementById('main') || document.body, err);
    }
    observeReveal();

    // O conteúdo é renderizado depois do carregamento: refaz a rolagem para a âncora da URL
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
      target.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'));
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });
})();
