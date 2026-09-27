/* Currículo interativo: busca com destaque, filtro por seção, tags clicáveis e PDF para ver/baixar.
   Dados em data/curriculo.json; a seção de publicações vem de data/publicacoes.json. */
(function () {
  'use strict';
  const { icon, esc, safeUrl, linkAttrs, normalize, loadJSON, byYearDesc, t, tr, typeLabel, lang } = App;

  App.page = async function (site) {
    const body = document.getElementById('cv-body');
    let cv, pubs;
    try {
      [cv, pubs] = await Promise.all([loadJSON('curriculo'), loadJSON('publicacoes')]);
    } catch (err) {
      App.showError(body, err);
      return;
    }

    // Normaliza as seções num formato único: { id, title, items: [{ ...campos, text }] }
    const sections = cv.sections.map((s) => ({
      id: s.id,
      title: t(s.title),
      kind: s.source === 'publicacoes' ? 'pubs' : 'timeline',
      items: s.source === 'publicacoes' ? pubs.slice().sort(byYearDesc).map(pubItem) : (s.items || []).map(cvItem),
    }));

    renderHead(cv, site, sections);

    const state = { q: '', section: '' };
    const search = document.getElementById('cv-search');
    const chipsEl = document.getElementById('cv-sections');
    const count = document.getElementById('cv-count');

    chipsEl.innerHTML = [{ id: '', title: tr('cv.all') }, ...sections].map((s) =>
      `<button class="chip" type="button" data-section="${esc(s.id)}" aria-pressed="${s.id === ''}">${esc(s.title)}</button>`
    ).join('');
    chipsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      state.section = btn.dataset.section;
      chipsEl.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
      render();
    });

    const setQuery = (q) => {
      search.value = q;
      state.q = q.trim();
      render();
      const url = new URL(location.href);
      if (state.q) url.searchParams.set('q', state.q); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    };
    search.addEventListener('input', () => setQuery(search.value));

    // Tags e "limpar busca" alimentam a busca
    body.addEventListener('click', (e) => {
      const tag = e.target.closest('[data-tag]');
      if (tag) { setQuery(tag.dataset.tag); search.focus({ preventScroll: true }); return; }
      if (e.target.closest('[data-clear]')) { setQuery(''); search.focus(); }
    });

    function render() {
      const terms = normalize(state.q).split(/\s+/).filter(Boolean);
      const visible = sections
        .filter((s) => !state.section || s.id === state.section)
        .map((s) => ({ ...s, items: s.items.filter((it) => terms.every((term) => it.text.includes(term))) }))
        .filter((s) => s.items.length);

      const total = visible.reduce((n, s) => n + s.items.length, 0);
      count.textContent = state.q ? tr(total === 1 ? 'cv.results.one' : 'cv.results.many', { n: total }) : '';

      body.innerHTML = visible.length
        ? visible.map((s) => sectionBlock(s, terms)).join('')
        : `<div class="empty-state">
             <p>${esc(tr('cv.empty', { q: state.q }))}</p>
             <p style="margin-top:16px"><button class="btn btn--outline btn--sm" type="button" data-clear>${esc(tr('cv.clear'))}</button></p>
           </div>`;
    }

    const initial = new URLSearchParams(location.search).get('q');
    if (initial) setQuery(initial); else render();
  };

  /* ---------- Cabeçalho, números e arquivos ---------- */
  function renderHead(cv, site, sections) {
    document.getElementById('cv-headline').textContent = t(cv.headline) || '';
    document.getElementById('cv-summary').textContent = t(cv.summary) || '';

    const file = safeUrl(t(cv.files));
    if (file) {
      const name = file.split('/').pop();
      document.getElementById('cv-files').innerHTML = `
        <a class="btn btn--light" href="${esc(file)}" target="_blank" rel="noopener">${icon('pdf')} ${esc(tr('cv.view'))}</a>
        <a class="btn btn--ghost-light" href="${esc(file)}" download="${esc(name)}">${icon('download')} ${esc(tr('cv.download'))}</a>`;
    }

    // Contadores na mesma ordem das seções do curriculo.json
    const STAT_KEYS = { education: 'cv.stat.degrees', experience: 'cv.stat.jobs', publications: 'cv.stat.pubs', awards: 'cv.stat.awards' };
    const stats = sections
      .filter((s) => STAT_KEYS[s.id] && s.items.length)
      .map((s) => [s.items.length, STAT_KEYS[s.id], s.id]);
    document.getElementById('cv-stats').innerHTML = stats.map(([n, key, id]) => `
      <li><a class="cv-stat" href="#cv-${id}"><strong>${n}</strong><span>${esc(tr(key))}</span></a></li>`).join('');

    // Cabeçalho da versão impressa (PDF): nome, título e contatos — sem telefone
    const contacts = [
      ...(site.contact || []).filter((c) => c.type !== 'phone').map((c) => t(c.label)),
      ...(site.links || []).filter((l) => /^https?:/.test(t(l.url))).map((l) => t(l.url).replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')),
    ];
    document.getElementById('cv-print-head').innerHTML = `
      <img src="assets/img/brand/logo.svg" alt="" width="34" height="50">
      <div>
        <h1>${esc(cv.fullName || site.name)}</h1>
        <p class="cv-print-head__headline">${esc(t(cv.headline))}</p>
        <p class="cv-print-head__contacts">${contacts.map(esc).join('<span aria-hidden="true"> · </span>')}</p>
      </div>`;
  }

  /* ---------- Itens ---------- */
  function cvItem(it) {
    const item = {
      title: t(it.title),
      org: t(it.org),
      location: t(it.location),
      description: t(it.description),
      tags: (it.tags || []).map(t),
      link: it.link ? { label: t(it.link.label), url: safeUrl(it.link.url) } : null,
      when: it.date ? fmtDate(it.date) : range(it.start, it.end),
      current: !!it.start && !it.end,
    };
    item.text = normalize([item.title, item.org, item.location, item.description, item.when, ...item.tags].join(' '));
    return item;
  }

  function pubItem(p) {
    const item = {
      id: p.id,
      title: t(p.title),
      org: t(p.venue) || '',
      type: typeLabel(p.type),
      year: p.year,
      authors: (p.authors || []).join(', '),
      tags: t(p.keywords) || [],
    };
    item.text = normalize([item.title, item.org, item.type, item.year, item.authors, ...item.tags].join(' '));
    return item;
  }

  // "2025-03" → "mar 2025" / "Mar 2025"; "2022" → "2022"
  function fmtDate(value) {
    const [y, m] = String(value).split('-');
    if (!m) return y;
    const month = new Date(Number(y), Number(m) - 1, 1)
      .toLocaleString(lang === 'pt' ? 'pt-BR' : 'en', { month: 'short' })
      .replace('.', '');
    return `${month} ${y}`;
  }
  function range(start, end) {
    if (!start) return '';
    return `${fmtDate(start)} — ${end ? fmtDate(end) : tr('cv.present')}`;
  }

  /* ---------- Destaque dos termos buscados (ignorando acentos e maiúsculas) ---------- */
  function highlight(text, terms) {
    const src = String(text ?? '');
    if (!terms.length || !src) return esc(src);
    // mapeia cada caractere normalizado de volta à posição no texto original
    let norm = '';
    const map = [];
    for (let i = 0; i < src.length; i++) {
      const n = normalize(src[i]);
      for (let k = 0; k < n.length; k++) { norm += n[k]; map.push(i); }
    }
    const marks = new Array(src.length).fill(false);
    terms.forEach((term) => {
      let from = 0;
      let at;
      while ((at = norm.indexOf(term, from)) !== -1) {
        for (let j = at; j < at + term.length; j++) marks[map[j]] = true;
        from = at + term.length;
      }
    });
    let out = '';
    let open = false;
    for (let i = 0; i < src.length; i++) {
      if (marks[i] && !open) { out += '<mark>'; open = true; }
      if (!marks[i] && open) { out += '</mark>'; open = false; }
      out += esc(src[i]);
    }
    return open ? `${out}</mark>` : out;
  }

  /* ---------- Blocos ---------- */
  function sectionBlock(s, terms) {
    const list = s.kind === 'pubs'
      ? `<ol class="cv-pubs">${s.items.map((p) => pubRow(p, terms)).join('')}</ol>
         <p class="cv-more"><a class="arrow-link" href="publicacoes.html">${esc(tr('cv.allPubs'))} ${icon('arrowRight')}</a></p>`
      : `<ol class="timeline">${s.items.map((it) => timelineRow(it, terms)).join('')}</ol>`;
    return `
      <section class="cv-section" id="cv-${esc(s.id)}" aria-labelledby="cv-${esc(s.id)}-title">
        <h2 class="block__title" id="cv-${esc(s.id)}-title">${esc(s.title)} <span class="cv-section__count">${s.items.length}</span></h2>
        ${list}
      </section>`;
  }

  function tagList(tags, terms) {
    if (!tags.length) return '';
    return `<ul class="tags">${tags.map((tag) =>
      `<li><button class="tag tag--button" type="button" data-tag="${esc(tag)}">${highlight(tag, terms)}</button></li>`
    ).join('')}</ul>`;
  }

  function timelineRow(it, terms) {
    const org = [it.org, it.location].filter(Boolean).join(' · ');
    return `
      <li class="timeline__item${it.current ? ' is-current' : ''}">
        ${it.when ? `<p class="timeline__when">${highlight(it.when, terms)}</p>` : ''}
        <div class="timeline__body">
          <h3 class="timeline__title">${highlight(it.title, terms)}</h3>
          ${org ? `<p class="timeline__org">${highlight(org, terms)}</p>` : ''}
          ${it.description ? `<p class="timeline__desc">${highlight(it.description, terms)}</p>` : ''}
          ${it.link?.url ? `<a class="arrow-link timeline__link" href="${esc(it.link.url)}"${linkAttrs(it.link.url)}>${esc(it.link.label)} ${icon('external')}</a>` : ''}
          ${tagList(it.tags, terms)}
        </div>
      </li>`;
  }

  function pubRow(p, terms) {
    return `
      <li class="cv-pub">
        <span class="cv-pub__year">${esc(p.year)}</span>
        <div>
          <a class="cv-pub__title" href="publicacoes.html#${encodeURIComponent(p.id)}">${highlight(p.title, terms)}</a>
          <p class="cv-pub__meta"><span class="cv-pub__type">${highlight(p.type, terms)}</span> · ${highlight(p.org, terms)}</p>
        </div>
      </li>`;
  }
})();
