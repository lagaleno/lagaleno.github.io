/* Listagem de publicações com busca e filtros por tipo e ano. */
(function () {
  'use strict';
  const { icon, esc, safeUrl, linkAttrs, normalize, loadJSON, byYearDesc, t, tr, typeLabel } = App;

  App.page = async function (site) {
    const cfg = site.pages?.publicacoes || {};
    if (cfg.eyebrow) document.getElementById('page-eyebrow').textContent = t(cfg.eyebrow);
    document.getElementById('page-intro').textContent = t(cfg.intro) || '';

    const list = document.getElementById('pub-list');
    let pubs;
    try {
      pubs = (await loadJSON('publicacoes')).slice().sort(byYearDesc);
    } catch (err) {
      App.showError(list, err);
      return;
    }

    const state = { q: '', type: '', year: '' };
    const search = document.getElementById('pub-search');
    const yearSel = document.getElementById('pub-year');
    const typesEl = document.getElementById('pub-types');
    const count = document.getElementById('pub-count');

    // Filtros gerados a partir dos próprios dados
    const types = [...new Set(pubs.map((p) => t(p.type)).filter(Boolean))];
    if (types.length > 1) {
      typesEl.innerHTML = ['', ...types].map((type) =>
        `<button class="chip" type="button" data-type="${esc(type)}" aria-pressed="${type === ''}">${esc(type ? typeLabel(type) : tr('pubs.all'))}</button>`
      ).join('');
      typesEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        state.type = btn.dataset.type;
        typesEl.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
        render();
      });
    }
    const years = [...new Set(pubs.map((p) => p.year).filter(Boolean))];
    yearSel.insertAdjacentHTML('beforeend', years.map((y) => `<option value="${esc(y)}">${esc(y)}</option>`).join(''));
    if (years.length < 2) yearSel.parentElement.hidden = true;

    search.addEventListener('input', () => { state.q = normalize(search.value.trim()); render(); });
    yearSel.addEventListener('change', () => { state.year = yearSel.value; render(); });

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('.pub__toggle');
      if (!btn) return;
      const card = btn.closest('.pub');
      const expanded = card.classList.toggle('is-expanded');
      btn.setAttribute('aria-expanded', String(expanded));
      btn.textContent = tr(expanded ? 'pubs.readLess' : 'pubs.readMore');
    });

    function matches(p) {
      if (state.type && t(p.type) !== state.type) return false;
      if (state.year && String(p.year) !== state.year) return false;
      if (!state.q) return true;
      const hay = normalize([t(p.title), t(p.venue), t(p.abstract), ...(p.authors || []), ...(t(p.keywords) || [])].join(' '));
      return state.q.split(/\s+/).every((term) => hay.includes(term));
    }

    function render() {
      const shown = pubs.filter(matches);
      count.textContent = tr(shown.length === 1 ? 'pubs.one' : 'pubs.many', { n: shown.length });
      list.innerHTML = shown.length
        ? shown.map((p) => card(p, site.name)).join('')
        : `<li class="empty-state">${esc(tr('pubs.empty'))}</li>`;
      markClampedAbstracts();
    }

    render();
    document.fonts?.ready.then(markClampedAbstracts);
    focusHash();
    window.addEventListener('hashchange', focusHash);
  };

  function card(p, ownerName) {
    const id = esc(p.id);
    const authors = (p.authors || []).map((a) =>
      normalize(a) === normalize(ownerName) ? `<strong>${esc(a)}</strong>` : esc(a)
    ).join(', ');

    const doi = t(p.doi);
    const links = [
      { url: safeUrl(p.url), label: tr('pubs.access'), icon: 'external', primary: true },
      { url: safeUrl(p.pdf), label: 'PDF', icon: 'pdf' },
      { url: doi ? safeUrl(/^https?:/.test(doi) ? doi : `https://doi.org/${doi}`) : '', label: 'DOI', icon: 'link' },
    ].filter((l) => l.url);

    const actions = links.length
      ? links.map((l) => `<a class="btn btn--sm ${l.primary ? '' : 'btn--outline'}" href="${esc(l.url)}"${linkAttrs(l.url)}>${esc(l.label)} ${icon(l.icon)}</a>`).join('')
      : `<span class="btn btn--sm btn--outline" aria-disabled="true">${esc(tr('pubs.soon'))}</span>`;

    const kw = t(p.keywords) || [];
    const keywords = kw.length
      ? `<ul class="tags" aria-label="${esc(tr('pubs.keywords'))}">${kw.map((k) => `<li class="tag">${esc(k)}</li>`).join('')}</ul>`
      : '';

    const abstract = t(p.abstract);
    return `
      <li class="pub" id="${id}">
        <div class="pub__year" aria-hidden="true">${esc(p.year)}</div>
        <article class="pub__body" aria-labelledby="${id}-title">
          <div class="pub__meta">
            ${p.type ? `<span class="pill">${esc(typeLabel(p.type))}</span>` : ''}
            <span>${esc([t(p.venue), p.year].filter(Boolean).join(' · '))}</span>
          </div>
          <h2 class="pub__title" id="${id}-title">${esc(t(p.title))}</h2>
          ${authors ? `<p class="pub__authors">${authors}</p>` : ''}
          ${abstract ? `
            <p class="pub__abstract-label">${esc(tr('pubs.abstract'))}</p>
            <p class="pub__abstract" id="${id}-abstract">${esc(abstract)}</p>
            <button class="pub__toggle" type="button" aria-expanded="false" aria-controls="${id}-abstract" hidden>${esc(tr('pubs.readMore'))}</button>` : ''}
          ${keywords}
          <div class="pub__actions">${actions}</div>
        </article>
      </li>`;
  }

  // Só mostra "ler resumo completo" quando o texto foi realmente cortado
  function markClampedAbstracts() {
    document.querySelectorAll('.pub').forEach((pub) => {
      const abs = pub.querySelector('.pub__abstract');
      const btn = pub.querySelector('.pub__toggle');
      if (abs && btn && !pub.classList.contains('is-expanded')) btn.hidden = abs.scrollHeight <= abs.clientHeight + 2;
    });
  }

  // Link direto (publicacoes.html#id): destaca, expande e rola até o item
  function focusHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const el = document.getElementById(id);
    if (!el || !el.classList.contains('pub')) return;
    document.querySelectorAll('.pub.is-target').forEach((p) => p.classList.remove('is-target'));
    el.classList.add('is-target', 'is-expanded');
    const btn = el.querySelector('.pub__toggle');
    if (btn) { btn.setAttribute('aria-expanded', 'true'); btn.textContent = tr('pubs.readLess'); btn.hidden = false; }
    requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }
})();
