// Intro / branding slide.

export function renderIntroSlide(intro, globals) {
  const section = document.createElement('section');
  section.className = 'slide slide-intro';
  section.dataset.slide = 'intro';

  const headline = (intro?.headline ?? 'Els nostres').trim();
  const accent = (intro?.headlineAccent ?? 'serveis').trim();
  const subline = intro?.subline ?? '';
  const coach = intro?.coachLine ?? globals?.tagline ?? '';
  const tagline = globals?.tagline ?? '';

  section.innerHTML = `
    <div class="intro-inner">
      <div class="intro-coach">${escapeHtml(coach)}</div>
      <h1 class="intro-headline">${escapeHtml(headline)} <em>${escapeHtml(accent)}</em></h1>
      ${subline ? `<p class="intro-subline">${escapeHtml(subline)}</p>` : ''}
      <div class="intro-tagline">${escapeHtml(tagline)}</div>
    </div>
  `;
  return section;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
