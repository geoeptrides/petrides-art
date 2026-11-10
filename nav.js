(() => {
  const groups = [...document.querySelectorAll('.site-head nav details')];
  const mq = window.matchMedia('(max-width:1080px)');
  const sync = () => groups.forEach(g => { g.open = mq.matches; });
  sync(); mq.addEventListener('change', sync);
  document.addEventListener('click', e => { if (!mq.matches && !e.target.closest('.site-head nav')) groups.forEach(g => g.open = false); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!mq.matches) groups.forEach(g => { if (g.open) { g.open = false; g.querySelector('summary').focus(); } });
    const n = document.getElementById('nav'), b = document.querySelector('.menu-btn');
    if (mq.matches && n && n.classList.contains('open')) { n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.focus(); }
  });
})();
