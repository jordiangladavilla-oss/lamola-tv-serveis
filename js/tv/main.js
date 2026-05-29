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

function prewarmVideos(services) {
  const urls = (services?.professionals || [])
    .filter(p => p.active !== false && p.media?.type === 'video' && p.media?.videoSrc)
    .map(p => p.media.videoSrc);
  for (const url of urls) {
    fetch(url, { cache: 'force-cache' }).catch(() => {});
  }
}

async function bootstrap() {
  try {
    const { services, config } = await loader.load();

    if (services?.globals?.coords && coordsEl) coordsEl.textContent = services.globals.coords;

    prewarmVideos(services);

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
  } catch (err) {
    console.error('[main] bootstrap failed', err);
    showError();
    // Retry after delay
    setTimeout(bootstrap, 30_000);
  }
}

bootstrap();
