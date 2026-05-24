// Merchandising slide. Built-in animated mockup cycling through products with swatches + price.

export function renderMerchSlide(merch, globals) {
  const section = document.createElement('section');
  section.className = 'slide slide-merch';
  section.dataset.slide = 'merch';

  const products = Array.isArray(merch?.products) ? merch.products : [];
  const collectionName = merch?.collectionName || '';
  const headline = merch?.headline || 'Nova col·lecció';
  const subline = merch?.subline || '';
  const tagline = merch?.tagline || globals?.tagline || '';
  const ctaLabel = merch?.ctaLabel || 'Pregunta a recepció';
  const price = merch?.price || '';
  const priceLabel = merch?.priceLabel || '';
  const spline = merch?.spline || {};

  const visualHtml = spline?.enabled && spline?.embedUrl
    ? `<iframe src="${escapeAttr(spline.embedUrl)}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin" title="${escapeAttr(collectionName)}" allow="autoplay"></iframe>`
    : buildMockupHtml(products, tagline, headline);

  const productsHtml = products.map(p => `
    <li>
      <div class="p-name">${escapeHtml(p.name || '')}</div>
      <div class="p-colors">${escapeHtml((p.colors || []).join(' · '))}</div>
    </li>
  `).join('');

  section.innerHTML = `
    <div class="merch-visual">${visualHtml}</div>
    <div class="merch-content">
      <div>
        <div class="merch-eyebrow">${escapeHtml(collectionName)}</div>
        <h1 class="merch-title">${escapeHtml(headline)} <em>summer</em></h1>
        ${subline ? `<div class="merch-subline">${escapeHtml(subline)}</div>` : ''}
      </div>
      <ul class="merch-products">${productsHtml}</ul>
      ${price ? `
        <div class="merch-price-block">
          <div class="merch-price">${escapeHtml(price)}</div>
          <div class="merch-price-meta">${escapeHtml(priceLabel)}</div>
        </div>
      ` : ''}
      <div class="merch-cta">
        <div class="cta-h">${escapeHtml(ctaLabel)}</div>
        <div class="cta-tag">${escapeHtml(tagline)}</div>
      </div>
    </div>
  `;

  // Start mockup animation if no Spline
  if (!(spline?.enabled && spline?.embedUrl)) {
    startMockupAnimation(section, products);
  }

  return section;
}

function buildMockupHtml(products, tagline, headline) {
  const slides = products.map((p, i) => {
    const swatches = (p.swatches || []).map(c => `<span class="mk-swatch" style="background:${escapeAttr(c)}"></span>`).join('');
    const colorNames = (p.colors || []).join(' · ');
    return `
      <div class="mk-slide" data-mk-idx="${i}" ${i === 0 ? 'data-active' : ''}>
        <div class="mk-tag">${escapeHtml(tagline)}</div>
        <div class="mk-product">
          <div class="mk-name">${escapeHtml(p.name || '')}</div>
          <div class="mk-sub">${escapeHtml(p.tagline || '')}</div>
        </div>
        <div class="mk-swatches">${swatches}</div>
        <div class="mk-colors">${escapeHtml(colorNames)}</div>
      </div>
    `;
  }).join('');

  const dots = products.map((_, i) => `<span class="mk-dot" ${i === 0 ? 'data-active' : ''}></span>`).join('');

  return `
    <div class="mk-stage">
      <div class="mk-bg" aria-hidden="true"></div>
      <div class="mk-headline">${escapeHtml(headline.toUpperCase())}</div>
      <div class="mk-slides">${slides}</div>
      <div class="mk-dots">${dots}</div>
    </div>
  `;
}

function startMockupAnimation(section, products) {
  if (products.length < 2) return;
  const slides = section.querySelectorAll('.mk-slide');
  const dots = section.querySelectorAll('.mk-dot');
  let i = 0;
  // Cycle every 4s
  section._mkTimer = setInterval(() => {
    slides[i].removeAttribute('data-active');
    dots[i].removeAttribute('data-active');
    i = (i + 1) % slides.length;
    slides[i].setAttribute('data-active', '');
    dots[i].setAttribute('data-active', '');
  }, 4000);
  // Cleanup when removed (mutation observer)
  const obs = new MutationObserver(() => {
    if (!section.isConnected) { clearInterval(section._mkTimer); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
