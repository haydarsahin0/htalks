/* =========================================================
   HTALKS · ortak yardımcılar
   (depolama, yarışmacılar, fotoğraflar, ses, konfeti)
   ========================================================= */
(function () {
  "use strict";

  const PREFIX = "htalks.";

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* yoksay */ }
    },
    del(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* yoksay */ }
    },
  };

  /* ---------------- Yarışmacılar ---------------- */
  const DEFAULT_HOSTS = [
    { name: "Hasan", color: "#ff4d5e", photo: "assets/img/hasan.jpg?v=202610221418" },
    { name: "Turan", color: "#38b6ff", photo: "assets/img/turan.jpg?v=202610221418" },
    { name: "Hilmi", color: "#ffc53d", photo: "assets/img/hilmi.jpg?v=202610221418" },
  ];

  function getHosts() {
    const saved = store.get("hosts", null);
    return DEFAULT_HOSTS.map((d, i) => {
      const s = saved && saved[i] ? saved[i] : {};
      return {
        name: (s.name || d.name).trim() || d.name,
        color: s.color || d.color,
        photo: d.photo,
      };
    });
  }
  function saveHosts(hosts) {
    store.set("hosts", hosts.map((h) => ({ name: h.name, color: h.color })));
  }

  /* ---------------- Yardımcılar ---------------- */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /** Yarışmacının yuvarlak profil resmi (fotoğraf yüklenmezse baş harfi) */
  function avatar(h, cls) {
    const letter = esc((h.name || "?")[0]);
    const img = h.photo ? `<img src="${esc(h.photo)}" alt="${esc(h.name)}" onerror="this.remove()">` : "";
    return `<span class="host-avatar ${h.photo ? "has-photo" : ""} ${cls || ""}" style="--c:${h.color}"><i>${letter}</i>${img}</span>`;
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function initials(name) {
    const parts = String(name).replace(/\(.*?\)/g, "").trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("tr");
    return (parts[0][0] + parts[parts.length - 1][0]).toLocaleUpperCase("tr");
  }

  // 4 basamaklı sayılar (ör. yıllar) noktasız yazılır: 1987, 1311
  function fmt(n) {
    if (n == null || isNaN(n)) return "–";
    return Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2, useGrouping: Math.abs(n) >= 10000 });
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function flag(code) {
    if (!code) return "";
    return `<img src="https://flagcdn.com/w80/${esc(code)}.png" alt="" loading="lazy" onerror="this.style.display='none'">`;
  }

  /* ---------------- Fotoğraflar (Wikipedia) ----------------
     Fotoğraflar tarayıcıda Wikipedia API'sinden çekilir ve
     yerel olarak önbelleğe alınır. Bulunamazsa baş harfler gösterilir.
     Bir fotoğrafı elle değiştirmek için: setPhotoOverride(anahtar, url) */
  const PHOTO_CACHE_KEY = "photoCache.v3";
  const photoCache = store.get(PHOTO_CACHE_KEY, {});
  const photoOverrides = store.get("photoOverrides", {});
  const inflight = {};
  const ONE_DAY = 24 * 60 * 60 * 1000;

  async function wikiQuery(lang, params) {
    const base = `https://${lang}.wikipedia.org/w/api.php`;
    const qs = new URLSearchParams(Object.assign({
      action: "query",
      format: "json",
      origin: "*",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: "640",
      redirects: "1",
    }, params));
    const res = await fetch(`${base}?${qs.toString()}`);
    if (!res.ok) throw new Error("wiki " + res.status);
    const data = await res.json();
    const pages = data && data.query && data.query.pages ? Object.values(data.query.pages) : [];
    pages.sort((a, b) => (a.index || 0) - (b.index || 0));
    // Logo, arma ve diziliş şemaları genelde SVG/PNG'dir; sadece fotoğrafları al
    const isPhoto = (u) => !/\.(svg|png|gif)(\/|$|\?)/i.test(u) && !/\.svg\.png/i.test(u);
    const hit = pages.find((p) => p.thumbnail && p.thumbnail.source && isPhoto(p.thumbnail.source));
    return hit ? hit.thumbnail.source : null;
  }

  async function resolvePhoto(key, name) {
    // 1) İngilizce Wikipedia, verilen başlık
    try {
      const u = await wikiQuery("en", { titles: key.replace(/ /g, "_") });
      if (u) return u;
    } catch (e) { /* devam */ }
    // 2) İngilizce Wikipedia araması
    try {
      const u = await wikiQuery("en", { generator: "search", gsrsearch: `${name} footballer`, gsrlimit: "3", gsrnamespace: "0" });
      if (u) return u;
    } catch (e) { /* devam */ }
    // 3) Türkçe Wikipedia araması
    try {
      const u = await wikiQuery("tr", { generator: "search", gsrsearch: `${name} futbolcu`, gsrlimit: "3", gsrnamespace: "0" });
      if (u) return u;
    } catch (e) { /* devam */ }
    return null;
  }

  function getPhoto(key, name) {
    if (!key) return Promise.resolve(null);
    if (photoOverrides[key]) return Promise.resolve(photoOverrides[key]);
    const c = photoCache[key];
    if (c && (c.u || Date.now() - c.t < ONE_DAY)) return Promise.resolve(c.u || null);
    if (inflight[key]) return inflight[key];
    inflight[key] = resolvePhoto(key, name || key)
      .then((u) => {
        photoCache[key] = { u: u || "", t: Date.now() };
        store.set(PHOTO_CACHE_KEY, photoCache);
        return u;
      })
      .catch(() => null)
      .finally(() => { delete inflight[key]; });
    return inflight[key];
  }

  function setPhotoOverride(key, url) {
    if (url) photoOverrides[key] = url; else delete photoOverrides[key];
    store.set("photoOverrides", photoOverrides);
  }

  /** Fotoğraf kutusu HTML'i. key = Wikipedia başlığı, name = görünen isim */
  function photoHTML(key, name, cls) {
    return `<div class="photo loading ${cls || ""}" data-photo="${esc(key || "")}" data-name="${esc(name || "")}">
      <span class="initials">${esc(initials(name || "?"))}</span>
      <img alt="${esc(name || "")}" referrerpolicy="no-referrer">
    </div>`;
  }

  function hydratePhotos(root) {
    $$(".photo[data-photo]:not([data-hydrated])", root).forEach((el) => {
      el.setAttribute("data-hydrated", "1");
      const key = el.getAttribute("data-photo");
      const name = el.getAttribute("data-name");
      const img = el.querySelector("img");
      if (!key) { el.classList.remove("loading"); return; }
      getPhoto(key, name).then((url) => {
        if (!url) { el.classList.remove("loading"); return; }
        img.onload = () => { el.classList.remove("loading"); el.classList.add("loaded"); };
        img.onerror = () => { el.classList.remove("loading"); };
        img.src = url;
      });
    });
  }

  function preloadPhoto(key, name) {
    getPhoto(key, name).then((u) => { if (u) { const i = new Image(); i.referrerPolicy = "no-referrer"; i.src = u; } });
  }

  /* ---------------- Ses efektleri (WebAudio, dosya yok) ---------------- */
  let audioCtx = null;
  let muted = store.get("muted", false);

  function ctx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, dur, opts) {
    if (muted) return;
    const ac = ctx();
    if (!ac) return;
    const o = Object.assign({ type: "sine", vol: 0.18, delay: 0, slide: 0 }, opts || {});
    const t0 = ac.currentTime + o.delay;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = o.type;
    osc.frequency.setValueAtTime(freq, t0);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + o.slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(o.vol, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol, delay) {
    if (muted) return;
    const ac = ctx();
    if (!ac) return;
    const t0 = ac.currentTime + (delay || 0);
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    const src = ac.createBufferSource();
    const g = ac.createGain();
    const f = ac.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 900;
    g.gain.value = vol || 0.4;
    src.buffer = buf;
    src.connect(f).connect(g).connect(ac.destination);
    src.start(t0);
  }

  const sfx = {
    click() { tone(660, 0.06, { type: "square", vol: 0.05 }); },
    lock() { tone(520, 0.08, { type: "triangle", vol: 0.15 }); tone(780, 0.12, { type: "triangle", vol: 0.15, delay: 0.07 }); },
    bid() { tone(880, 0.09, { type: "triangle", vol: 0.16 }); tone(1320, 0.1, { type: "sine", vol: 0.08, delay: 0.04 }); },
    tick() { tone(1000, 0.05, { type: "square", vol: 0.06 }); },
    going(n) { tone(440 + n * 110, 0.25, { type: "sawtooth", vol: 0.08 }); },
    hammer() { noise(0.35, 0.6); tone(120, 0.35, { type: "sine", vol: 0.4, slide: -60 }); },
    whoosh() { noise(0.4, 0.15); tone(300, 0.35, { type: "sine", vol: 0.05, slide: 600 }); },
    reveal() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, { type: "triangle", vol: 0.14, delay: i * 0.08 })); },
    wrong() { tone(220, 0.25, { type: "sawtooth", vol: 0.08, slide: -80 }); },
    win() {
      const notes = [523, 659, 784, 1046, 784, 1046, 1318];
      notes.forEach((f, i) => tone(f, i === notes.length - 1 ? 0.7 : 0.16, { type: "triangle", vol: 0.16, delay: i * 0.12 }));
    },
  };

  function isMuted() { return muted; }
  function setMuted(v) { muted = !!v; store.set("muted", muted); }

  /* ---------------- Konfeti ---------------- */
  let confettiCanvas = null;
  let confettiParts = [];
  let confettiRAF = null;

  function confetti(colors, amount) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!confettiCanvas) {
      confettiCanvas = document.createElement("canvas");
      confettiCanvas.id = "confetti";
      document.body.appendChild(confettiCanvas);
    }
    const c = confettiCanvas;
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr;
    c.height = innerHeight * dpr;
    const cols = colors && colors.length ? colors : ["#00e58f", "#ffc93c", "#38b6ff", "#ff4d5e", "#ffffff"];
    const n = amount || 160;
    for (let i = 0; i < n; i++) {
      const fromLeft = i % 2 === 0;
      confettiParts.push({
        x: (fromLeft ? 0.05 : 0.95) * c.width,
        y: c.height * 0.75,
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 12) * dpr,
        vy: -(14 + Math.random() * 16) * dpr,
        w: (6 + Math.random() * 8) * dpr,
        h: (8 + Math.random() * 10) * dpr,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: cols[Math.floor(Math.random() * cols.length)],
        life: 0,
      });
    }
    if (!confettiRAF) loop();
    function loop() {
      const g = c.getContext("2d");
      g.clearRect(0, 0, c.width, c.height);
      confettiParts.forEach((p) => {
        p.life++;
        p.vy += 0.45 * dpr;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.r);
        g.fillStyle = p.color;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life * 0.1)));
        g.restore();
      });
      confettiParts = confettiParts.filter((p) => p.y < c.height + 50 && p.life < 400);
      if (confettiParts.length) confettiRAF = requestAnimationFrame(loop);
      else { confettiRAF = null; g.clearRect(0, 0, c.width, c.height); }
    }
  }

  /* ---------------- Sayaç animasyonu ---------------- */
  function countUp(el, target, duration, decimals) {
    const start = performance.now();
    const d = duration || 1200;
    const dec = decimals || 0;
    return new Promise((resolve) => {
      function step(now) {
        const t = Math.min(1, (now - start) / d);
        const e = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * e).toLocaleString("tr-TR", { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: Math.abs(target) >= 10000 });
        if (t < 1) requestAnimationFrame(step);
        else { el.textContent = fmt(target); resolve(); }
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------------- Bildirim ---------------- */
  let toastEl = null;
  let toastTimer = null;
  function toast(msg, ms) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms || 2200);
  }

  /* ---------------- Üst bar butonları ---------------- */
  const ICONS = {
    soundOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>',
    full: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  };

  function initTopbar() {
    const sound = $("#btn-sound");
    if (sound) {
      const render = () => { sound.innerHTML = muted ? ICONS.soundOff : ICONS.soundOn; sound.title = muted ? "Sesi aç" : "Sesi kapat"; };
      render();
      sound.addEventListener("click", () => { setMuted(!muted); render(); if (!muted) sfx.click(); });
    }
    const full = $("#btn-full");
    if (full) {
      full.innerHTML = ICONS.full;
      full.title = "Tam ekran (F)";
      full.addEventListener("click", toggleFullscreen);
    }
    document.addEventListener("keydown", (e) => {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    });
    // Yarışmacı renklerini CSS değişkenlerine yaz
    getHosts().forEach((h, i) => document.documentElement.style.setProperty(`--p${i + 1}`, h.color));
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen && document.exitFullscreen();
  }

  window.HT = {
    store, getHosts, saveHosts, avatar, esc, shuffle, initials, fmt, $, $$, flag,
    getPhoto, photoHTML, hydratePhotos, preloadPhoto, setPhotoOverride,
    sfx, isMuted, setMuted, confetti, countUp, toast, initTopbar, ICONS,
  };

  document.addEventListener("DOMContentLoaded", initTopbar);
})();
