// QR SVG generator wrapping qrcode-generator (window.qrcode global)
// Returns a styled SVG element ready to inject into the DOM.

const TYPE_NUMBER = 0; // auto
const CELL_SIZE = 6;
const MARGIN = 2;
const FG = '#100e0b';
const BG = '#f3ecd9';

export function makeQrSvg(text, { size = 360, ecLevel = 'M' } = {}) {
  if (typeof window.qrcode !== 'function') {
    console.error('[qr] qrcode-generator lib not loaded');
    return placeholderSvg(size);
  }

  let qr;
  try {
    qr = window.qrcode(TYPE_NUMBER, ecLevel);
    qr.addData(text);
    qr.make();
  } catch (err) {
    console.error('[qr] failed to encode', err);
    return placeholderSvg(size);
  }

  const count = qr.getModuleCount();
  const dim = (count + MARGIN * 2) * CELL_SIZE;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${dim} ${dim}`);
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Codi QR per agendar visita');

  // Background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', dim);
  bg.setAttribute('height', dim);
  bg.setAttribute('fill', BG);
  svg.appendChild(bg);

  // Build a single path with all dark modules for tiny output size
  let d = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = (c + MARGIN) * CELL_SIZE;
        const y = (r + MARGIN) * CELL_SIZE;
        d += `M${x} ${y}h${CELL_SIZE}v${CELL_SIZE}h-${CELL_SIZE}z`;
      }
    }
  }
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', FG);
  svg.appendChild(path);

  return svg;
}

function placeholderSvg(size) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('width', '100');
  rect.setAttribute('height', '100');
  rect.setAttribute('fill', BG);
  svg.appendChild(rect);
  return svg;
}

export function whatsappUrl(phone, message) {
  const cleanPhone = String(phone).replace(/\D/g, '');
  const encoded = encodeURIComponent(message || '');
  return `https://wa.me/${cleanPhone}${encoded ? `?text=${encoded}` : ''}`;
}
