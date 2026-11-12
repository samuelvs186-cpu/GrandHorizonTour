(() => {
  'use strict';

  const ROUTES = ['inicio','noticias','modalidades','campeoes','eventos','equipes','patrocinadores'];
  const DEFAULT_ROUTE = 'inicio';
  const pages = new Map(ROUTES.map(id => [id, document.getElementById(id)]));
  const links = document.querySelectorAll('[data-link]');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const main = document.getElementById('conteudo');
  const baseTitle = document.title;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  let current = null;

  /* ---------- Estruturas repetidas (cards vazios) ----------
     Cada container com data-repeat="N" e data-tpl="id-do-template"
     recebe N cópias do <template>. Para inserir conteúdo real depois,
     use renderInto('nome-do-slot', arrayDeDados, funcaoQueCriaOElemento). */
  document.querySelectorAll('[data-repeat]').forEach(el => {
    const tpl = document.getElementById(el.dataset.tpl);
    if (!tpl) return;
    for (let i = 0; i < Number(el.dataset.repeat); i++) el.appendChild(tpl.content.cloneNode(true));
  });

  window.GHT = {
    /** Substitui os placeholders de um slot pelos itens fornecidos. */
    renderInto(slotName, items, build) {
      const slot = document.querySelector(`[data-slot="${slotName}"]`);
      if (!slot) return;
      slot.replaceChildren(...items.map(build));
    },
    go(route) { location.hash = route; }
  };

  /* ---------- Navegação SPA ---------- */
  const routeFromHash = () => {
    const id = location.hash.replace('#', '');
    return pages.has(id) ? id : DEFAULT_ROUTE;
  };

  function show(id, { focus = true } = {}) {
    if (id === current) return;
    const next = pages.get(id);
    const prev = current ? pages.get(current) : null;

    const reveal = () => {
      if (prev) { prev.hidden = true; prev.classList.remove('is-leaving'); }
      next.hidden = false;
      current = id;
      window.scrollTo({ top: 0, behavior: 'instant' });
      links.forEach(a => {
        a.getAttribute('href') === '#' + id
          ? a.setAttribute('aria-current', 'page')
          : a.removeAttribute('aria-current');
      });
      const h = next.querySelector('h1');
      document.title = (h ? h.textContent.trim() + ' | ' : '') + baseTitle;
      if (focus) main.focus({ preventScroll: true });
    };

    if (prev && !reduceMotion.matches) {
      prev.classList.add('is-leaving');
      setTimeout(reveal, 200);
    } else {
      reveal();
    }
    closeMenu();
  }

  function onRoute() {
    const id = routeFromHash();
    if (location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    show(id, { focus: current !== null });
  }

  window.addEventListener('hashchange', onRoute);

  /* Clique em link já ativo: apenas volta ao topo, sem recarregar. */
  links.forEach(a => a.addEventListener('click', e => {
    if (a.getAttribute('href') === '#' + current) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      closeMenu();
    }
  }));

  /* ---------- Menu mobile ---------- */
  function openMenu() {
    menu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fechar menu');
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
  }
  burger.addEventListener('click', () => menu.classList.contains('is-open') ? closeMenu() : openMenu());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => {
    if (menu.classList.contains('is-open') && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });
  matchMedia('(min-width: 961px)').addEventListener('change', closeMenu);

  /* ---------- Filtros (chips) prontos para uso ---------- */
  document.querySelectorAll('.chips').forEach(group => {
    group.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      group.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
    });
  });

  /* ---------- Início ---------- */
  onRoute();
})();
