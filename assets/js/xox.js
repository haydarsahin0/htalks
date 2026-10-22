/* =========================================================
   OYUN 03 · FUTBOL XOX
   3 yarışmacı, 3×3 tablo. Tüm girişler Hasan'dan.
   Sıra her hamlede bir sonraki kişiye, her turda başlayan değişir.
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, store, sfx } = HT;

  const STATE_KEY = "xox.state";
  const PREFS_KEY = "xox.prefs";
  const CUSTOM_KEY = "xox.custom";
  const MATCH_KEY = "xox.matchCount";
  const ROUNDS = [{ n: 1, label: "Tek tur" }, { n: 3, label: "3 tur (2 alan kazanır)" }, { n: 5, label: "5 tur (3 alan kazanır)" }];
  const TIMERS = [0, 20, 30, 45, 60];
  const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

  let hosts = HT.getHosts();
  let prefs = Object.assign({ grid: "random", rounds: 3, timer: 30, steal: true }, store.get(PREFS_KEY, {}));
  let state = null;
  let undoStack = [];
  let timerInt = null;

  /* ---------------- Yardımcılar ---------------- */
  const norm = (s) => String(s || "").toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]/g, "");
  const PLAYERS = window.FOOTBALLERS || [];
  const byNorm = {};
  PLAYERS.forEach((p) => { byNorm[norm(p.n)] = p; });
  const GRIDS = window.XOX_GRIDS || [];

  // Kriter sözlüğü (özel tablolarda yazılan adı kulüp/ülke olarak tanımak için)
  const KNOWN = {};
  GRIDS.forEach((g) => g.rows.concat(g.cols).forEach((c) => { if (c.k !== "text") KNOWN[norm(c.t)] = c; }));
  Object.entries(window.COUNTRIES || {}).forEach(([code, name]) => { if (!KNOWN[norm(name)]) KNOWN[norm(name)] = { k: "country", t: name, f: code }; });
  const critFromText = (t) => KNOWN[norm(t)] || { k: "text", t: t.trim(), i: "" };

  function customGrids() { return store.get(CUSTOM_KEY, []); }
  function allGrids() { return GRIDS.concat(customGrids()); }
  const gridById = (id) => allGrids().find((g) => g.id === id);

  // Tabloyu çeşitlendir: satır/sütun sırasını karıştır, bazen çevir
  function shuffledGrid(g) {
    const rp = HT.shuffle([0, 1, 2]);
    const cp = HT.shuffle([0, 1, 2]);
    const ex = g.ex || [[[], [], []], [[], [], []], [[], [], []]];
    let rows = rp.map((i) => g.rows[i]);
    let cols = cp.map((j) => g.cols[j]);
    let e = rp.map((i) => cp.map((j) => (ex[i] && ex[i][j]) || []));
    if (Math.random() < 0.5) {
      [rows, cols] = [cols, rows];
      e = [0, 1, 2].map((j) => [0, 1, 2].map((i) => e[i][j]));
    }
    return { id: g.id, title: g.title, rows, cols, ex: e };
  }

  function pickGrid() {
    if (prefs.grid !== "random") {
      const g = gridById(prefs.grid);
      if (g) return shuffledGrid(g);
    }
    const usedIds = state ? state.usedGrids : [];
    let pool = GRIDS.filter((g) => !usedIds.includes(g.id));
    if (!pool.length) pool = GRIDS;
    return shuffledGrid(pool[Math.floor(Math.random() * pool.length)]);
  }

  /* ---------------- Kurulum ---------------- */
  function renderSetup() {
    hosts = HT.getHosts();
    const opts = [`<option value="random">🎲 Rastgele (her tur farklı tablo) — ${GRIDS.length} hazır tablo</option>`]
      .concat(GRIDS.map((g) => `<option value="${g.id}">${esc(g.title)}</option>`))
      .concat(customGrids().map((g) => `<option value="${g.id}">✎ ${esc(g.title)}</option>`));
    $("#grid-select").innerHTML = opts.join("");
    $("#grid-select").value = gridById(prefs.grid) ? prefs.grid : "random";
    $("#grid-info").textContent = customGrids().length ? `${customGrids().length} özel tablo kayıtlı` : "";
    $("#rounds-seg").innerHTML = ROUNDS.map((r) => `<button type="button" data-rounds="${r.n}" class="${prefs.rounds === r.n ? "on" : ""}">${r.label}</button>`).join("");
    $("#timer-seg").innerHTML = TIMERS.map((t) => `<button type="button" data-timer="${t}" class="${prefs.timer === t ? "on" : ""}">${t ? t + " sn" : "Süresiz"}</button>`).join("");
    $("#steal").checked = !!prefs.steal;
    const saved = store.get(STATE_KEY, null);
    $("#btn-resume").classList.toggle("hidden", !(saved && !saved.finished));
  }
  const savePrefs = () => store.set(PREFS_KEY, prefs);
  $("#grid-select").addEventListener("change", (e) => { prefs.grid = e.target.value; savePrefs(); });
  $("#setup").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-rounds],button[data-timer]");
    if (!b) return;
    if (b.dataset.rounds) prefs.rounds = +b.dataset.rounds;
    if (b.dataset.timer != null) prefs.timer = +b.dataset.timer;
    savePrefs(); sfx.click(); renderSetup();
  });
  $("#steal").addEventListener("change", (e) => { prefs.steal = e.target.checked; savePrefs(); });
  $("#btn-start").addEventListener("click", startMatch);
  $("#btn-resume").addEventListener("click", () => {
    state = store.get(STATE_KEY, null);
    if (!state) return;
    undoStack = [];
    showScreen("game");
    renderAll();
  });
  $("#btn-menu").addEventListener("click", () => {
    if (state && !state.finished && !confirm("Kurulum ekranına dönülsün mü? Maç kaydedildi, sonra devam edebilirsin.")) return;
    stopTimer();
    showScreen("setup");
    renderSetup();
  });
  function showScreen(name) {
    ["setup", "game", "winner"].forEach((s) => $("#" + s).classList.toggle("hidden", s !== name));
    $("#btn-menu").classList.toggle("hidden", name === "setup");
    $("#btn-undo").classList.toggle("hidden", name !== "game");
  }

  /* ---------------- Maç / tur ---------------- */
  function startMatch() {
    hosts = HT.getHosts();
    const mc = store.get(MATCH_KEY, 0);
    store.set(MATCH_KEY, mc + 1);
    state = {
      rounds: prefs.rounds, need: Math.ceil(prefs.rounds / 2), timer: prefs.timer, steal: prefs.steal,
      offset: mc % hosts.length, round: 0, wins: hosts.map(() => 0), usedGrids: [], finished: false,
    };
    undoStack = [];
    newRound();
    sfx.whoosh();
    showScreen("game");
  }

  function newRound() {
    const g = pickGrid();
    state.round += 1;
    state.grid = g;
    state.usedGrids.push(g.id);
    state.cells = Array.from({ length: 9 }, () => null); // { owner, name, wiki, stolen }
    state.used = [];
    state.turn = (state.offset + state.round - 1) % hosts.length;
    state.selected = null;
    state.roundOver = null; // { winner, line, reason }
    state.reveal = false;
    state.msg = "";
    save();
    renderAll();
  }

  const save = () => store.set(STATE_KEY, state);
  const snapshot = () => { undoStack.push(JSON.stringify(state)); if (undoStack.length > 60) undoStack.shift(); };
  const countCells = (i) => state.cells.filter((c) => c && c.owner === i).length;

  /* ---------------- Çizim ---------------- */
  function renderAll() {
    hosts = HT.getHosts();
    $("#round-lbl").textContent = `TUR ${state.round}${state.rounds > 1 ? ` · ${state.need} TUR ALAN KAZANIR` : " · TEK TUR"}`;
    $("#grid-title").textContent = state.grid.title || "Futbol XOX";
    renderBoard();
    renderScores();
    renderTurn();
    $("#btn-end-round").classList.toggle("hidden", !!state.roundOver);
  }

  function critHTML(c) {
    if (c.k === "club") return `<div class="crit club" style="--c1:${c.c1};--c2:${c.c2}"><span class="crest"></span><b>${esc(c.t)}</b></div>`;
    if (c.k === "country") return `<div class="crit country"><span class="flagbox">${HT.flag(c.f)}</span><b>${esc(c.t)}</b></div>`;
    return `<div class="crit text">${c.i ? `<span class="ico">${c.i}</span>` : ""}<b>${esc(c.t)}</b></div>`;
  }

  function renderBoard() {
    const g = state.grid;
    const winLine = state.roundOver && state.roundOver.line ? state.roundOver.line : [];
    const cur = hosts[state.turn];
    let html = `<div class="xh corner"><img src="assets/img/logo.jpg" alt=""></div>`;
    g.cols.forEach((c) => { html += `<div class="xh col">${critHTML(c)}</div>`; });
    for (let r = 0; r < 3; r++) {
      html += `<div class="xh row">${critHTML(g.rows[r])}</div>`;
      for (let c = 0; c < 3; c++) {
        const idx = r * 3 + c;
        const cell = state.cells[idx];
        const sel = state.selected === idx;
        const cls = ["xc"];
        if (cell) cls.push("owned");
        if (sel) cls.push("selected");
        if (winLine.includes(idx)) cls.push("win");
        if (!state.roundOver && canPick(idx)) cls.push("pickable");
        const owner = cell ? hosts[cell.owner] : null;
        const style = cell ? `--c:${owner.color}` : `--c:${cur.color}`;
        let inner = `<span class="num">${idx + 1}</span>`;
        if (state.reveal) {
          const ex = (g.ex[r] && g.ex[r][c]) || [];
          inner += `<div class="ex">${ex.length ? ex.map((n) => `<span>${esc(n)}</span>`).join("") : '<span class="muted">Örnek yok</span>'}</div>`;
          if (cell) inner += `<span class="own-dot">${HT.avatar(owner)}</span>`;
        } else if (cell) {
          inner += `${cell.name ? HT.photoHTML(cell.wiki || cell.name, cell.name) : '<div class="big-check">✓</div>'}
            <span class="pn">${esc(cell.name || "Doğru cevap")}</span>
            <span class="own-dot">${HT.avatar(owner)}</span>${cell.stolen ? '<span class="lock" title="Çalındı, kilitli">🔒</span>' : ""}`;
        } else if (sel) {
          inner += `<div class="sel-txt">${esc(cur.name)}<br><small>cevap bekleniyor…</small></div>`;
        }
        html += `<div class="${cls.join(" ")}" data-cell="${idx}" style="${style}">${inner}</div>`;
      }
    }
    $("#board").innerHTML = html;
    HT.hydratePhotos($("#board"));
  }

  function renderScores() {
    $("#scores").innerHTML = hosts.map((h, i) => {
      const stars = Array.from({ length: state.need }, (_, k) => `<i class="${k < state.wins[i] ? "on" : ""}">★</i>`).join("");
      return `<div class="xs ${state.turn === i && !state.roundOver ? "active" : ""}" style="--c:${h.color}">
        ${HT.avatar(h)}
        <div class="nm">${esc(h.name)}</div>
        <div class="stars" title="Kazanılan tur">${stars}</div>
        <div class="cells"><b>${countCells(i)}</b><small>kare</small></div>
      </div>`;
    }).join("");
  }

  function renderTurn() {
    const t = $("#xturn");
    stopTimer();
    if (state.roundOver) {
      const ro = state.roundOver;
      const w = ro.winner != null ? hosts[ro.winner] : null;
      const matchDone = w && state.wins[ro.winner] >= state.need;
      const lastRound = state.round >= state.rounds;
      t.className = "turn xox-turn " + (w ? "" : "neutral");
      if (w) t.style.setProperty("--c", w.color);
      t.innerHTML = `
        <div class="who-big">${w ? HT.avatar(w) : ""}<div>
          <div class="lbl">${ro.line ? "Üçü yan yana!" : "Tur bitti"}</div>
          <div class="nm">${w ? esc(w.name) + " turu aldı" : "Berabere"}</div>
          <div class="sub">${esc(ro.reason || "")}</div></div></div>
        <div class="xox-actions">
          <button class="btn btn-ghost" data-act="reveal">${state.reveal ? "Kareleri göster" : "💡 Olası cevaplar"}</button>
          ${matchDone || (lastRound && !anyCanStillWin()) ? `<button class="btn btn-lg" style="--c:${w ? w.color : "var(--gold)"}" data-act="finish">Maç Sonucu <kbd>Enter</kbd></button>`
            : `<button class="btn btn-lg" data-act="next">Sonraki Tur <kbd>Enter</kbd></button>`}
        </div>`;
      return;
    }
    const h = hosts[state.turn];
    t.className = "turn xox-turn";
    t.style.setProperty("--c", h.color);
    if (state.selected == null) {
      t.innerHTML = `
        <div class="who-big">${HT.avatar(h)}<div>
          <div class="lbl">Sıra sende</div><div class="nm">${esc(h.name)}</div>
          <div class="sub">Bir kare seç: tıkla ya da <kbd>1</kbd>–<kbd>9</kbd>${state.steal ? " · rakibin karesini de çalabilirsin" : ""}</div></div></div>
        ${state.msg ? `<div class="xox-msg">${state.msg}</div>` : ""}
        <div class="xox-actions"><button class="btn btn-ghost" data-act="pass">Pas geç <kbd>P</kbd></button></div>`;
      return;
    }
    const idx = state.selected;
    const r = Math.floor(idx / 3), c = idx % 3;
    const cell = state.cells[idx];
    const steal = cell && cell.owner !== state.turn;
    t.innerHTML = `
      <div class="who-big">${HT.avatar(h)}<div>
        <div class="lbl">${steal ? "Çalma denemesi · karenin sahibi: " + esc(hosts[cell.owner].name) : "Kare " + (idx + 1)}</div>
        <div class="nm">${esc(h.name)}</div>
        <div class="sub crit-pair">${critHTML(state.grid.rows[r])}<span>×</span>${critHTML(state.grid.cols[c])}</div></div></div>
      <div class="xox-answer">
        <input class="field" id="ans" list="names" autocomplete="off" placeholder="Söylediği futbolcu (isteğe bağlı)…" aria-label="Futbolcu adı">
        <div class="xox-hint" id="ans-hint">${steal ? "Kareyi çalmak için başka bir doğru futbolcu gerekli." : "İsmi yaz, sonra Doğru ya da Yanlış."}</div>
      </div>
      <div class="xox-actions">
        <button class="btn btn-lg" data-act="ok">✓ Doğru <kbd>Enter</kbd></button>
        <button class="btn btn-lg btn-red" data-act="wrong">✗ Yanlış</button>
        <button class="btn btn-ghost" data-act="cancel">Vazgeç <kbd>Esc</kbd></button>
      </div>
      ${state.timer ? `<div class="xox-timer"><div class="bar" id="tbar"></div><span id="tleft">${state.timer}</span></div>` : ""}`;
    const input = $("#ans");
    setTimeout(() => input.focus(), 30);
    input.addEventListener("input", () => updateHint(input.value));
    startTimer();
  }

  function updateHint(v) {
    const hint = $("#ans-hint");
    if (!hint) return;
    const n = norm(v);
    if (!n) { hint.innerHTML = "İsmi yaz, sonra Doğru ya da Yanlış."; return; }
    const idx = state.selected;
    const ex = (state.grid.ex[Math.floor(idx / 3)] || [])[idx % 3] || [];
    const msgs = [];
    if (state.used.includes(n)) msgs.push(`<b style="color:var(--danger)">⚠ Bu futbolcu bu turda zaten kullanıldı</b>`);
    if (ex.some((e) => norm(e) === n)) msgs.push(`<b style="color:var(--accent)">✓ Bu kare için bilinen cevaplar arasında</b>`);
    const p = byNorm[n];
    if (p) msgs.push(`Havuzda: ${esc((window.COUNTRIES || {})[p.c] || "")} · ${esc(p.t)}`);
    hint.innerHTML = msgs.join(" · ") || "Listede yok — doğruluğuna masa karar verir.";
  }

  /* ---------------- Süre ---------------- */
  function startTimer() {
    stopTimer();
    if (!state.timer || state.selected == null) return;
    const end = Date.now() + state.timer * 1000;
    let lastSec = state.timer;
    timerInt = setInterval(() => {
      const left = Math.max(0, (end - Date.now()) / 1000);
      const bar = $("#tbar"), tl = $("#tleft");
      if (bar) bar.style.width = (left / state.timer) * 100 + "%";
      if (tl) tl.textContent = Math.ceil(left);
      const sec = Math.ceil(left);
      if (sec !== lastSec) { lastSec = sec; if (sec <= 5 && sec > 0) sfx.tick(); }
      if (bar) bar.classList.toggle("low", left <= 5);
      if (left <= 0) { stopTimer(); answer(false, "Süre doldu!"); }
    }, 100);
  }
  function stopTimer() { if (timerInt) { clearInterval(timerInt); timerInt = null; } }

  /* ---------------- Hamleler ---------------- */
  function canPick(idx) {
    const cell = state.cells[idx];
    if (!cell) return true;
    return state.steal && cell.owner !== state.turn && !cell.stolen;
  }

  function selectCell(idx) {
    if (state.roundOver || state.selected != null) return;
    if (!canPick(idx)) {
      const cell = state.cells[idx];
      HT.toast(cell.owner === state.turn ? "Bu kare zaten senin" : cell.stolen ? "Bu kare kilitli 🔒" : "Çalma hakkı kapalı");
      return;
    }
    state.selected = idx;
    state.msg = "";
    save();
    sfx.click();
    renderBoard();
    renderTurn();
  }

  function cancelSelect() {
    if (state.selected == null) return;
    state.selected = null;
    save();
    renderBoard();
    renderTurn();
  }

  function answer(correct, reason) {
    if (state.selected == null || state.roundOver) return;
    stopTimer();
    const input = $("#ans");
    const name = input ? input.value.trim() : "";
    const n = norm(name);
    if (correct && n && state.used.includes(n) && !confirm(`${name} bu turda zaten kullanıldı. Yine de kabul edilsin mi?`)) { startTimer(); return; }
    snapshot();
    const idx = state.selected;
    const h = hosts[state.turn];
    if (correct) {
      const prev = state.cells[idx];
      const p = byNorm[n];
      state.cells[idx] = { owner: state.turn, name: p ? p.n : name, wiki: p ? p.w : "", stolen: !!prev };
      if (n) state.used.push(n);
      state.msg = prev ? `🔓 ${esc(h.name)} kareyi çaldı! (önceki sahibi: ${esc(hosts[prev.owner].name)})` : `✓ ${esc(h.name)} kareyi aldı.`;
      sfx.lock();
      setTimeout(() => sfx.reveal(), 120);
    } else {
      state.msg = `✗ ${esc(h.name)}: ${esc(reason || "Yanlış cevap")} — sıra geçti.`;
      sfx.wrong();
    }
    state.selected = null;
    if (!checkRoundEnd()) state.turn = (state.turn + 1) % hosts.length;
    save();
    renderAll();
  }

  function pass() {
    if (state.roundOver || state.selected != null) return;
    snapshot();
    state.msg = `${esc(hosts[state.turn].name)} pas geçti.`;
    state.turn = (state.turn + 1) % hosts.length;
    sfx.click();
    save();
    renderAll();
  }

  function checkRoundEnd() {
    for (const line of LINES) {
      const [a, b, c] = line.map((i) => state.cells[i]);
      if (a && b && c && a.owner === b.owner && b.owner === c.owner) {
        endRound(a.owner, line, `${state.cells.filter(Boolean).length}. hamlede çizgi tamamlandı`);
        return true;
      }
    }
    if (state.cells.every(Boolean)) { endByCount("Tahta doldu"); return true; }
    return false;
  }

  function endByCount(prefix) {
    const counts = hosts.map((_, i) => countCells(i));
    const max = Math.max(...counts);
    const top = counts.map((c, i) => (c === max ? i : -1)).filter((i) => i >= 0);
    const detail = hosts.map((h, i) => `${h.name} ${counts[i]}`).join(" · ");
    if (max === 0 || top.length > 1) endRound(null, null, `${prefix}: ${detail} — eşitlik, kimse tur almadı`);
    else endRound(top[0], null, `${prefix}: en çok kare (${detail})`);
  }

  function endRound(winner, line, reason) {
    state.roundOver = { winner, line, reason };
    state.selected = null;
    if (winner != null) {
      state.wins[winner] += 1;
      sfx.win();
      HT.confetti([hosts[winner].color, "#ffc93c", "#ffffff"], 180);
    } else sfx.wrong();
  }

  // Son turda eşitlik varsa maç uzar: kimse "need" sayısına ulaşmadıysa ve en yüksek birden fazlaysa
  function anyCanStillWin() {
    const max = Math.max(...state.wins);
    return state.wins.filter((w) => w === max).length > 1;
  }

  function nextRound() {
    if (!state.roundOver) return;
    snapshot();
    newRound();
    sfx.whoosh();
  }

  function finishMatch() {
    const max = Math.max(...state.wins);
    const w = state.wins.indexOf(max);
    state.finished = true;
    save();
    stopTimer();
    const h = hosts[w];
    const order = hosts.map((x, i) => ({ x, i, s: state.wins[i] })).sort((a, b) => b.s - a.s);
    const podium = [order[1], order[0], order[2]].filter(Boolean);
    const heights = [26, 20, 16];
    $("#winner").innerHTML = `
      ${HT.avatar(h, "win-avatar")}
      <div class="trophy">🏆</div>
      <div class="sub">Futbol XOX şampiyonu</div>
      <h1 style="--c:${h.color}">${esc(h.name)}</h1>
      <div class="muted">${state.round} turda ${max} tur galibiyeti</div>
      <div class="podium">${podium.map((p) => {
        const rank = order.indexOf(p);
        return `<div class="step" style="--c:${p.x.color};height:calc(var(--u) * ${heights[rank]})">${HT.avatar(p.x)}<div class="r">${rank + 1}.</div><div class="n">${esc(p.x.name)}</div><div class="p">${p.s} tur</div></div>`;
      }).join("")}</div>
      <div class="row" style="justify-content:center">
        <button class="btn btn-lg" id="w-new" style="--c:#b48cff;color:#14002e">Yeni Maç</button>
        <button class="btn btn-ghost" id="w-back">Son tura dön</button>
        <a class="btn btn-ghost" href="index.html">Ana sayfa</a>
      </div>`;
    showScreen("winner");
    sfx.win();
    HT.confetti([h.color, "#ffc93c", "#ffffff"], 240);
    $("#w-new").addEventListener("click", () => { store.del(STATE_KEY); showScreen("setup"); renderSetup(); });
    $("#w-back").addEventListener("click", () => { state.finished = false; save(); showScreen("game"); renderAll(); });
  }

  function undo() {
    if (!undoStack.length) { HT.toast("Geri alınacak bir şey yok"); return; }
    stopTimer();
    state = JSON.parse(undoStack.pop());
    save();
    sfx.click();
    showScreen("game");
    renderAll();
  }

  /* ---------------- Olaylar ---------------- */
  $("#board").addEventListener("click", (e) => {
    const c = e.target.closest("[data-cell]");
    if (c) selectCell(+c.dataset.cell);
  });
  $("#xturn").addEventListener("click", (e) => {
    const a = e.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    if (act === "ok") answer(true);
    if (act === "wrong") answer(false);
    if (act === "cancel") cancelSelect();
    if (act === "pass") pass();
    if (act === "next") nextRound();
    if (act === "finish") finishMatch();
    if (act === "reveal") { state.reveal = !state.reveal; save(); renderBoard(); renderTurn(); }
  });
  $("#btn-end-round").addEventListener("click", () => {
    if (state.roundOver) return;
    if (!confirm("Tur şimdi bitirilsin mi? En çok karesi olan turu alır.")) return;
    snapshot();
    stopTimer();
    endByCount("Tur erken bitirildi");
    save();
    renderAll();
  });
  $("#btn-undo").addEventListener("click", undo);

  document.addEventListener("keydown", (e) => {
    if (!state || $("#game").classList.contains("hidden") || $(".modal.show")) return;
    const typing = e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    if (typing) {
      if (e.target.id === "ans" && e.key === "Enter") { e.preventDefault(); answer(true); }
      if (e.target.id === "ans" && e.key === "Escape") { e.preventDefault(); cancelSelect(); }
      return;
    }
    const k = e.key.toLowerCase();
    if (state.roundOver) {
      if (e.key === "Enter") {
        e.preventDefault();
        const btn = $('#xturn [data-act="next"], #xturn [data-act="finish"]');
        if (btn) btn.click();
      }
      if (k === "z") undo();
      return;
    }
    if (state.selected != null && e.key === "Enter" && !(e.target && e.target.tagName === "BUTTON")) { e.preventDefault(); answer(true); return; }
    if (state.selected == null && /^[1-9]$/.test(e.key)) { selectCell(+e.key - 1); return; }
    if (e.key === "Escape") cancelSelect();
    if (k === "p" && state.selected == null) pass();
    if (k === "z") undo();
  });

  /* ---------------- Kendi tablon ---------------- */
  const modal = $("#custom-modal");
  function renderCustomList() {
    const list = customGrids();
    $("#custom-list").innerHTML = list.length
      ? list.map((g) => `<div><span><b>${esc(g.title)}</b> — ${g.rows.map((c) => esc(c.t)).join(", ")} × ${g.cols.map((c) => esc(c.t)).join(", ")}</span><button data-del="${g.id}" title="Sil">✕</button></div>`).join("")
      : '<div class="muted">Henüz özel tablo yok. Kaydettiğin tablolar bu tarayıcıda saklanır.</div>';
  }
  $("#btn-custom").addEventListener("click", () => { renderCustomList(); modal.classList.add("show"); });
  $("#custom-close").addEventListener("click", () => { modal.classList.remove("show"); renderSetup(); });
  modal.addEventListener("click", (e) => { if (e.target === modal) { modal.classList.remove("show"); renderSetup(); } });
  $("#custom-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const rows = [0, 1, 2].map((i) => critFromText($(`[data-r="${i}"]`).value));
    const cols = [0, 1, 2].map((i) => critFromText($(`[data-c="${i}"]`).value));
    const id = "u" + Date.now().toString(36);
    const title = $("#cg-title").value.trim() || "Özel tablo";
    const list = customGrids();
    list.push({ id, title, rows, cols, ex: [[[], [], []], [[], [], []], [[], [], []]] });
    store.set(CUSTOM_KEY, list);
    prefs.grid = id; savePrefs();
    e.target.reset();
    renderCustomList();
    HT.toast("Tablo kaydedildi ve seçildi");
  });
  $("#custom-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-del]");
    if (!b) return;
    store.set(CUSTOM_KEY, customGrids().filter((g) => g.id !== b.dataset.del));
    if (prefs.grid === b.dataset.del) { prefs.grid = "random"; savePrefs(); }
    renderCustomList();
  });

  /* ---------------- İsim önerileri ---------------- */
  const names = new Set(PLAYERS.map((p) => p.n));
  GRIDS.forEach((g) => g.ex.forEach((r) => r.forEach((c) => c.forEach((n) => names.add(n)))));
  $("#names").innerHTML = Array.from(names).sort((a, b) => a.localeCompare(b, "tr")).map((n) => `<option value="${esc(n)}">`).join("");

  renderSetup();
})();
