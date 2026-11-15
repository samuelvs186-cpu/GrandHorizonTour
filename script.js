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


  const teams = [
    { id: 'Brasil', name: 'Andrade', image: 'Equipes/Brasil.png' },
    { id: 'USA', name: 'Rutherford Eagles', image: 'Equipes/USA.png' },
    { id: 'russia', name: 'Zhar-Ptitsa', image: 'Equipes/Russia.png' },
    { id: 'japao', name: 'Yatagarasu', image: 'Equipes/Japão.png' },
    { id: 'italia', name: 'Sozanni', image: 'Equipes/Italia.png' },
    { id: 'inglaterra', name: 'three Crowns london', image: 'Equipes/inglaterra.png' },
    { id: 'franca', name: 'Chevalier Veloce', image: 'Equipes/França.png' },
    { id: 'espanha', name: 'La Rueda Roja', image: 'Equipes/Espanha.png' },
    { id: 'coreia-do-sul', name: 'Haechi Dynamics', image: 'Equipes/Coreia do Sul.png' },
    { id: 'china', name: 'Xinghai Long', image: 'Equipes/China.png' },
    { id: 'canada', name: 'Northern Wolves', image: 'Equipes/Canada.png' },
    { id: 'argentina', name: 'La plata Boys', image: 'Equipes/Argentina.png' },
    { id: 'arabia-saudita', name: 'Aswad Al Sahra', image: 'Equipes/Arabia Saudita.png' },
    { id: 'alemanha', name: 'Adelberg', image: 'Equipes/Alemanha.png' },
    { id: 'Malasia', name: 'Harimau Malaya', image: 'Equipes/Malasia.png' },
    { id: 'Mexico', name: 'Aguilas Huanacaz', image: 'Equipes/Mexico.png' },
    { id: 'indonesia', name: 'Nusantara', image: 'Equipes/Indonesia.png' }

  ];

  const teamsGrid = document.getElementById('lista-equipes');

  function renderTeams() {
    teams.forEach(team => {
      const card = document.createElement('a');
      const image = document.createElement('img');
      const name = document.createElement('h3');

      card.className = 'card team';
      card.href = `#equipes/${team.id}`;
      image.className = 'team__logo';
      image.src = team.image;
      image.alt = team.name;
      image.loading = 'lazy';
      name.textContent = team.name;
      card.append(image, name);
      teamsGrid.appendChild(card);
    });
  }

  renderTeams();


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

    const id = location.hash
        .replace('#', '')
        .split('/')[0];

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
    const route = location.hash.replace('#', '').split('/');
    const teamId = route[1];
    const id = routeFromHash();

    if (route[0] !== id) history.replaceState(null, '', '#' + id);
    show(id, { focus: current !== null });

    if (id === 'equipes') {
      if (teamId) openTeamPage(teamId);
      else showTeamList();
    }
  }

  function openTeamPage(teamId) {
    const team = teams.find(item => item.id === teamId);
    if (!team) {
      location.hash = '#equipes';
      return;
    }

    const template = document.getElementById('tpl-team-page');
    const list = document.getElementById('equipes-listagem');
    const page = document.getElementById('equipe-pagina');
    const content = template.content.cloneNode(true);
    const image = content.querySelector('[data-team-image]');

    image.src = team.image;
    image.alt = team.name;
    content.querySelector('[data-team-name]').textContent = team.name;
    content.querySelector('[data-team-description]').textContent =
      `${team.name} representa sua região no Grand Horizon Tour.`;

    list.hidden = true;
    page.hidden = false;
    page.replaceChildren(content);
    document.title = `${team.name} | ${baseTitle}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showTeamList() {
    document.getElementById('equipe-pagina').hidden = true;
    document.getElementById('equipes-listagem').hidden = false;
    document.title = 'Equipes Filiadas | ' + baseTitle;
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
