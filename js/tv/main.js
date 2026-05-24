// Bootstrap kiosk: load data, mount carousel, start clock + burn-in drift.

import { DataLoader } from './data-loader.js';
import { Carousel } from './carousel.js';
import { startClock, startBurnInDrift } from './clock.js';

const isPreview = new URLSearchParams(location.search).has('preview');
if (isPreview) document.body.classList.add('is-preview');

const stage = document.getElementById('stage');
const loading = document.getElementById('loading');
const errorScreen = document.getElementById('error-screen');
const clockEl = document.getElementById('clock');
const coordsEl = document.getElementById('coords');

let carousel = null;
const loader = new DataLoader();

function showError() {
  if (errorScreen) {
    errorScreen.hidden = false;
    errorScreen.classList.remove('is-hidden');
  }
  if (loading) loading.classList.add('is-hidden');
}

function hideOverlays() {
  if (loading) loading.classList.add('is-hidden');
  if (errorScreen) errorScreen.classList.add('is-hidden');
  // Remove hidden=true if user set it
  setTimeout(() => {
    if (loading) loading.hidden = true;
    if (errorScreen) errorScreen.hidden = true;
  }, 700);
}

async function bootstrap() {
  try {
    const { services, config } = await loader.load();

    if (services?.globals?.coords && coordsEl) coordsEl.textContent = services.globals.coords;

    carousel = new Carousel(stage, { services, config });
    carousel.start();

    // Updates from polling → rebuild queue without disrupting current slide
    loader.addEventListener(DataLoader.EVENT_UPDATED, (e) => {
      console.log('[main] data updated, refreshing carousel');
      carousel.update(e.detail);
    });

    loader.startPolling(config?.data?.refetchIntervalMs || 600_000);

    if (config?.display?.showClock !== false && !isPreview) startClock(clockEl);
    if (config?.display?.burnInProtection !== false && !isPreview) {
      startBurnInDrift({
        intervalMs: config?.display?.burnInIntervalMs || 60_000,
        driftPx: config?.display?.burnInDriftPx || 2
      });
    }

    hideOverlays();

    // Register SW only in production (not preview)
    if ('serviceWorker' in navigator && !isPreview && location.protocol !== 'file:') {
      try { await navigator.serviceWorker.register('./sw.js'); } catch (e) { console.warn('[sw] register failed', e); }
    }
  } catch (err) {
    console.error('[main] bootstrap failed', err);
    showError();
    // Retry after delay
    setTimeout(bootstrap, 30_000);
  }
}

bootstrap();
