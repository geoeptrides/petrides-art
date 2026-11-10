/* One published profile, with readable HTML retained if the network is unavailable. */
(() => {
  const endpoint = location.hostname === 'www.petrides.art' || location.hostname === 'petrides.art' || location.hostname === 'localhost' || location.hostname.endsWith('.vercel.app') ? '/artist-profile/profile.json' : 'https://www.petrides.art/artist-profile/profile.json';
  const safeUrl = value => {
    try { const u = new URL(value); return ['https:', 'mailto:'].includes(u.protocol) ? u.href : null; }
    catch { return null; }
  };
  async function refresh() {
    const targets = document.querySelectorAll('[data-artist-profile]');
    if (!targets.length) return;
    try {
      const response = await fetch(endpoint, {cache: 'no-cache', signal: AbortSignal.timeout(8000)});
      if (!response.ok) throw new Error('Profile unavailable');
      const profile = await response.json();
      if (profile.schemaVersion !== 1) throw new Error('Unsupported profile');
      for (const target of targets) {
        const locale = target.dataset.artistLanguage || document.documentElement.lang || 'en';
        const content = profile.languages[locale] || profile.languages.en;
        if (!Array.isArray(content.sections) || !content.sections.length) continue;
        const fragment = document.createDocumentFragment();
        for (const section of content.sections) {
          const block = document.createElement('div');
          block.className = target.dataset.artistSectionClass || '';
          const heading = document.createElement(target.dataset.artistHeading || 'h3');
          heading.textContent = section.heading;
          block.append(heading);
          for (const text of section.paragraphs) {
            const p = document.createElement('p'); p.textContent = text; block.append(p);
          }
          fragment.append(block);
        }
        target.replaceChildren(fragment);
        target.dataset.artistVersion = profile.updated;
      }
      document.querySelectorAll('[data-artist-portrait]').forEach(img => {
        const url = safeUrl(profile.portrait.url);
        if (url) { const preload = new Image(); preload.onload = () => {img.src = url; img.alt = profile.portrait.alt;}; preload.src = url; }
      });
      document.querySelectorAll('[data-artist-link]').forEach(link => {
        const url = safeUrl(profile.links[link.dataset.artistLink]); if (url) link.href = url;
      });
    } catch (error) { console.warn('Using saved artist profile.', error.message); }
  }
  refresh();
})();
