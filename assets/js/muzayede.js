/* =========================================================
   OYUN 2 · KÖR MÜZAYEDE
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, store, sfx } = HT;

  const STATE_KEY = "muzayede.state";
  const PREFS_KEY = "muzayede.prefs";
  const POOLS = [
    { id: "karisik", label: "Karışık" },
    { id: "efsane", label: "Efsaneler" },
    { id: "yildiz", label: "Günümüz Yıldızları" },
    { id: "turk", label: "Türk Futbolu" },
  ];
  const BUDGETS = [30, 50, 100];
  const SIZES = [4, 5, 6];
  const POS_ORDER = ["FV", "OS", "DF", "KL"];
  const KEYS = [["1", "q"], ["2", "w"], ["3", "e"]]; // [+1, +5] tuşları
  const STEPS = [1, 2, 5, 10];

  let hosts = HT.getHosts();
  let prefs = Object.assign({ pool: "karisik", budget: 50, size: 5, balanced: true }, store.get(PREFS_KEY, {}));
  let state = null;
  let undoStack = [];
  let goingTimer = null;
  let goingStep = 0;
  let freshSlot = null; // yeni satılan futbolcunun kutusu animasyonla gelsin

  /* ---------------- Kurulum ---------------- */
  function poolPlayers(id) {
    const all = window.FOOTBALLERS;
    return id === "karisik" ? all : all.filter((p) => p.g.includes(id));
  }

  function renderSetup() {
    $("#pool-seg").innerHTML = POOLS.map((p) => `<button type="button" data-pool="${p.id}" class="${prefs.pool === p.id ? "on" : ""}">${p.label}</button>`).join("");
    $("#budget-seg").innerHTML = BUDGETS.map((b) => `<button type="button" data-budget="${b}" class="${prefs.budget === b ? "on" : ""}">${b} coin</button>`).join("");
    $("#size-seg").innerHTML = SIZES.map((s) => `<button type="button" data-size="${s}" class="${prefs.size === s ? "on" : ""}">${s} futbolcu</button>`).join("");
    $("#balanced").checked = !!prefs.balanced;
    const total = hosts.length * prefs.size;
    $("#pool-info").textContent = `Bu havuzda ${poolPlayers(prefs.pool).length} futbolcu var; her müzayedede rastgele ${total} tanesi gelir.`;
    $("#r-budget").textContent = prefs.budget;
    $("#r-size").textContent = prefs.size;
    const saved = store.get(STATE_KEY, null);
    $("#btn-resume").classList.toggle("hidden", !(saved && saved.phase !== "done"));
  }

  $("#setup").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-pool],button[data-budget],button[data-size]");
    if (!b) return;
    if (b.dataset.pool) prefs.pool = b.dataset.pool;
    if (b.dataset.budget) prefs.budget = +b.dataset.budget;
    if (b.dataset.size) prefs.size = +b.dataset.size;
    store.set(PREFS_KEY, prefs);
    sfx.click();
    renderSetup();
  });
  $("#balanced").addEventListener("change", (e) => { prefs.balanced = e.target.checked; store.set(PREFS_KEY, prefs); });
  $("#btn-start").addEventListener("click", startAuction);
  $("#btn-resume").addEventListener("click", () => {
    state = store.get(STATE_KEY, null);
    if (!state) return;
    undoStack = [];
    showScreen(state.phase === "done" ? "final" : "game");
    if (state.phase === "done") renderFinal(); else renderAll();
  });
  $("#btn-menu").addEventListener("click", () => {
    if (state && state.phase !== "done" && !confirm("Kurulum ekranına dönülsün mü? Müzayede kaydedildi, sonra devam edebilirsin.")) return;
    cancelGoing();
    showScreen("setup");
    renderSetup();
  });

  function showScreen(name) {
    ["setup", "game", "final"].forEach((s) => $("#" + s).classList.toggle("hidden", s !== name));
    $("#btn-menu").classList.toggle("hidden", name === "setup");
    window.scrollTo({ top: 0 });
  }

  /* ---------------- Kart destesi ---------------- */
  function drawLots(total, nTeams) {
    const pool = HT.shuffle(poolPlayers(prefs.pool));
    if (!prefs.balanced) return pool.slice(0, total);
    // Hedef: her takıma 1 kaleci, kalanlar DF / OS / FV arasında eşit
    const want = { KL: nTeams };
    const rest = total - nTeams;
    const base = Math.floor(rest / 3);
    want.DF = base; want.OS = base; want.FV = base;
    let extra = rest - base * 3;
    ["FV", "OS", "DF"].forEach((p) => { if (extra > 0) { want[p]++; extra--; } });
    const picked = [];
    Object.keys(want).forEach((pos) => {
      picked.push(...pool.filter((p) => p.p === pos).slice(0, want[pos]));
    });
    // Havuzda yeterli yoksa geri kalanla tamamla
    if (picked.length < total) picked.push(...pool.filter((p) => !picked.includes(p)).slice(0, total - picked.length));
    return HT.shuffle(picked).slice(0, total);
  }

  function startAuction() {
    hosts = HT.getHosts();
    const total = hosts.length * prefs.size;
    state = {
      budget: prefs.budget,
      size: prefs.size,
      lots: drawLots(total, hosts.length),
      idx: 0,
      open: false,
      sold: false,
      bid: null, // { amt, who }
      coins: hosts.map(() => prefs.budget),
      squads: hosts.map(() => []),
      crowned: null,
      phase: "auction",
    };
    undoStack = [];
    save();
    sfx.whoosh();
    showScreen("game");
    renderAll();
  }

  function save() { store.set(STATE_KEY, state); }
  function snapshot() {
    undoStack.push(JSON.stringify(state));
    if (undoStack.length > 40) undoStack.shift();
  }

  /* ---------------- Kurallar ---------------- */
  const slotsLeft = (i) => state.size - state.squads[i].length;
  // Kadroyu doldurabilmek için her boş yer için 1 coin ayrılır
  const maxBid = (i) => (slotsLeft(i) <= 0 ? 0 : state.coins[i] - (slotsLeft(i) - 1));
  const minNext = () => (state.bid ? state.bid.amt + 1 : 1);
  const canBid = (i, amt) => slotsLeft(i) > 0 && amt <= maxBid(i) && amt >= minNext() && !(state.bid && state.bid.who === i);
  const eligible = () => hosts.map((_, i) => i).filter((i) => slotsLeft(i) > 0);
  const current = () => state.lots[state.idx];

  /* ---------------- Çizim ---------------- */
  function renderAll() {
    hosts = HT.getHosts();
    renderLotHead();
    renderCard();
    renderBid();
    renderBidders();
    renderControls();
  }

  function renderLotHead() {
    const total = state.lots.length;
    $("#lot-no").innerHTML = `KART <b>${Math.min(state.idx + 1, total)}</b> / ${total}`;
    $("#lot-progress").innerHTML = state.lots.map((_, i) => `<i class="${i < state.idx ? "done" : i === state.idx ? "cur" : ""}"></i>`).join("");
  }

  function renderCard() {
    const p = current();
    const flip = $("#flip");
    if (!p) return;
    $("#card-front").innerHTML = `
      ${HT.photoHTML(p.w, p.n)}
      <div class="shade"></div>
      <div class="pos-badge"><span class="pos">${esc(p.p)}</span><span class="flag">${HT.flag(p.c)}</span></div>
      <button class="icon-btn photo-edit" id="photo-edit" title="Fotoğrafı değiştir">📷</button>
      <div class="info">
        <div class="name">${esc(p.n)}</div>
        <div class="tagline">${esc(p.t || "")}</div>
        <span class="pos-full">${esc(window.POSITIONS[p.p] || p.p)}</span>
      </div>`;
    HT.hydratePhotos($("#card-front"));
    flip.classList.toggle("open", state.open);
    const stamp = $("#sold-stamp");
    if (state.sold && state.bid) {
      const h = hosts[state.bid.who];
      stamp.style.setProperty("--c", h.color);
      stamp.querySelector("span").innerHTML = `${esc(h.name)} · ${state.bid.amt}`;
      stamp.classList.add("show");
    } else stamp.classList.remove("show");
    // Sıradaki kartın fotoğrafını önden yükle
    const nxt = state.lots[state.idx + 1];
    if (nxt) HT.preloadPhoto(nxt.w, nxt.n);

    const left = state.lots.length - state.idx - 1;
    const el = eligible();
    let hint = `<span>${left > 0 ? `Sırada ${left} kapalı kart var` : "Son kart!"}</span>`;
    if (el.length === 1 && !state.sold) hint += `<span style="color:${hosts[el[0]].color};font-weight:800">Tek alıcı: ${esc(hosts[el[0]].name)}</span>`;
    $("#next-hint").innerHTML = hint;
  }

  function renderBid() {
    const d = $("#bid-display");
    if (!state.open) {
      d.style.setProperty("--c", "var(--muted)");
      d.innerHTML = `<div><div class="l">Kart kapalı</div><div class="who" style="color:var(--text)">Sıradaki futbolcu kim?</div></div><div class="amt">?</div>`;
      return;
    }
    if (!state.bid) {
      d.style.setProperty("--c", "var(--gold)");
      d.innerHTML = `<div><div class="l">Açılış fiyatı</div><div class="who">Teklif bekleniyor…</div></div><div class="amt">1<small>coin</small></div>`;
      return;
    }
    const h = hosts[state.bid.who];
    d.style.setProperty("--c", h.color);
    d.innerHTML = `<div><div class="l">${state.sold ? "Satıldı" : "En yüksek teklif"}</div><div class="who">${esc(h.name)}</div></div><div class="amt">${state.bid.amt}<small>coin</small></div>`;
  }

  function renderBidders() {
    $("#bidders").innerHTML = hosts.map((h, i) => {
      const left = slotsLeft(i);
      const full = left <= 0;
      const leading = state.bid && state.bid.who === i && state.open;
      const slots = [];
      for (let k = 0; k < state.size; k++) {
        const s = state.squads[i][k];
        slots.push(s
          ? `<div class="slot filled ${freshSlot && freshSlot[0] === i && freshSlot[1] === k ? "fresh" : ""}"><span class="sp">${esc(s.p.p)}</span>${HT.photoHTML(s.p.w, s.p.n)}<span class="sn">${esc(s.p.n)}</span><span class="pr">${s.price}</span></div>`
          : `<div class="slot"><span class="empty">${k + 1}</span></div>`);
      }
      const active = state.open && !state.sold;
      const mx = maxBid(i);
      return `
      <div class="bidder ${leading ? "leading" : ""} ${full ? "full" : ""}" style="--c:${h.color}" data-bidder="${i}">
        <div class="bidder-head">
          <span class="host-avatar" style="--c:${h.color}">${esc(h.name[0])}</span>
          <div class="nm">${esc(h.name)}</div>
          <div class="kbd-hint">${KEYS[i] ? `<kbd>${KEYS[i][0]}</kbd> +1 · <kbd>${KEYS[i][1].toUpperCase()}</kbd> +5` : ""}</div>
          <div class="coins"><span class="v">${state.coins[i]}<small>c</small></span><span class="s">coin<br>kaldı</span></div>
        </div>
        <div class="squad-slots">${slots.join("")}</div>
        <div class="bid-ctrl">
          ${full ? `<div class="maxinfo" style="font-size:14px"><b>Kadro tamam ✓</b></div>` : `
          <div class="bid-btns">${STEPS.map((s) => {
            const amt = state.bid ? state.bid.amt + s : s;
            return `<button data-bid="${i}" data-amt="${amt}" ${active && canBid(i, amt) ? "" : "disabled"}>+${s}</button>`;
          }).join("")}</div>
          <div class="bid-custom">
            <input class="field" type="number" min="1" max="${mx}" placeholder="${minNext()}" data-custom="${i}" ${active ? "" : "disabled"} aria-label="${esc(h.name)} özel teklif">
            <button class="btn btn-sm" style="--c:${h.color}" data-custom-go="${i}" ${active ? "" : "disabled"}>Teklif</button>
          </div>
          <div class="maxinfo">Maks. teklif: <b>${mx}</b> · ${left} boş yer</div>`}
        </div>
      </div>`;
    }).join("");
    HT.hydratePhotos($("#bidders"));
    freshSlot = null;
  }

  function renderControls() {
    const hammer = $("#btn-hammer");
    const pass = $("#btn-pass");
    if (!state.open) {
      hammer.innerHTML = `Kartı Aç <kbd>Boşluk</kbd>`;
      hammer.disabled = false;
    } else if (state.sold) {
      const last = state.idx >= state.lots.length - 1;
      hammer.innerHTML = last ? `Kadroları Göster <kbd>Boşluk</kbd>` : `Sıradaki Kart <kbd>Boşluk</kbd>`;
      hammer.disabled = false;
    } else {
      hammer.innerHTML = `Çekici Vur <kbd>Boşluk</kbd>`;
      hammer.disabled = !state.bid;
    }
    const canPass = state.open && !state.sold && !state.bid && state.idx < state.lots.length - 1;
    pass.disabled = !canPass;
    $("#btn-undo").disabled = !undoStack.length;
  }

  /* ---------------- Aksiyonlar ---------------- */
  function openCard() {
    if (state.open) return;
    snapshot();
    state.open = true;
    // Tek alıcı kaldıysa açılış teklifini otomatik ver
    const el = eligible();
    if (el.length === 1) state.bid = { amt: 1, who: el[0] };
    save();
    sfx.whoosh();
    setTimeout(() => sfx.reveal(), 350);
    renderAll();
  }

  function placeBid(i, amt) {
    if (!state.open || state.sold) return;
    if (state.bid && state.bid.who === i) { HT.toast(`${hosts[i].name} zaten önde`); return; }
    if (slotsLeft(i) <= 0) { HT.toast(`${hosts[i].name}'in kadrosu dolu`); return; }
    if (amt < minNext()) { HT.toast(`Teklif en az ${minNext()} olmalı`); return; }
    if (amt > maxBid(i)) { HT.toast(`${hosts[i].name} en fazla ${maxBid(i)} verebilir`); return; }
    snapshot();
    cancelGoing();
    state.bid = { amt, who: i };
    save();
    sfx.bid();
    renderBid();
    renderBidders();
    renderControls();
    const d = $("#bid-display");
    d.classList.remove("flash"); void d.offsetWidth; d.classList.add("flash");
  }

  function startGoing() {
    if (!state.open || state.sold || !state.bid || goingTimer) return;
    const words = ["Gidiyor…", "Gidiyor…", "SATILDI!"];
    goingStep = 0;
    const show = () => {
      const g = $("#going");
      const t = $("#going-text");
      t.textContent = words[goingStep];
      t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
      t.style.color = goingStep === 2 ? hosts[state.bid.who].color : "#fff";
      g.classList.add("show");
      if (goingStep < 2) sfx.going(goingStep);
    };
    show();
    goingTimer = setInterval(() => {
      goingStep++;
      if (goingStep === 2) { show(); sell(); }
      else if (goingStep > 2) { cancelGoing(); }
      else show();
    }, 900);
  }

  function cancelGoing() {
    if (goingTimer) { clearInterval(goingTimer); goingTimer = null; }
    $("#going").classList.remove("show");
  }

  function sell() {
    if (!state.bid || state.sold) return;
    snapshot();
    const { who, amt } = state.bid;
    state.coins[who] -= amt;
    state.squads[who].push({ p: current(), price: amt });
    freshSlot = [who, state.squads[who].length - 1];
    state.sold = true;
    save();
    sfx.hammer();
    HT.confetti([hosts[who].color, "#ffc93c"], 70);
    renderAll();
  }

  function nextLot() {
    if (!state.sold) return;
    cancelGoing();
    snapshot();
    state.idx++;
    state.open = false;
    state.sold = false;
    state.bid = null;
    if (state.idx >= state.lots.length || eligible().length === 0) {
      state.phase = "done";
      save();
      showScreen("final");
      renderFinal();
      sfx.win();
      HT.confetti(null, 200);
      return;
    }
    save();
    sfx.click();
    renderAll();
  }

  function passLot() {
    if (!state.open || state.sold || state.bid || state.idx >= state.lots.length - 1) return;
    snapshot();
    const [lot] = state.lots.splice(state.idx, 1);
    state.lots.push(lot);
    state.open = false;
    save();
    sfx.whoosh();
    HT.toast(`${lot.n} destenin sonuna gitti`);
    renderAll();
  }

  function undo() {
    if (!undoStack.length) { HT.toast("Geri alınacak bir şey yok"); return; }
    cancelGoing();
    state = JSON.parse(undoStack.pop());
    save();
    sfx.click();
    if (state.phase === "done") { showScreen("final"); renderFinal(); }
    else { showScreen("game"); renderAll(); }
  }

  function primary() {
    if (!state || state.phase === "done") return;
    if (!state.open) openCard();
    else if (state.sold) nextLot();
    else if (state.bid) { if (goingTimer) return; startGoing(); }
    else HT.toast("Önce biri teklif vermeli");
  }

  $("#btn-hammer").addEventListener("click", primary);
  $("#card-back").addEventListener("click", openCard);
  $("#btn-pass").addEventListener("click", passLot);
  $("#btn-undo").addEventListener("click", undo);

  $("#bidders").addEventListener("click", (e) => {
    const b = e.target.closest("[data-bid]");
    if (b && !b.disabled) { placeBid(+b.dataset.bid, +b.dataset.amt); return; }
    const c = e.target.closest("[data-custom-go]");
    if (c) {
      const i = +c.dataset.customGo;
      const input = $(`[data-custom="${i}"]`);
      const v = parseInt(input.value, 10);
      if (!v) { input.focus(); return; }
      placeBid(i, v);
    }
  });
  $("#bidders").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.dataset.custom != null) {
      e.preventDefault();
      const i = +e.target.dataset.custom;
      const v = parseInt(e.target.value, 10);
      if (v) placeBid(i, v);
    }
  });

  $("#card-front").addEventListener("click", (e) => {
    if (!e.target.closest("#photo-edit")) return;
    const p = current();
    const url = prompt(`${p.n} için fotoğraf adresi (URL) yapıştır.\nBoş bırakırsan otomatik fotoğrafa döner.`, "");
    if (url === null) return;
    HT.setPhotoOverride(p.w, url.trim());
    renderCard();
    renderBidders();
  });

  document.addEventListener("keydown", (e) => {
    if (!state || $("#game").classList.contains("hidden")) return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.key === " " || e.key === "Enter") {
      if (e.target && e.target.tagName === "BUTTON" && e.target.id !== "btn-hammer") return;
      e.preventDefault();
      primary();
      return;
    }
    if (k === "z") { undo(); return; }
    KEYS.forEach(([one, five], i) => {
      if (i >= hosts.length) return;
      if (k === one || k === five) {
        const step = k === one ? 1 : 5;
        placeBid(i, state.bid ? state.bid.amt + step : step);
      }
    });
  });

  /* ---------------- Final: kadrolar ---------------- */
  function renderFinal() {
    hosts = HT.getHosts();
    const sq = state.squads;
    $("#final").innerHTML = `
      <div class="final-head">
        <span class="eyebrow" style="color:var(--gold)"><span class="dot"></span> Müzayede bitti</span>
        <h1>Kadrolar Hazır</h1>
        <p>Söz seyircide: en iyi kadro hangisi? Chat'in kararını aşağıdan taçlandır.</p>
      </div>
      <div class="squads">
        ${hosts.map((h, i) => squadHTML(h, i, sq[i])).join("")}
      </div>
      <div class="row" style="justify-content:center;margin-top:28px">
        <button class="btn btn-ghost" id="f-copy">📋 Kadroları kopyala (chat / anket için)</button>
        <button class="btn btn-ghost" id="f-undo">↶ Müzayedeye geri dön</button>
        <button class="btn btn-gold btn-lg" id="f-new">Yeni Müzayede</button>
        <a class="btn btn-ghost" href="tahmin.html">Yaklaş Kazan'a geç →</a>
      </div>`;
    HT.hydratePhotos($("#final"));
    $("#f-new").addEventListener("click", () => { store.del(STATE_KEY); showScreen("setup"); renderSetup(); });
    $("#f-undo").addEventListener("click", () => { if (undoStack.length) undo(); else HT.toast("Geri alınacak bir şey yok"); });
    $("#f-copy").addEventListener("click", copySummary);
    $("#final").querySelectorAll("[data-crown]").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.crown;
      state.crowned = state.crowned === i ? null : i;
      save();
      renderFinal();
      if (state.crowned != null) {
        sfx.win();
        HT.confetti([hosts[i].color, "#ffc93c", "#ffffff"], 220);
      }
    }));
  }

  function squadHTML(h, i, squad) {
    const spent = squad.reduce((a, s) => a + s.price, 0);
    const rows = POS_ORDER.map((pos) => squad.filter((s) => s.p.p === pos)).filter((r) => r.length);
    const crowned = state.crowned === i;
    let delay = 0;
    return `
    <div class="squad ${crowned ? "crowned" : ""}" style="--c:${h.color}">
      <div class="squad-head">
        <span class="host-avatar" style="--c:${h.color}">${esc(h.name[0])}</span>
        <div class="nm">${esc(h.name)}${crowned ? " · ŞAMPİYON" : ""}</div>
        <div class="meta">HARCANAN<b>${spent} / ${state.budget}</b></div>
      </div>
      <div class="pitch">
        <div class="box-top"></div><div class="box-bot"></div>
        ${rows.map((r) => `<div class="pitch-row">${r.map((s) => {
          delay += 0.08;
          return `<div class="pp" style="animation-delay:${delay}s;width:calc(${100 / Math.max(3, r.length)}% - 6px)">
            ${HT.photoHTML(s.p.w, s.p.n)}
            <span class="n">${esc(s.p.n)}</span><span class="pr">${s.price} coin</span>
          </div>`;
        }).join("")}</div>`).join("")}
      </div>
      <div class="squad-foot">
        <button class="btn ${crowned ? "btn-gold" : "btn-ghost"} vote-btn" data-crown="${i}" style="--c:${h.color}">${crowned ? "👑 Seyircinin seçimi" : "👑 Seyirci bunu seçti"}</button>
      </div>
    </div>`;
  }

  function copySummary() {
    const lines = ["HTALKS · KÖR MÜZAYEDE KADROLARI", ""];
    hosts.forEach((h, i) => {
      const sq = state.squads[i];
      lines.push(`${h.name.toLocaleUpperCase("tr")}${state.crowned === i ? " 👑" : ""}: ` + sq.map((s) => `${s.p.n} (${s.price})`).join(", "));
    });
    lines.push("", "En iyi kadro hangisi? Yorumlara yaz!");
    const text = lines.join("\n");
    const done = () => HT.toast("Kadrolar panoya kopyalandı");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) { HT.toast("Kopyalanamadı"); }
    ta.remove();
  }

  renderSetup();
})();
