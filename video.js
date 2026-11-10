(() => {
  const video = document.getElementById('sculpture-rotation');
  if (!video) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  video.muted = true;
  if (!motion.matches && !connection?.saveData) video.play().catch(() => {});
  motion.addEventListener('change', event => { if (event.matches) video.pause(); });
})();
