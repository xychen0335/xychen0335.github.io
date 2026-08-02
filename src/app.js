(() => {
  const search = document.querySelector('[data-search]');
  const cards = [...document.querySelectorAll('[data-post-card]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const empty = document.querySelector('[data-empty]');
  const resultCount = document.querySelector('[data-result-count]');

  if (!cards.length || !search) return;

  let activeFilter = 'all';

  const render = () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !query || card.dataset.search.includes(query);
      const shouldShow = matchesFilter && matchesSearch;
      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;
    if (resultCount) resultCount.textContent = `${visible} 篇文章`;
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle('is-active', item === button));
      filters.forEach((item) => item.setAttribute('aria-pressed', item === button ? 'true' : 'false'));
      render();
    });
  });

  search.addEventListener('input', render);
  render();
})();
