/* Página inicial: apresentação, carrossel de destaques e cartão de contato. */
(function () {
  'use strict';
  const { icon, esc, safeUrl, linkAttrs, loadJSON, byYearDesc, t, tr } = App;
  const MAX_SLIDES = 6;

  App.page = async function (site) {
    renderIntro(site);
    renderContact(site);

    const carousel = document.getElementById('showcase-carousel');
    try {
      const [pubs, courses] = await Promise.all([loadJSON('publicacoes'), loadJSON('cursos')]);
      renderCarousel(carousel, pickHighlights(pubs, courses));
    } catch (err) {
      App.showError(carousel, err);
    }
  };

  function renderIntro(site) {
    document.getElementById('hero-role').textContent = t(site.role) || '';
    document.getElementById('hero-bio').innerHTML = (t(site.bio) || []).map((p) => `<p>${esc(p)}</p>`).join('');

    if (site.photo) {
      document.getElementById('hero-photo').innerHTML =
        `<img src="${esc(site.photo)}" alt="${esc(tr('home.photoAlt', { name: site.name }))}">`;
    }

    const links = (site.links || []).map((l) => {
      const url = safeUrl(l.url);
      return url ? `<li><a href="${esc(url)}"${linkAttrs(url)}>${esc(t(l.label))}${icon('external')}</a></li>` : '';
    }).join('');
    document.getElementById('hero-links').innerHTML = links
      ? `<li class="link-row__label">${esc(tr('home.seeAlso'))}</li>${links}` : '';
  }

  // Itens com "featured": true têm prioridade; o restante completa por ano (mais recentes primeiro)
  function pickHighlights(pubs, courses) {
    const items = [
      ...pubs.map((p) => ({
        kind: 'artigo',
        label: App.typeLabel(p.type),
        year: p.year,
        featured: !!p.featured,
        title: t(p.title),
        text: t(p.abstract),
        href: `publicacoes.html#${encodeURIComponent(p.id)}`,
        cta: tr('home.readAbstract'),
      })),
      ...courses.map((c) => ({
        kind: 'curso',
        label: tr('home.course'),
        year: c.year,
        featured: !!c.featured,
        title: t(c.title),
        text: t(c.summary),
        meta: t(c.institution),
        href: `curso.html?id=${encodeURIComponent(c.id)}`,
        cta: tr('home.viewCourse'),
      })),
    ];
    items.sort((a, b) => (b.featured - a.featured) || byYearDesc(a, b));
    return items.slice(0, MAX_SLIDES);
  }

  function renderCarousel(root, items) {
    if (!items.length) {
      root.innerHTML = `<div class="feature-card"><p>${esc(tr('carousel.soon'))}</p></div>`;
      return;
    }
    const slides = items.map((it, i) => `
      <li class="carousel__slide" id="slide-${i}" role="group" aria-roledescription="${esc(tr('carousel.slide'))}" aria-label="${esc(tr('carousel.pos', { n: i + 1, total: items.length }))}">
        <article class="feature-card">
          <div class="feature-card__meta">
            <span class="pill ${it.kind === 'curso' ? 'pill--wine' : ''}">${esc(it.label)}</span>
            <span>${esc([it.meta, it.year].filter(Boolean).join(' · '))}</span>
          </div>
          <h3 class="feature-card__title">${esc(it.title)}</h3>
          <p class="feature-card__text">${esc(it.text)}</p>
          <a class="arrow-link" href="${esc(it.href)}">${esc(it.cta)} ${icon('arrowRight')}</a>
        </article>
      </li>`).join('');

    const dots = items.map((_, i) =>
      `<button class="carousel__dot" type="button" aria-label="${esc(tr('carousel.goto', { n: i + 1 }))}" aria-controls="slide-${i}"></button>`
    ).join('');

    root.innerHTML = `
      <div class="carousel__viewport">
        <button class="carousel__btn" type="button" data-dir="-1" aria-label="${esc(tr('carousel.prev'))}">${icon('chevronLeft')}</button>
        <ul class="carousel__track" tabindex="0" aria-label="${esc(tr('carousel.track'))}">${slides}</ul>
        <button class="carousel__btn" type="button" data-dir="1" aria-label="${esc(tr('carousel.next'))}">${icon('chevronRight')}</button>
      </div>
      <div class="carousel__dots">${dots}</div>`;

    const track = root.querySelector('.carousel__track');
    const [prev, next] = root.querySelectorAll('.carousel__btn');
    const dotEls = [...root.querySelectorAll('.carousel__dot')];
    // passo entre slides = largura + gap
    const step = () => (track.children[1]?.offsetLeft ?? track.clientWidth) - track.children[0].offsetLeft || track.clientWidth;
    const index = () => Math.round(track.scrollLeft / step());
    const goTo = (i) => track.scrollTo({ left: Math.max(0, Math.min(items.length - 1, i)) * step() });

    const update = () => {
      const i = index();
      dotEls.forEach((d, j) => d.setAttribute('aria-current', String(i === j)));
      prev.disabled = i <= 0;
      next.disabled = i >= items.length - 1;
    };

    prev.addEventListener('click', () => goTo(index() - 1));
    next.addEventListener('click', () => goTo(index() + 1));
    dotEls.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index() - 1); }
    });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => goTo(index()));
    update();
  }

  function renderContact(site) {
    const wrap = document.getElementById('contact-wrap');
    const email = (site.contact || []).find((c) => c.type === 'email');
    wrap.innerHTML = `
      ${App.renderBizcard(site)}
      ${email ? `
        <p class="contact__hint">
          <span>${esc(tr('contact.hint'))} <strong>${esc(t(email.label))}</strong></span>
          <button class="btn btn--outline btn--sm" type="button" id="copy-email">${icon('copy')}<span>${esc(tr('contact.copy'))}</span></button>
        </p>` : ''}`;
    App.enableTilt(wrap);

    const btn = document.getElementById('copy-email');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(t(email.label));
        btn.innerHTML = `${icon('check')}<span>${esc(tr('contact.copied'))}</span>`;
      } catch {
        location.href = safeUrl(email.url);
        return;
      }
      setTimeout(() => { btn.innerHTML = `${icon('copy')}<span>${esc(tr('contact.copy'))}</span>`; }, 2000);
    });
  }
})();
