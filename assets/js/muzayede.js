/* =========================================================
   OYUN 2 · KÖR MÜZAYEDE
   Sırayla teklif: sırası gelen ya artırır ya pas der.
   Her kartta ilk söz hakkı bir sonraki kişiye geçer.
   Tüm girişler tek bilgisayardan (Hasan) yapılır.
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, store, sfx } = HT;

  const STATE_KEY = "muzayede.state.v2";
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
  const STEPS = [1, 2, 5, 10];

  let hosts = HT.getHosts();
  let prefs = Object.assign({ pool: "karisik", budget: 50, size: 5, balanced: true }, store.get(PREFS_KEY, {}));
  let state = null;
  let undoStack = [];
  let goingTimer = null;
  let freshSlot = null;

  /* ---------------- Kurulum ---------------- */
  const poolPlayers = (id) => (id === "karisik" ? window.FOOTBALLERS : window.FOOTBALLERS.filter((p) => p.g.includes(id)));

  function renderSetup() {
    hosts = HT.getHosts();
    $("#pool-seg").innerHTML = POOLS.map((p) => `<button type="button" data-pool="${p.id}" class="${prefs.pool === p.id ? "on" : ""}">${p.label} <span class="muted" style="font-weight:500">${poolPlayers(p.id).length}</span></button>`).join("");
    $("#budget-seg").innerHTML = BUDGETS.map((b) => `<button type="button" data-budget="${b}" class="${prefs.budget === b ? "on" : ""}">${b} coin</button>`).join("");
    $("#size-seg").innerHTML = SIZES.map((s) => `<button type="button" data-size="${s}" class="${prefs.size === s ? "on" : ""}">${s} futbolcu</button>`).join("");
    $("#balanced").checked = !!prefs.balanced;
    $("#pool-info").textContent = `Her müzayedede bu havuzdan rastgele ${hosts.length * prefs.size} futbolcu gelir.`;
    $("#r-budget").textContent = prefs.budget;
    $("#r-size").textContent = prefs.size;
    const saved = store.get(STATE_KEY, null);
    $("#btn-resume").classList.toggle("hidden", !saved);
    $("#btn-resume").textContent = saved && saved.phase === "done" ? "Son kadroları göster" : "Kaldığın yerden devam et";
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
    if (state.phase === "done") { showScreen("final"); renderFinal(); }
    else {
      // Yarım kalmış "gidiyor" sayımı varsa yeniden başlat
      showScreen("game"); renderAll();
      if (state.open && !state.sold && state.turn == null) finishBidding();
    }
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
    $("#btn-undo").classList.toggle("hidden", name === "setup");
  }

  /* ---------------- Deste ---------------- */
  function drawLots(total, nTeams) {
    const pool = HT.shuffle(poolPlayers(prefs.pool));
    if (!prefs.balanced) return pool.slice(0, total);
    const want = { KL: nTeams };
    const rest = total - nTeams;
    const base = Math.floor(rest / 3);
    want.DF = base; want.OS = base; want.FV = base;
    let extra = rest - base * 3;
    ["FV", "OS", "DF"].forEach((p) => { if (extra > 0) { want[p]++; extra--; } });
    const picked = [];
    Object.keys(want).forEach((pos) => picked.push(...pool.filter((p) => p.p === pos).slice(0, want[pos])));
    if (picked.length < total) picked.push(...pool.filter((p) => !picked.includes(p)).slice(0, total - picked.length));
    return HT.shuffle(picked).slice(0, total);
  }

  function startAuction() {
    hosts = HT.getHosts();
    state = {
      budget: prefs.budget, size: prefs.size,
      lots: drawLots(hosts.length * prefs.size, hosts.length).map((p) => Object.assign({}, p)),
      idx: 0, opened: 0,
      open: false, sold: false, bid: null, turn: null, starter: 0,
      passed: hosts.map(() => false),
      coins: hosts.map(() => prefs.budget),
      squads: hosts.map(() => []),
      crowned: null, phase: "auction",
    };
    undoStack = [];
    save();
    sfx.whoosh();
    showScreen("game");
    renderAll();
  }
  const save = () => store.set(STATE_KEY, state);
  function snapshot() { undoStack.push(JSON.stringify(state)); if (undoStack.length > 60) undoStack.shift(); }

  /* ---------------- Kurallar ---------------- */
  const N = () => hosts.length;
  const slotsLeft = (i) => state.size - state.squads[i].length;
  const maxBid = (i) => (slotsLeft(i) <= 0 ? 0 : state.coins[i] - (slotsLeft(i) - 1));
  const minNext = () => (state.bid ? state.bid.amt + 1 : 1);
  const eligible = () => hosts.map((_, i) => i).filter((i) => slotsLeft(i) > 0);
  const current = () => state.lots[state.idx];
  const canAct = (i) => slotsLeft(i) > 0 && !state.passed[i] && maxBid(i) >= minNext() && !(state.bid && state.bid.who === i);
  function findFrom(start, includeStart) {
    for (let k = includeStart ? 0 : 1; k <= N(); k++) {
      const j = (start + k) % N();
      if (k === N() && !includeStart) break;
      if (canAct(j)) return j;
    }
    return null;
  }
  // Sıradaki kartta ilk söz kimde?
  const nextStarter = () => state.opened % N();

  /* ---------------- Çizim ---------------- */
  function renderAll() {
    hosts = HT.getHosts();
    renderLot();
    renderBid();
    renderTurn();
    renderBidders();
  }

  function renderLot() {
    const total = state.lots.length;
    $("#lot-no").innerHTML = `KART <b>${Math.min(state.idx + 1, total)}</b> / ${total}`;
    $("#lot-progress").innerHTML = state.lots.map((_, i) => `<i class="${i < state.idx ? "done" : i === state.idx ? "cur" : ""}"></i>`).join("");
    const p = current();
    if (!p) return;
    $("#card-front").innerHTML = `
      ${HT.photoHTML(p.w, p.n)}
      <div class="shade"></div>
      <div class="pos-badge"><span class="pos">${esc(p.p)}</span>${HT.flag(p.c)}</div>
      <button class="icon-btn photo-edit" id="photo-edit" title="Fotoğrafı değiştir">📷</button>
      <div class="info">
        <div class="name">${esc(p.n)}</div>
        <div class="tagline">${esc(p.t || "")}${window.COUNTRIES[p.c] ? " · " + esc(window.COUNTRIES[p.c]) : ""}</div>
        <span class="pos-full">${esc(window.POSITIONS[p.p] || p.p)}</span>
      </div>`;
    HT.hydratePhotos($("#card-front"));
    $("#flip").classList.toggle("open", state.open);
    const stamp = $("#sold-stamp");
    if (state.sold && state.bid) {
      const h = hosts[state.bid.who];
      stamp.style.setProperty("--c", h.color);
      stamp.querySelector("span").textContent = `${h.name} · ${state.bid.amt}`;
      stamp.classList.add("show");
    } else stamp.classList.remove("show");
    const nxt = state.lots[state.idx + 1];
    if (nxt) HT.preloadPhoto(nxt.w, nxt.n);
    const left = state.lots.length - state.idx - 1;
    $("#lot-hint").innerHTML = `<span>${left > 0 ? `Destede ${left} kapalı kart` : "Son kart!"}</span><span>${p.passedOnce ? "Bu kart bir kez pas geçildi" : ""}</span>`;
  }

  function renderBid() {
    const d = $("#bid-display");
    if (!state.open) {
      d.style.setProperty("--c", "var(--muted)");
      d.innerHTML = `<div><div class="l">Kart kapalı</div><div class="who" style="color:var(--text)">Sıradaki futbolcu kim?</div></div><div class="amt">?</div>`;
    } else if (!state.bid) {
      d.style.setProperty("--c", "var(--gold)");
      d.innerHTML = `<div><div class="l">Açılış fiyatı</div><div class="who">Teklif bekleniyor…</div></div><div class="amt">1<small>coin</small></div>`;
    } else {
      const h = hosts[state.bid.who];
      d.style.setProperty("--c", h.color);
      d.innerHTML = `<div><div class="l">${state.sold ? "Satıldı" : "En yüksek teklif"}</div><div class="who">${esc(h.name)}</div></div><div class="amt">${state.bid.amt}<small>coin</small></div>`;
    }
  }

  function renderTurn() {
    const t = $("#turn");
    const last = state.idx >= state.lots.length - 1;
    if (!state.open) {
      const s = hosts[nextStarter()];
      const first = findStarterFor(nextStarter());
      t.className = "turn neutral";
      t.innerHTML = `
        <div class="who-big"><div><div class="lbl">Kart kapalı</div><div class="nm">Sıradaki kart</div><div class="sub">Bu kartta ilk söz: <b style="color:${hosts[first].color}">${esc(hosts[first].name)}</b></div></div></div>
        <div class="big-action"><button class="btn btn-xl btn-gold" data-act="open">Kartı Aç <kbd>Boşluk</kbd></button></div>`;
      return;
    }
    if (state.sold) {
      const h = hosts[state.bid.who];
      t.className = "turn";
      t.style.setProperty("--c", h.color);
      t.innerHTML = `
        <div class="who-big">${HT.avatar(h)}<div><div class="lbl">Satıldı</div><div class="nm">${esc(h.name)}</div><div class="sub"><b>${esc(current().n)}</b> · ${state.bid.amt} coin</div></div></div>
        <div class="big-action"><button class="btn btn-xl" style="--c:${h.color}" data-act="next">${last ? "Kadroları Göster" : "Sıradaki Kart"} <kbd>Boşluk</kbd></button></div>`;
      return;
    }
    if (state.turn == null) {
      t.className = "turn neutral";
      t.innerHTML = `<div class="who-big"><div><div class="lbl">Teklifler bitti</div><div class="nm">Gidiyor…</div><div class="sub">Geri almak için <kbd>Z</kbd></div></div></div>`;
      return;
    }
    const i = state.turn;
    const h = hosts[i];
    const mx = maxBid(i);
    t.className = "turn";
    t.style.setProperty("--c", h.color);
    t.innerHTML = `
      <div class="who-big">
        ${HT.avatar(h)}
        <div><div class="lbl">Sıra sende</div><div class="nm">${esc(h.name)}</div><div class="sub">Bütçe <b>${state.coins[i]}</b> · Maks. teklif <b>${mx}</b></div></div>
      </div>
      <div class="actions">
        ${STEPS.map((s, k) => {
          const amt = (state.bid ? state.bid.amt : 0) + s;
          return `<button class="raise" data-raise="${amt}" ${amt <= mx ? "" : "disabled"}>+${s}<small><kbd>${k + 1}</kbd> → ${amt}</small></button>`;
        }).join("")}
        <div class="custom"><input class="field" id="custom-bid" type="number" min="${minNext()}" max="${mx}" placeholder="${minNext()}–${mx}" aria-label="Özel teklif"><button data-act="custom">TEKLİF VER</button></div>
        <button class="pass-btn" data-act="pass">PAS<small><kbd>P</kbd></small></button>
      </div>`;
  }

  function findStarterFor(start) {
    for (let k = 0; k < N(); k++) { const j = (start + k) % N(); if (slotsLeft(j) > 0) return j; }
    return start;
  }

  function renderBidders() {
    const box = $("#bidders");
    box.innerHTML = hosts.map((h, i) => {
      const left = slotsLeft(i);
      let st = "", stCls = "";
      if (left <= 0) st = "Kadro tamam ✓";
      else if (!state.open) { if (i === findStarterFor(nextStarter())) { st = "İlk söz"; stCls = "lead-s"; } else st = "Bekliyor"; }
      else if (state.sold) { st = state.bid && state.bid.who === i ? "Aldı!" : "—"; stCls = state.bid && state.bid.who === i ? "lead-s" : ""; }
      else if (state.turn === i) { st = "Sıra sende"; stCls = "turn-s"; }
      else if (state.bid && state.bid.who === i) { st = `Önde · ${state.bid.amt}`; stCls = "lead-s"; }
      else if (state.passed[i]) { st = "Pas"; stCls = "pass-s"; }
      else if (maxBid(i) < minNext()) { st = "Bütçe yetmez"; stCls = "pass-s"; }
      else st = "Bekliyor";
      const out = left <= 0 || (state.open && !state.sold && (state.passed[i] || maxBid(i) < minNext()) && !(state.bid && state.bid.who === i));
      const slots = [];
      for (let k = 0; k < state.size; k++) {
        const s = state.squads[i][k];
        slots.push(s
          ? `<div class="slot filled ${freshSlot && freshSlot[0] === i && freshSlot[1] === k ? "fresh" : ""}"><span class="sp">${esc(s.p.p)}</span>${HT.photoHTML(s.p.w, s.p.n)}<span class="sn">${esc(s.p.n)}</span><span class="pr">${s.price}</span></div>`
          : `<div class="slot"><span class="empty">${k + 1}</span></div>`);
      }
      return `
      <div class="bidder ${state.turn === i && state.open && !state.sold ? "is-turn" : ""} ${state.bid && state.bid.who === i && state.open ? "is-lead" : ""} ${out ? "is-out" : ""}" style="--c:${h.color}">
        <div class="bidder-head">
          ${HT.avatar(h)}
          <div class="nm">${esc(h.name)}</div>
          <div class="coins">${state.coins[i]}<small>COIN · MAKS ${maxBid(i)}</small></div>
          <span class="status ${stCls}">${st}</span>
        </div>
        <div class="squad-slots" style="--n:${state.size}">${slots.join("")}</div>
      </div>`;
    }).join("");
    HT.hydratePhotos(box);
    freshSlot = null;
  }

  /* ---------------- Aksiyonlar ---------------- */
  function openCard() {
    if (state.open || state.phase === "done") return;
    snapshot();
    state.open = true;
    state.sold = false;
    state.bid = null;
    state.passed = hosts.map(() => false);
    state.starter = nextStarter();
    state.opened++;
    const el = eligible();
    if (el.length === 1) {
      // Tek alıcı kaldı: 1 coin'e otomatik
      state.bid = { amt: 1, who: el[0] };
      state.turn = null;
      save();
      sfx.whoosh();
      renderAll();
      HT.toast(`Tek alıcı ${hosts[el[0]].name}: 1 coin'e alıyor`);
      setTimeout(startGoing, 1100);
      return;
    }
    state.turn = findFrom(state.starter, true);
    save();
    sfx.whoosh();
    setTimeout(() => sfx.reveal(), 350);
    renderAll();
  }

  function raise(amt) {
    if (!state.open || state.sold || state.turn == null) return;
    const i = state.turn;
    if (!amt || amt < minNext()) { HT.toast(`Teklif en az ${minNext()} olmalı`); return; }
    if (amt > maxBid(i)) { HT.toast(`${hosts[i].name} en fazla ${maxBid(i)} verebilir`); return; }
    snapshot();
    state.bid = { amt, who: i };
    state.turn = findFrom(i, false);
    save();
    sfx.bid();
    const d = $("#bid-display");
    if (state.turn == null) finishBidding();
    renderAll();
    d.classList.remove("flash"); void d.offsetWidth; d.classList.add("flash");
  }

  function pass() {
    if (!state.open || state.sold || state.turn == null) return;
    const i = state.turn;
    snapshot();
    state.passed[i] = true;
    state.turn = findFrom(i, false);
    save();
    sfx.click();
    if (state.turn == null) finishBidding();
    renderAll();
  }

  function finishBidding() {
    state.turn = null;
    if (state.bid) { save(); setTimeout(startGoing, 250); return; }
    // Kimse teklif vermedi
    const p = current();
    if (!p.passedOnce && state.idx < state.lots.length - 1) {
      p.passedOnce = true;
      state.lots.splice(state.idx, 1);
      state.lots.push(p);
      state.open = false;
      save();
      sfx.whoosh();
      HT.toast(`Kimse istemedi: ${p.n} destenin sonuna gitti`, 2800);
      return;
    }
    // İkinci kez ya da son kart: en çok boş yeri olana 1 coin'e verilir
    const el = eligible().sort((a, b) => slotsLeft(b) - slotsLeft(a) || ((a - state.starter + N()) % N()) - ((b - state.starter + N()) % N()));
    state.bid = { amt: 1, who: el[0] };
    save();
    HT.toast(`Kimse istemedi: ${p.n} 1 coin karşılığında en çok boş yeri olan oyuncuya gidiyor: ${hosts[el[0]].name}`, 3200);
    setTimeout(startGoing, 600);
  }

  function startGoing() {
    if (!state.open || state.sold || !state.bid || goingTimer) return;
    const words = ["Gidiyor…", "Gidiyor…", "SATILDI!"];
    let step = 0;
    const g = $("#going"), t = $("#going-text");
    const show = () => {
      t.textContent = words[step];
      t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
      t.style.color = step === 2 ? hosts[state.bid.who].color : "#fff";
      g.classList.add("show");
      if (step < 2) sfx.going(step);
    };
    renderTurn();
    show();
    goingTimer = setInterval(() => {
      step++;
      if (step === 2) { show(); sell(); }
      else if (step > 2) cancelGoing();
      else show();
    }, 850);
  }
  function cancelGoing() {
    if (goingTimer) { clearInterval(goingTimer); goingTimer = null; }
    $("#going").classList.remove("show");
  }

  function sell() {
    if (!state.bid || state.sold) return;
    const { who, amt } = state.bid;
    state.coins[who] -= amt;
    state.squads[who].push({ p: current(), price: amt });
    state.sold = true;
    state.turn = null;
    freshSlot = [who, state.squads[who].length - 1];
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
    state.open = false; state.sold = false; state.bid = null; state.turn = null;
    state.passed = hosts.map(() => false);
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

  function undo() {
    if (!undoStack.length) { HT.toast("Geri alınacak bir şey yok"); return; }
    cancelGoing();
    state = JSON.parse(undoStack.pop());
    // Satış anına geri dönüldüyse satışı da geri al
    save();
    sfx.click();
    if (state.phase === "done") { showScreen("final"); renderFinal(); }
    else { showScreen("game"); renderAll(); }
  }

  function primary() {
    if (!state || state.phase === "done") return;
    if (!state.open) openCard();
    else if (state.sold) nextLot();
  }

  /* ---------------- Olaylar ---------------- */
  $("#card-back").addEventListener("click", openCard);
  $("#btn-undo").addEventListener("click", undo);
  $("#turn").addEventListener("click", (e) => {
    const r = e.target.closest("[data-raise]");
    if (r && !r.disabled) { raise(+r.dataset.raise); return; }
    const a = e.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    if (act === "open") openCard();
    if (act === "next") nextLot();
    if (act === "pass") pass();
    if (act === "custom") raise(parseInt($("#custom-bid").value, 10));
  });
  $("#turn").addEventListener("keydown", (e) => {
    if (e.target.id === "custom-bid" && e.key === "Enter") { e.preventDefault(); raise(parseInt(e.target.value, 10)); }
  });
  $("#card-front").addEventListener("click", (e) => {
    if (!e.target.closest("#photo-edit")) return;
    const p = current();
    const url = prompt(`${p.n} için fotoğraf adresi (URL) yapıştır.\nBoş bırakırsan otomatik fotoğrafa döner.`, "");
    if (url === null) return;
    HT.setPhotoOverride(p.w, url.trim());
    renderLot();
    renderBidders();
  });
  document.addEventListener("keydown", (e) => {
    if (!state || $("#game").classList.contains("hidden")) return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (e.key === " " || e.key === "Enter") {
      if (e.target && e.target.tagName === "BUTTON" && !e.target.dataset.act) return;
      e.preventDefault();
      primary();
      return;
    }
    if (k === "z") { undo(); return; }
    if (state.open && !state.sold && state.turn != null) {
      const idx = ["1", "2", "3", "4"].indexOf(k);
      if (idx >= 0) { raise((state.bid ? state.bid.amt : 0) + STEPS[idx]); return; }
      if (k === "p" || k === "0") pass();
    }
  });

  /* ---------------- Final: kadrolar ---------------- */
  function renderFinal() {
    hosts = HT.getHosts();
    $("#final").innerHTML = `
      <div class="final-head">
        <div>
          <span class="eyebrow" style="color:var(--gold)"><span class="dot"></span> Müzayede bitti</span>
          <h1>Kadrolar Hazır</h1>
          <p>Söz seyircide: en iyi kadro hangisi? Chat'in kararını taçlandır.</p>
        </div>
        <div class="row">
          <button class="btn btn-ghost btn-sm" id="f-copy">📋 Kadroları kopyala</button>
          <button class="btn btn-ghost btn-sm" id="f-undo">↶ Müzayedeye dön</button>
          <button class="btn btn-gold" id="f-new">Yeni Müzayede</button>
        </div>
      </div>
      <div class="squads">${hosts.map((h, i) => squadHTML(h, i, state.squads[i])).join("")}</div>`;
    HT.hydratePhotos($("#final"));
    $("#f-new").addEventListener("click", () => { store.del(STATE_KEY); showScreen("setup"); renderSetup(); });
    $("#f-undo").addEventListener("click", undo);
    $("#f-copy").addEventListener("click", copySummary);
    $$("#final [data-crown]").forEach((b) => b.addEventListener("click", () => {
      const i = +b.dataset.crown;
      state.crowned = state.crowned === i ? null : i;
      save();
      renderFinal();
      if (state.crowned != null) { sfx.win(); HT.confetti([hosts[i].color, "#ffc93c", "#ffffff"], 220); }
    }));
  }

  function squadHTML(h, i, squad) {
    const spent = squad.reduce((a, s) => a + s.price, 0);
    const rows = POS_ORDER.map((pos) => squad.filter((s) => s.p.p === pos)).filter((r) => r.length);
    const widest = Math.max(1, ...rows.map((r) => r.length));
    // Satır ve sütun sayısına göre fotoğraf boyutu: her zaman tüm kadro sığar
    const ps = rows.length >= 4 ? 6 : rows.length === 3 ? 7 : 8.2;
    const psW = widest >= 4 ? Math.min(ps, 6) : ps;
    const crowned = state.crowned === i;
    let delay = 0;
    return `
    <div class="squad ${crowned ? "crowned" : ""}" style="--c:${h.color}">
      <div class="squad-head">
        ${HT.avatar(h)}
        <div class="nm">${esc(h.name)}</div>
        <div class="meta">HARCANAN<b>${spent} / ${state.budget}</b></div>
      </div>
      <div class="pitch" style="--ps:calc(var(--u) * ${psW})">
        <div class="box-top"></div><div class="box-bot"></div>
        ${rows.map((r) => `<div class="pitch-row">${r.map((s) => {
          delay += 0.07;
          return `<div class="pp" style="animation-delay:${delay}s;flex-basis:${Math.floor(100 / Math.max(3, r.length))}%">
            ${HT.photoHTML(s.p.w, s.p.n)}<span class="n">${esc(s.p.n)}</span><span class="pr">${s.price} coin</span></div>`;
        }).join("")}</div>`).join("")}
      </div>
      <div class="squad-foot">
        <button class="btn ${crowned ? "" : "btn-ghost"} vote-btn" data-crown="${i}" style="--c:${h.color}">${crowned ? "👑 Seyircinin seçimi" : "👑 Seyirci bunu seçti"}</button>
      </div>
    </div>`;
  }

  function copySummary() {
    const lines = ["HTALKS · KÖR MÜZAYEDE KADROLARI", ""];
    hosts.forEach((h, i) => {
      lines.push(`${h.name.toLocaleUpperCase("tr")}${state.crowned === i ? " 👑" : ""}: ` + state.squads[i].map((s) => `${s.p.n} (${s.price})`).join(", "));
    });
    lines.push("", "En iyi kadro hangisi? Yorumlara yaz!");
    const text = lines.join("\n");
    const done = () => HT.toast("Kadrolar panoya kopyalandı");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  }
  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) { HT.toast("Kopyalanamadı"); }
    ta.remove();
  }

  renderSetup();
})();
