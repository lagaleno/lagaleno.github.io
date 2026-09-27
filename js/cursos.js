/* Listagem de cursos com filtro por tema. Cada card leva para curso.html?id=<id>. */
(function () {
  'use strict';
  const { icon, esc, loadJSON, byYearDesc, t, tr } = App;

  App.page = async function (site) {
    const cfg = site.pages?.cursos || {};
    if (cfg.eyebrow) document.getElementById('page-eyebrow').textContent = t(cfg.eyebrow);
    document.getElementById('page-intro').textContent = t(cfg.intro) || '';

    const grid = document.getElementById('course-grid');
    let courses;
    try {
      courses = (await loadJSON('cursos')).slice().sort(byYearDesc);
    } catch (err) {
      App.showError(grid, err);
      return;
    }

    const tagsEl = document.getElementById('course-tags');
    const count = document.getElementById('course-count');
    const tagsOf = (c) => (c.tags || []).map(t);
    let active = '';

    const tags = [...new Set(courses.flatMap(tagsOf))];
    if (tags.length > 1) {
      tagsEl.innerHTML = ['', ...tags].map((tag) =>
        `<button class="chip" type="button" data-tag="${esc(tag)}" aria-pressed="${tag === ''}">${esc(tag || tr('courses.all'))}</button>`
      ).join('');
      tagsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;
        active = btn.dataset.tag;
        tagsEl.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
        render();
      });
    }

    function render() {
      const shown = active ? courses.filter((c) => tagsOf(c).includes(active)) : courses;
      count.textContent = tr(shown.length === 1 ? 'courses.one' : 'courses.many', { n: shown.length });
      grid.innerHTML = shown.length
        ? shown.map((c) => card(c, courses.indexOf(c))).join('')
        : `<li class="empty-state">${esc(tr('courses.empty'))}</li>`;
    }
    render();
  };

  function card(c, i) {
    const href = `curso.html?id=${encodeURIComponent(c.id)}`;
    const meta = [t(c.institution), t(c.period) || c.year].filter(Boolean).join(' · ');
    const extra = [t(c.format), t(c.workload)].filter(Boolean).join(' · ');
    const tags = (c.tags || []).map((tag) => `<li class="tag">${esc(t(tag))}</li>`).join('');
    const summary = t(c.summary);
    return `
      <li>
        <article class="course-card course-card--${(i % 3) + 1}">
          <div class="course-card__cover" aria-hidden="true">
            <div class="pattern"></div>
            ${c.year ? `<span class="pill">${esc(c.year)}</span>` : ''}
          </div>
          <div class="course-card__body">
            ${meta ? `<p class="course-card__meta">${esc(meta)}</p>` : ''}
            <h2 class="course-card__title"><a href="${href}">${esc(t(c.title))}</a></h2>
            ${summary ? `<p class="course-card__summary">${esc(summary)}</p>` : ''}
            ${tags ? `<ul class="tags" aria-label="${esc(tr('courses.topics'))}">${tags}</ul>` : ''}
            <div class="course-card__footer">
              <span class="course-card__meta">${esc(extra)}</span>
              <span class="arrow-link" aria-hidden="true">${esc(tr('courses.more'))} ${icon('arrowRight')}</span>
            </div>
          </div>
        </article>
      </li>`;
  }
})();
