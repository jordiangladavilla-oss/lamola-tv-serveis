// Loads services.json and config.json, polls for updates, emits events.

const EVENT_LOADED = 'data:loaded';
const EVENT_UPDATED = 'data:updated';
const EVENT_ERROR = 'data:error';

export class DataLoader extends EventTarget {
  constructor({ servicesUrl = 'services.json', configUrl = 'config.json' } = {}) {
    super();
    this.servicesUrl = servicesUrl;
    this.configUrl = configUrl;
    this.services = null;
    this.config = null;
    this._timer = null;
  }

  async load() {
    try {
      const [services, config] = await Promise.all([
        this._fetch(this.servicesUrl),
        this._fetch(this.configUrl)
      ]);
      this.services = services;
      this.config = config;
      this.dispatchEvent(new CustomEvent(EVENT_LOADED, { detail: { services, config } }));
      return { services, config };
    } catch (err) {
      console.error('[data] initial load failed', err);
      this.dispatchEvent(new CustomEvent(EVENT_ERROR, { detail: err }));
      throw err;
    }
  }

  startPolling(intervalMs) {
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this._poll(), intervalMs);
  }

  async _poll() {
    try {
      const services = await this._fetch(this.servicesUrl);
      if (!this.services || services.version !== this.services.version) {
        console.log('[data] version change detected, updating', this.services?.version, '→', services.version);
        this.services = services;
        // Also refresh config in case slide timing changed
        try { this.config = await this._fetch(this.configUrl); } catch (_) {}
        this.dispatchEvent(new CustomEvent(EVENT_UPDATED, { detail: { services: this.services, config: this.config } }));
      }
    } catch (err) {
      console.warn('[data] poll failed', err);
    }
  }

  async _fetch(url) {
    const bust = `?t=${Date.now()}`;
    const res = await fetch(url + bust, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
    return res.json();
  }
}

DataLoader.EVENT_LOADED = EVENT_LOADED;
DataLoader.EVENT_UPDATED = EVENT_UPDATED;
DataLoader.EVENT_ERROR = EVENT_ERROR;
