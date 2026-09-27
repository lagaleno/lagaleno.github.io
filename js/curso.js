/* Página de detalhe do curso: curso.html?id=<id do curso em data/cursos.json> */
(function () {
  'use strict';
  const { icon, esc, safeUrl, linkAttrs, loadJSON, t, tr } = App;

  const MATERIAL_TYPES = ['slides', 'pdf', 'video', 'code', 'folder', 'link'];

  App.page = async function () {
    const hero = document.getElementById('course-hero');
    const body = document.getElementById('course-body');
    const id = new URLSearchParams(location.search).get('id');

    let courses;
    try {
      courses = await loadJSON('cursos');
    } catch (err) {
      App.showError(body, err);
      return;
    }

    const c = courses.find((x) => x.id === id);
    if (!c) {
      hero.innerHTML = `${breadcrumb()}<h1 class="page-hero__title page-hero__title--plain">${esc(tr('course.notFound'))}</h1>`;
      body.innerHTML = `
        <div class="empty-state">
          <p>${esc(tr('course.notFoundText'))}</p>
          <p style="margin-top:20px"><a class="btn" href="cursos.html">${icon('arrowLeft')} ${esc(tr('course.seeAll'))}</a></p>
        </div>`;
      return;
    }

    const title = t(c.title);
    document.title = `${title} · Larissa Galeno`;
    const chips = [t(c.period) || c.year, t(c.format), t(c.workload)].filter(Boolean).map((v) => `<li>${esc(v)}</li>`).join('');
    const institution = t(c.institution);
    const summary = t(c.summary);
    hero.innerHTML = `
      ${breadcrumb(title)}
      ${institution ? `<span class="eyebrow">${esc(institution)}</span>` : ''}
      <h1 class="page-hero__title page-hero__title--plain">${esc(title)}</h1>
      ${summary ? `<p class="page-hero__intro">${esc(summary)}</p>` : ''}
      ${chips ? `<ul class="meta-chips">${chips}</ul>` : ''}`;

    const description = t(c.description) || [];
    const goals = t(c.goals) || [];
    const materials = c.materials || [];
    body.innerHTML = `
      <div class="course-layout">
        <div>
          ${section(tr('course.about'), description.length
            ? `<div class="prose">${description.map((p) => `<p>${esc(p)}</p>`).join('')}</div>` : '')}
          ${section(tr('course.goals'), goals.length
            ? `<ul class="checklist">${goals.map((g) => `<li>${icon('check')}<span>${esc(g)}</span></li>`).join('')}</ul>` : '')}
          ${section(tr('course.content'), (c.modules || []).map((m, i) => moduleBlock(m, i)).join(''))}
        </div>
        <aside class="aside-card" aria-label="${esc(tr('course.aside'))}">
          ${infoList(c)}
          ${materials.length ? `
            <div>
              <h2 class="block__title">${esc(tr('course.material'))}</h2>
              ${materialList(materials)}
            </div>` : ''}
          <a class="arrow-link" href="cursos.html">${icon('arrowLeft')} ${esc(tr('course.back'))}</a>
        </aside>
      </div>`;
  };

  function breadcrumb(current) {
    return `
      <nav aria-label="${esc(tr('course.trail'))}">
        <ol class="breadcrumb">
          <li><a href="index.html">${esc(tr('nav.home'))}</a></li>
          <li><a href="cursos.html">${esc(tr('nav.courses'))}</a></li>
          ${current ? `<li aria-current="page">${esc(current)}</li>` : ''}
        </ol>
      </nav>`;
  }

  function section(title, content) {
    if (!content) return '';
    return `<section class="block"><h2 class="block__title">${esc(title)}</h2>${content}</section>`;
  }

  function moduleBlock(m, i) {
    const topicList = t(m.topics) || [];
    const topics = topicList.length
      ? `<ul class="module__topics">${topicList.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
    const mats = (m.materials || []).length ? materialList(m.materials) : '';
    return `
      <details class="module"${i === 0 ? ' open' : ''}>
        <summary><span>${esc(t(m.title))}</span>${icon('chevronDown')}</summary>
        <div class="module__body">${topics}${mats}</div>
      </details>`;
  }

  function materialList(materials) {
    return `<ul class="materials">${materials.map(material).join('')}</ul>`;
  }

  // Materiais sem URL aparecem como "em breve"
  function material(m) {
    const url = safeUrl(m.url);
    const type = MATERIAL_TYPES.includes(m.type) ? m.type : 'link';
    const inner = `
      <span class="material__icon">${icon(type)}</span>
      <span class="material__label">${esc(t(m.label))}<br><span class="material__hint">${esc(url ? tr(`material.${type}`) : tr('course.soon'))}</span></span>
      ${url ? icon('external') : ''}`;
    return url
      ? `<li><a class="material" href="${esc(url)}"${linkAttrs(url)}>${inner}</a></li>`
      : `<li><div class="material is-pending">${inner}</div></li>`;
  }

  function infoList(c) {
    const rows = [
      ['course.institution', t(c.institution)],
      ['course.period', t(c.period) || c.year],
      ['course.workload', t(c.workload)],
      ['course.format', t(c.format)],
      ['course.audience', t(c.audience)],
    ].filter(([, v]) => v);
    if (!rows.length) return '';
    return `<dl class="info-list">${rows.map(([k, v]) => `<div><dt>${esc(tr(k))}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;
  }
})();
