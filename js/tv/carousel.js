// Carousel: builds slide queue, cycles with per-slide-type durations, fail-safes.
import { renderIntroSlide } from './slide-intro.js';
import { renderProIntroSlide } from './slide-pro-intro.js';
import { renderProSlide } from './slide-pro.js';
import { renderMerchSlide } from './slide-merch.js';

export class Carousel {
  constructor(stage, { services, config }) {
    this.stage = stage;
    this.services = services;
    this.config = config;
    this.queue = [];
    this.idx = 0;
    this.currentEl = null;
    this.timer = null;
    this.watchdog = null;
    this.lastTransitionAt = Date.now();
  }

  start() {
    this._buildQueue();
    if (this.queue.length === 0) {
      console.warn('[carousel] empty queue');
      return;
    }
    this._mount(0);
    this._scheduleNext();
    this._startWatchdog();
    this._handleVisibility();
  }

  update({ services, config }) {
    this.services = services || this.services;
    this.config = config || this.config;
    const oldQueue = this.queue;
    this._buildQueue();
    const curKey = oldQueue[this.idx]?.key;
    const newIdx = this.queue.findIndex(s => s.key === curKey);
    this.idx = newIdx >= 0 ? newIdx : 0;
    if (newIdx < 0) this._mount(0);
  }

  _durations() {
    const d = this.config?.carousel?.slideDurations || {};
    const fallback = this.config?.carousel?.slideDurationMs || 11000;
    return {
      intro: d.intro ?? fallback,
      proIntro: d.proIntro ?? 4000,
      pro: d.pro ?? fallback,
      merch: d.merch ?? fallback
    };
  }

  _buildQueue() {
    const q = [];
    const s = this.services || {};
    const dur = this._durations();

    if (s.intro?.active !== false) {
      q.push({ key: 'intro', type: 'intro', durationMs: dur.intro, render: () => renderIntroSlide(s.intro || {}, s.globals || {}) });
    }

    const pros = (s.professionals || [])
      .filter(p => p.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const qrOpts = { size: this.config?.qr?.size || 360, ecLevel: this.config?.qr?.ecLevel || 'M' };

    for (const p of pros) {
      q.push({
        key: `pro-intro-${p.id}`,
        type: 'proIntro',
        durationMs: dur.proIntro,
        render: () => renderProIntroSlide(p, s.globals || {})
      });
      q.push({
        key: `pro-${p.id}`,
        type: 'pro',
        durationMs: dur.pro,
        render: () => renderProSlide(p, s.globals || {}, qrOpts)
      });
    }

    if (s.merch?.active !== false) {
      q.push({ key: 'merch', type: 'merch', durationMs: dur.merch, render: () => renderMerchSlide(s.merch || {}, s.globals || {}) });
    }

    this.queue = q;
  }

  _mount(i) {
    let el;
    try { el = this.queue[i].render(); }
    catch (err) {
      console.error('[carousel] render failed for', this.queue[i]?.key, err);
      this._skipTo(i + 1);
      return;
    }
    this.stage.innerHTML = '';
    el.classList.add('is-active');
    this.stage.appendChild(el);
    this.currentEl = el;
    this.idx = i;
    this.lastTransitionAt = Date.now();
  }

  _scheduleNext() {
    const cur = this.queue[this.idx];
    const ms = cur?.durationMs || this.config?.carousel?.slideDurationMs || 11000;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this._next(), ms);
  }

  _next() {
    const next = (this.idx + 1) % this.queue.length;
    this._crossfadeTo(next);
    this._scheduleNext();
  }

  _crossfadeTo(i) {
    let nextEl;
    try { nextEl = this.queue[i].render(); }
    catch (err) {
      console.error('[carousel] render failed for', this.queue[i]?.key, err);
      this._skipTo(i + 1);
      return;
    }

    nextEl.classList.add('is-enter');
    this.stage.appendChild(nextEl);
    void nextEl.offsetWidth;
    nextEl.classList.add('is-active');
    if (this.currentEl) this.currentEl.classList.remove('is-active');

    const transition = this.config?.carousel?.transitionMs || 900;
    const prev = this.currentEl;
    setTimeout(() => {
      if (prev && prev.parentNode) prev.remove();
      nextEl.classList.remove('is-enter');
    }, transition + 50);

    this.currentEl = nextEl;
    this.idx = i;
    this.lastTransitionAt = Date.now();
  }

  _skipTo(i) {
    const safe = ((i % this.queue.length) + this.queue.length) % this.queue.length;
    this._mount(safe);
    this._scheduleNext();
  }

  _startWatchdog() {
    const longest = Math.max(...Object.values(this._durations()), 11000);
    const limit = longest * 2.5;
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = setInterval(() => {
      const sinceLast = Date.now() - this.lastTransitionAt;
      if (sinceLast > limit) {
        console.warn('[carousel] watchdog tripped, reloading.');
        location.reload();
      }
    }, 30_000);
  }

  _handleVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearTimeout(this.timer);
      else { this.lastTransitionAt = Date.now(); this._scheduleNext(); }
    });
  }
}
