(() => {
  const button = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-nav');
  if (!button || !nav) return;
  document.documentElement.classList.add('nav-ready');
  const close = () => {
    button.setAttribute('aria-expanded', 'false');
    button.textContent = 'Explore pages';
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? 'Close menu' : 'Explore pages';
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      close(); button.focus();
    }
  });
  window.matchMedia('(max-width:760px)').addEventListener('change', close);
})();
