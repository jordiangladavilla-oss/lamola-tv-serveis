// Pro-intro title card — fullscreen typography slide that precedes each pro.

export function renderProIntroSlide(pro, globals) {
  const section = document.createElement('section');
  section.className = 'slide slide-pro-intro';
  section.dataset.slide = `pro-intro-${pro.id}`;

  const accent = pro.accentColor || '#7a7048';
  section.style.setProperty('--accent-ink', accent);

  const specialty = (pro.specialty || pro.specialtyShort || '').toUpperCase();
  const name = pro.name || '';
  const tagline = globals?.tagline || 'LIFT. BREATHE. REPEAT.';
  const coords = globals?.coords || '';

  section.innerHTML = `
    <div class="pi-bg" aria-hidden="true"></div>
    <div class="pi-stack">
      <div class="pi-eyebrow">
        <span class="pi-bullet"></span>
        <span>Servei</span>
      </div>
      <div class="pi-specialty">${escapeHtml(specialty)}</div>
      <div class="pi-divider"></div>
      <div class="pi-name">${escapeHtml(name)}</div>
    </div>
    <div class="pi-foot">
      <div class="pi-tag">${escapeHtml(tagline)}</div>
      <div class="pi-coords">${escapeHtml(coords)}</div>
    </div>
  `;
  return section;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
