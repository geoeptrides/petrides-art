(() => {
  const links = [...document.querySelectorAll('a.zoom')];
  if (!links.length) return;
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.setAttribute('aria-label', 'Image viewer');
  dlg.innerHTML = '<figure><img alt=""><figcaption aria-live="polite"></figcaption></figure>' +
    '<button type="button" class="lb-close" aria-label="Close">Close</button>' +
    '<button type="button" class="lb-prev" aria-label="Previous image">‹</button>' +
    '<button type="button" class="lb-next" aria-label="Next image">›</button>';
  document.body.appendChild(dlg);
  const img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption');
  let i = 0, activeLinks = [];
  const show = n => {
    i = (n + activeLinks.length) % activeLinks.length;
    const a = activeLinks[i], t = a.querySelector('img'), fc = a.closest('figure').querySelector('figcaption');
    img.src = a.href; img.alt = t ? t.alt : '';
    cap.textContent = (fc ? fc.textContent : '') + ' · ' + (i + 1) + ' of ' + activeLinks.length;
  };
  links.forEach(a => a.addEventListener('click', e => {
    if (typeof dlg.showModal !== 'function') return;
    e.preventDefault();
    activeLinks = [...a.closest('.gallery').querySelectorAll('a.zoom')];
    show(activeLinks.indexOf(a)); dlg.showModal();
  }));
  dlg.querySelector('.lb-close').onclick = () => dlg.close();
  dlg.querySelector('.lb-prev').onclick = () => show(i - 1);
  dlg.querySelector('.lb-next').onclick = () => show(i + 1);
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
})();
