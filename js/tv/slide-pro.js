// Professional card slide.
import { makeQrSvg, whatsappUrl } from './qr.js';

export function renderProSlide(pro, globals, qrOpts = {}) {
  const section = document.createElement('section');
  section.className = 'slide slide-pro';
  section.dataset.slide = `pro-${pro.id}`;

  const accent = pro.accentColor || '#7a7048';
  section.style.setProperty('--accent-ink', accent);

  const media = pro.media || {};
  const useVideo = media.type === 'video' && media.videoSrc;
  const poster = media.posterSrc || media.photoSrc || '';

  const mediaEl = useVideo
    ? `<video autoplay muted playsinline loop preload="auto" poster="${escapeAttr(poster)}">
         <source src="${escapeAttr(media.videoSrc)}" type="video/mp4">
       </video>`
    : `<img class="photo" src="${escapeAttr(media.photoSrc || poster)}" alt="${escapeAttr(pro.name)}">`;

  const bullets = Array.isArray(pro.bullets) ? pro.bullets : [];
  const bulletsHtml = bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('');

  const message = (pro.whatsapp?.messageOverride || globals?.whatsappDefaultMessage || '').trim();
  const waUrl = whatsappUrl(pro.whatsapp?.phone, message);

  section.innerHTML = `
    <div class="media-col">
      <div class="pro-badge"><span class="dot"></span>${escapeHtml(pro.specialtyShort || pro.specialty || 'Servei')}</div>
      ${mediaEl}
    </div>
    <div class="content-col">
      <div class="pro-header">
        <div class="pro-specialty">${escapeHtml(pro.specialty || '')}</div>
        <h1 class="pro-name">${escapeHtml(pro.name || '')}</h1>
      </div>
      <ul class="pro-bullets">${bulletsHtml}</ul>
      <div class="pro-cta">
        <div class="qr-box" data-qr></div>
        <div class="cta-text">
          <div class="cta-label">${escapeHtml(pro.ctaLabel || 'Escaneja amb el mòbil')}</div>
          <div class="cta-heading">Agenda visita</div>
          <a class="cta-wa" href="${escapeAttr(waUrl)}" target="_blank" rel="noopener">WhatsApp · ${escapeHtml(formatPhone(pro.whatsapp?.phone))}</a>
        </div>
      </div>
    </div>
  `;

  // Inject QR svg
  const qrSlot = section.querySelector('[data-qr]');
  if (qrSlot) {
    const svg = makeQrSvg(waUrl, { size: qrOpts.size || 360, ecLevel: qrOpts.ecLevel || 'M' });
    qrSlot.appendChild(svg);
  }

  // Video fail-safe → swap to image
  const video = section.querySelector('video');
  if (video) {
    const swap = () => {
      const img = document.createElement('img');
      img.className = 'photo';
      img.src = media.photoSrc || poster;
      img.alt = pro.name || '';
      video.replaceWith(img);
    };
    let stalledTimer = null;
    video.addEventListener('error', swap);
    video.addEventListener('stalled', () => {
      clearTimeout(stalledTimer);
      stalledTimer = setTimeout(swap, 3000);
    });
    video.addEventListener('playing', () => clearTimeout(stalledTimer));
  }

  return section;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

function formatPhone(p) {
  if (!p) return '';
  const s = String(p).replace(/\D/g, '');
  if (s.startsWith('34') && s.length === 11) {
    return `+34 ${s.slice(2, 5)} ${s.slice(5, 8)} ${s.slice(8)}`;
  }
  return `+${s}`;
}
