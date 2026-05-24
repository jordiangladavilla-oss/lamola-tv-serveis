// Discreet clock + burn-in drift protection

export function startClock(el) {
  if (!el) return;
  const update = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${hh}:${mm}`;
  };
  update();
  // Re-align to top of minute, then tick once per minute
  const msUntilNextMin = (60 - new Date().getSeconds()) * 1000;
  setTimeout(() => {
    update();
    setInterval(update, 60_000);
  }, msUntilNextMin);
}

export function startBurnInDrift({ intervalMs = 60_000, driftPx = 2 } = {}) {
  const positions = [
    [0, 0], [driftPx, 0], [driftPx, driftPx], [0, driftPx],
    [-driftPx, driftPx], [-driftPx, 0], [-driftPx, -driftPx], [0, -driftPx], [driftPx, -driftPx]
  ];
  let i = 0;
  const body = document.body;
  setInterval(() => {
    i = (i + 1) % positions.length;
    const [x, y] = positions[i];
    body.style.transform = `translate(${x}px, ${y}px)`;
  }, intervalMs);
}
