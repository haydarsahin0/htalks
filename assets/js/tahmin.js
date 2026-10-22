/* =========================================================
   OYUN 1 · YAKLAŞ KAZAN
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, store, sfx } = HT;

  const STATE_KEY = "tahmin.state";
  const USED_KEY = "tahmin.used";
  const CUSTOM_KEY = "tahmin.custom";
  const PREFS_KEY = "tahmin.prefs";
  const CUSTOM_CAT = "Özel Sorular";
  const TARGETS = [5, 7, 10, 15];

  let hosts = HT.getHosts();
  let prefs = Object.assign({ target: 10, cats: null }, store.get(PREFS_KEY, {}));
  let state = null; // aktif oyun
  let undoSnap = null;

  /* ---------------- Soru havuzu ---------------- */
  function customQuestions() {
    return store.get(CUSTOM_KEY, []).map((q) => Object.assign({ cat: CUSTOM_CAT, custom: true }, q));
  }
  function allQuestions() { return window.QUESTIONS.concat(customQuestions()); }
  function byId(id) { return allQuestions().find((q) => q.id === id); }
  function categories() {
    const cats = [];
    allQuestions().forEach((q) => { if (!cats.includes(q.cat)) cats.push(q.cat); });
    return cats;
  }
  function selectedCats() {
    const all = categories();
    if (!prefs.cats) return all;
    // Yeni eklenen kategoriler (ör. özel sorular) varsayılan olarak seçili gelir
    const known = prefs.knownCats || [];
    return all.filter((c) => prefs.cats.includes(c) || !known.includes(c));
  }
  function used() { return store.get(USED_KEY, []); }

  function richText(q) {
    // Hazır sorular küçük bir HTML vurgusu içerir; özel sorular düz metindir.
    if (q.custom) return esc(q.q).replace(/\*\*(.+?)\*\*/g, "<span class='hl'>$1</span>");
    return q.q;
  }

  /* ---------------- Kurulum ekranı ---------------- */
  function renderSetup() {
    hosts = HT.getHosts();
    $("#target-seg").innerHTML = TARGETS.map((t) => `<button type="button" data-t="${t}" class="${prefs.target === t ? "on" : ""}">${t} puan</button>`).join("");
    const cats = categories();
    const sel = selectedCats();
    const counts = {};
    allQuestions().forEach((q) => { counts[q.cat] = (counts[q.cat] || 0) + 1; });
    $("#cat-list").innerHTML = cats.map((c) => `
      <label class="chk"><input type="checkbox" value="${esc(c)}" ${sel.includes(c) ? "checked" : ""}><span class="box"></span>${esc(c)} <span class="count">${counts[c]}</span></label>`).join("");
    updatePoolInfo();
    const saved = store.get(STATE_KEY, null);
    $("#btn-resume").classList.toggle("hidden", !(saved && !saved.finished));
  }

  function updatePoolInfo() {
    const sel = selectedCats();
    const u = used();
    const pool = allQuestions().filter((q) => sel.includes(q.cat));
    const fresh = pool.filter((q) => !u.includes(q.id));
    $("#pool-info").innerHTML = `Seçili kategorilerde <b style="color:var(--text)">${pool.length}</b> soru var, <b style="color:var(--accent)">${fresh.length}</b> tanesi henüz sorulmadı.`;
  }

  $("#target-seg").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-t]");
    if (!b) return;
    prefs.target = +b.dataset.t;
    store.set(PREFS_KEY, prefs);
    sfx.click();
    renderSetup();
  });
  $("#cat-list").addEventListener("change", () => {
    prefs.cats = $$("#cat-list input:checked").map((i) => i.value);
    prefs.knownCats = categories();
    store.set(PREFS_KEY, prefs);
    updatePoolInfo();
  });
  $("#btn-reset-used").addEventListener("click", () => {
    store.del(USED_KEY);
    updatePoolInfo();
    HT.toast("Tüm sorular tekrar havuzda");
  });
  $("#btn-start").addEventListener("click", startGame);
  $("#btn-resume").addEventListener("click", () => {
    state = store.get(STATE_KEY, null);
    if (!state) return;
    showScreen("game");
    renderGame();
  });
  $("#btn-menu").addEventListener("click", () => {
    if (state && !state.finished && !confirm("Kurulum ekranına dönülsün mü? Oyun kaydedildi, sonra devam edebilirsin.")) return;
    showScreen("setup");
    renderSetup();
  });

  function showScreen(name) {
    ["setup", "game", "winner"].forEach((s) => $("#" + s).classList.toggle("hidden", s !== name));
    $("#btn-menu").classList.toggle("hidden", name === "setup");
    window.scrollTo({ top: 0 });
  }

  /* ---------------- Oyun akışı ---------------- */
  function buildPool() {
    const sel = selectedCats();
    const u = used();
    let pool = allQuestions().filter((q) => sel.includes(q.cat));
    if (!pool.length) return [];
    let fresh = pool.filter((q) => !u.includes(q.id));
    if (fresh.length < 5) {
      // Havuz bitti: sorulanları sıfırla
      store.set(USED_KEY, u.filter((id) => !pool.some((q) => q.id === id)));
      fresh = pool;
      HT.toast("Soru havuzu yenilendi");
    }
    // Aynı kategorinin üst üste gelmesini azalt
    const shuffled = HT.shuffle(fresh);
    const out = [];
    while (shuffled.length) {
      const last = out[out.length - 1];
      let idx = shuffled.findIndex((q) => !last || q.cat !== last.cat);
      if (idx < 0) idx = 0;
      out.push(shuffled.splice(idx, 1)[0]);
    }
    return out.map((q) => q.id);
  }

  function startGame() {
    hosts = HT.getHosts();
    const queue = buildPool();
    if (!queue.length) { HT.toast("En az bir kategori seç"); return; }
    state = {
      target: prefs.target,
      scores: hosts.map(() => 0),
      queue,
      qno: 0,
      current: null,
      phase: "answer",
      answers: hosts.map(() => null),
      locked: hosts.map(() => false),
      history: [],
      finished: false,
    };
    sfx.whoosh();
    showScreen("game");
    nextQuestion();
  }

  function save() { store.set(STATE_KEY, state); }

  function nextQuestion() {
    if (!state.queue.length) state.queue = buildPool();
    const id = state.queue.shift();
    state.current = id;
    state.qno += 1;
    state.phase = "answer";
    state.answers = hosts.map(() => null);
    state.locked = hosts.map(() => false);
    undoSnap = null;
    const u = used();
    if (!u.includes(id)) { u.push(id); store.set(USED_KEY, u); }
    save();
    renderGame();
    // Bir sonraki sorunun fotoğrafını önden yükle
    const nxt = byId(state.queue[0]);
    if (nxt && nxt.photo) HT.preloadPhoto(nxt.photo, nxt.name || nxt.photo);
    const first = $(".ans-input");
    if (first) setTimeout(() => first.focus(), 60);
  }

  /* ---------------- Çizim ---------------- */
  function renderGame() {
    hosts = HT.getHosts();
    renderScores();
    renderQuestion();
    renderAnswers();
    renderHistory();
    const revealed = state.phase === "reveal";
    $("#reveal").classList.toggle("show", revealed);
    $("#toolbar").classList.toggle("hidden", revealed);
    $("#game").classList.toggle("compact", revealed);
    if (revealed) renderReveal(false);
  }

  function renderScores(bumpIdx) {
    const max = Math.max(...state.scores);
    $("#scoreboard").innerHTML = hosts.map((h, i) => {
      const s = state.scores[i];
      const pct = Math.min(100, (s / state.target) * 100);
      const leader = s > 0 && s === max && state.scores.filter((x) => x === max).length === 1;
      return `
      <div class="score-card ${leader ? "leader" : ""} ${bumpIdx && bumpIdx.includes(i) ? "bump" : ""}" style="--c:${h.color}">
        <span class="host-avatar" style="--c:${h.color}">${esc(h.name[0])}</span>
        <div>
          <div class="nm">${esc(h.name)}</div>
          <div class="sub">${leader ? "● Lider · " : ""}Hedef ${state.target} puan</div>
        </div>
        <div class="pts">${s}</div>
        <div class="score-adj">
          <button data-adj="${i}" data-d="1" title="Puan ekle">+</button>
          <button data-adj="${i}" data-d="-1" title="Puan çıkar">−</button>
        </div>
        <div class="bar" style="width:${pct}%"></div>
      </div>`;
    }).join("");
  }

  $("#scoreboard").addEventListener("click", (e) => {
    const b = e.target.closest("[data-adj]");
    if (!b) return;
    const i = +b.dataset.adj;
    state.scores[i] = Math.max(0, state.scores[i] + +b.dataset.d);
    sfx.click();
    save();
    renderScores([i]);
    checkWinner();
  });

  function renderQuestion() {
    const q = byId(state.current);
    if (!q) return;
    const stage = $("#q-stage");
    const isChoice = q.type === "choice";
    const hasPhoto = !isChoice && q.photo;
    stage.classList.toggle("no-photo", !hasPhoto);
    const letters = ["A", "B", "C", "D"];
    stage.innerHTML = `
      ${hasPhoto ? HT.photoHTML(q.photo, q.name || stripTags(q.q)) : ""}
      <div>
        <div class="q-meta">
          <span class="qno">SORU ${state.qno}</span>
          <span class="pill" style="color:var(--accent)">${esc(q.cat)}</span>
          ${isChoice ? '<span class="pill">Doğru bilen +1</span>' : '<span class="pill">En yakın +1 · Tam isabet +2</span>'}
        </div>
        <h2 class="q-text">${richText(q)}</h2>
        ${isChoice ? `<div class="q-options-show">${q.options.map((o, i) => `
            <div class="opt-big" data-opt="${i}">
              ${o.photo ? HT.photoHTML(o.photo, o.t) : ""}
              <span class="k">${letters[i]}</span><span class="t">${esc(o.t)}</span>
            </div>`).join("")}</div>`
          : `<div class="q-unit">Cevap birimi: <b>${esc(q.unit || "sayı")}</b></div>`}
      </div>
      <div class="q-num-bg">${state.qno}</div>`;
    HT.hydratePhotos(stage);
  }

  function stripTags(s) { return String(s).replace(/<[^>]+>/g, ""); }

  function renderAnswers() {
    const q = byId(state.current);
    const isChoice = q.type === "choice";
    const letters = ["A", "B", "C", "D"];
    $("#answers").innerHTML = hosts.map((h, i) => {
      const val = state.answers[i];
      const locked = state.locked[i];
      const control = isChoice
        ? `<div class="ans-input-row"><div class="choice-opts" style="flex:1">${q.options.map((o, k) => `
              <button type="button" data-choice="${i}" data-k="${k}" class="${val === k ? "sel" : ""}"><span class="k">${letters[k]}</span>${esc(o.t)}</button>`).join("")}</div></div>`
        : `<div class="ans-input-row">
             <input class="ans-input" data-i="${i}" inputmode="decimal" autocomplete="off" placeholder="?" value="${val == null ? "" : esc(String(val).replace(".", ","))}" aria-label="${esc(h.name)} tahmini">
             <button class="lock-btn" data-lock="${i}" title="Kilitle (Enter)">${HT.ICONS.lock}</button>
           </div>`;
      return `
      <div class="ans-card ${locked ? "locked" : ""}" data-card="${i}" style="--c:${h.color}">
        <div class="who">
          <span class="host-avatar" style="--c:${h.color}">${esc(h.name[0])}</span>
          <b>${esc(h.name)}</b>
          <span class="state">${locked ? "HAZIR" : "DÜŞÜNÜYOR…"}</span>
        </div>
        ${control}
        <div class="locked-face" data-unlock="${i}" title="Düzenlemek için tıkla">${HT.ICONS.lock.replace("<svg", '<svg width="30" height="30"')} KİLİTLİ</div>
        <div class="reveal-face"><span class="val"></span><span class="diff"></span></div>
      </div>`;
    }).join("");
  }

  function parseNum(v) {
    if (v == null) return null;
    const s = String(v).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  function lock(i) {
    const input = $(`.ans-input[data-i="${i}"]`);
    if (input) {
      const n = parseNum(input.value);
      if (n == null) {
        // Boş bırakıldı: sıradaki kutuya ya da "Cevabı Göster"e geç
        const others = state.locked.map((l, k) => (!l && k !== i ? k : -1)).filter((k) => k >= 0);
        const nxt = others.find((k) => k > i) ?? others[0];
        const target = nxt != null ? $(`.ans-input[data-i="${nxt}"]`) : null;
        (target || $("#btn-reveal")).focus();
        return;
      }
      state.answers[i] = n;
    }
    if (state.answers[i] == null) return;
    state.locked[i] = true;
    sfx.lock();
    save();
    const card = $(`.ans-card[data-card="${i}"]`);
    card.classList.add("locked");
    card.querySelector(".state").textContent = "HAZIR";
    // Sıradaki boş kutuya geç
    const next = state.locked.findIndex((l) => !l);
    if (next >= 0) { const ni = $(`.ans-input[data-i="${next}"]`); if (ni) ni.focus(); }
    else { const b = $("#btn-reveal"); if (b) b.focus(); }
  }

  function unlock(i) {
    if (state.phase !== "answer") return;
    state.locked[i] = false;
    save();
    const card = $(`.ans-card[data-card="${i}"]`);
    card.classList.remove("locked");
    card.querySelector(".state").textContent = "DÜŞÜNÜYOR…";
    const input = card.querySelector(".ans-input");
    if (input) { input.focus(); input.select(); }
  }

  $("#answers").addEventListener("keydown", (e) => {
    if (e.target.classList.contains("ans-input") && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      lock(+e.target.dataset.i);
    }
  });
  $("#answers").addEventListener("input", (e) => {
    if (e.target.classList.contains("ans-input")) {
      // Sadece rakam, virgül, nokta ve eksi
      const clean = e.target.value.replace(/[^\d.,-]/g, "");
      if (clean !== e.target.value) e.target.value = clean;
    }
  });
  $("#answers").addEventListener("click", (e) => {
    const l = e.target.closest("[data-lock]");
    if (l) { lock(+l.dataset.lock); return; }
    const u = e.target.closest("[data-unlock]");
    if (u) { unlock(+u.dataset.unlock); return; }
    const c = e.target.closest("[data-choice]");
    if (c && state.phase === "answer") {
      const i = +c.dataset.choice;
      state.answers[i] = +c.dataset.k;
      lock(i);
    }
  });

  /* ---------------- Açıklama ---------------- */
  $("#btn-reveal").addEventListener("click", reveal);
  $("#btn-next").addEventListener("click", () => { if (!state.finished) nextQuestion(); });
  $("#btn-skip").addEventListener("click", skip);
  $("#btn-undo").addEventListener("click", undo);

  function skip() {
    if (state.phase !== "answer") return;
    state.history.unshift({ qid: state.current, skipped: true });
    sfx.whoosh();
    nextQuestion();
  }

  function score(q, answers) {
    const n = answers.length;
    const pts = new Array(n).fill(0);
    let winners = [];
    if (q.type === "choice") {
      answers.forEach((a, i) => { if (a === q.a) { pts[i] = 1; winners.push(i); } });
    } else {
      const diffs = answers.map((a) => (a == null ? Infinity : Math.abs(a - q.a)));
      const min = Math.min(...diffs);
      if (min !== Infinity) {
        winners = diffs.map((d, i) => (d === min ? i : -1)).filter((i) => i >= 0);
        winners.forEach((i) => { pts[i] = min === 0 ? 2 : 1; });
      }
    }
    return { pts, winners };
  }

  function reveal() {
    if (state.phase !== "answer") return;
    // Kilitlenmemiş ama yazılmış cevapları da al
    hosts.forEach((h, i) => {
      if (!state.locked[i]) {
        const input = $(`.ans-input[data-i="${i}"]`);
        const n = input ? parseNum(input.value) : state.answers[i];
        state.answers[i] = n;
      }
    });
    if (state.answers.every((a) => a == null)) { HT.toast("Henüz kimse cevap vermedi"); return; }
    const q = byId(state.current);
    undoSnap = JSON.parse(JSON.stringify({ scores: state.scores, history: state.history, locked: state.locked, answers: state.answers }));
    const res = score(q, state.answers);
    state.scores = state.scores.map((s, i) => s + res.pts[i]);
    state.history.unshift({ qid: q.id, answers: state.answers.slice(), pts: res.pts, winners: res.winners });
    state.phase = "reveal";
    save();
    $("#toolbar").classList.add("hidden");
    $("#reveal").classList.add("show");
    $("#game").classList.add("compact");
    renderReveal(true);
  }

  function renderReveal(animate) {
    const q = byId(state.current);
    const last = state.history.find((h) => h.qid === q.id && !h.skipped) || { pts: [], winners: [] };
    const isChoice = q.type === "choice";
    const letters = ["A", "B", "C", "D"];

    // Cevap
    const ansEl = $("#rv-answer");
    $("#rv-unit").textContent = isChoice ? "" : (q.unit || "");
    $("#rv-note").innerHTML = q.note ? `<b>Bilgi:</b> ${esc(q.note)}` : "";
    if (isChoice) {
      ansEl.textContent = q.options[q.a].t;
      ansEl.style.fontSize = "clamp(50px, 6vw, 90px)";
      $$(".opt-big").forEach((el) => el.classList.add(+el.dataset.opt === q.a ? "correct" : "wrong"));
    } else {
      ansEl.style.fontSize = "";
      if (animate) HT.countUp(ansEl, q.a, 1100, Number.isInteger(q.a) ? 0 : 1);
      else ansEl.textContent = HT.fmt(q.a);
    }

    // Kartlar
    const delay = animate ? 1150 : 0;
    setTimeout(() => {
      hosts.forEach((h, i) => {
        const card = $(`.ans-card[data-card="${i}"]`);
        if (!card) return;
        const a = state.answers[i];
        card.classList.remove("locked");
        card.classList.add("revealed");
        const val = card.querySelector(".val");
        const diff = card.querySelector(".diff");
        if (a == null) {
          val.textContent = "—";
          diff.innerHTML = "Cevap yok";
        } else if (isChoice) {
          val.textContent = letters[a] + " · " + q.options[a].t;
          val.style.fontSize = "38px";
          diff.innerHTML = a === q.a ? "<b style='color:var(--accent)'>DOĞRU</b>" : "<b style='color:var(--danger)'>YANLIŞ</b>";
        } else {
          val.textContent = HT.fmt(a);
          const d = Math.abs(a - q.a);
          diff.innerHTML = d === 0 ? "<b style='color:var(--gold)'>TAM İSABET</b>" : `fark<b>${HT.fmt(d)}</b>`;
        }
        const won = last.winners.includes(i);
        card.classList.toggle("winner", won);
        card.classList.toggle("loser", !won && last.winners.length > 0);
        if (won) card.setAttribute("data-badge", `+${last.pts[i]} PUAN`);
      });

      if (!isChoice) renderNumline(q);
      else $("#numline").innerHTML = "";

      if (animate) {
        renderScores(last.winners);
        if (last.winners.length) {
          sfx.reveal();
          HT.confetti(last.winners.map((i) => hosts[i].color), 90);
        } else sfx.wrong();
        setTimeout(checkWinner, 1400);
      }
      const nb = $("#btn-next");
      if (nb) nb.focus();
    }, delay);
  }

  function renderNumline(q) {
    const items = hosts.map((h, i) => ({ i, v: state.answers[i], c: h.color, n: h.name })).filter((x) => x.v != null);
    const vals = items.map((x) => x.v).concat([q.a]);
    let lo = Math.min(...vals);
    let hi = Math.max(...vals);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.12;
    lo -= pad; hi += pad;
    const pos = (v) => ((v - lo) / (hi - lo)) * 100;

    // Yakın etiketler üst üste binmesin diye kulvarlara ayır
    const sorted = items.slice().sort((a, b) => a.v - b.v);
    const lanes = [];
    sorted.forEach((it) => {
      let lane = 0;
      while (lanes[lane] != null && pos(it.v) - lanes[lane] < 14) lane++;
      lanes[lane] = pos(it.v);
      it.lane = lane;
    });
    const maxLane = Math.max(0, ...sorted.map((s) => s.lane));
    const nl = $("#numline");
    nl.style.height = 120 + maxLane * 32 + "px";
    nl.innerHTML = `<div class="track"></div>
      <div class="mk answer" style="--c:var(--gold);left:50%" data-left="${pos(q.a)}">
        <span class="tag">CEVAP · ${HT.fmt(q.a)}</span><span class="stem"></span><span class="dot"></span>
      </div>
      ${sorted.map((it) => `
        <div class="mk lower" style="--c:${it.c};left:50%" data-left="${pos(it.v)}">
          <span class="tag">${esc(it.n)} · ${HT.fmt(it.v)}</span><span class="stem" style="height:${18 + it.lane * 32}px"></span><span class="dot"></span>
        </div>`).join("")}`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$(".mk", nl).forEach((m) => { m.style.left = m.dataset.left + "%"; });
    }));
  }

  function undo() {
    if (state.phase !== "reveal" || !undoSnap) { HT.toast("Geri alınacak bir şey yok"); return; }
    Object.assign(state, undoSnap);
    state.phase = "answer";
    state.finished = false;
    undoSnap = null;
    save();
    sfx.click();
    renderGame();
    HT.toast("Puanlama geri alındı");
  }

  function checkWinner() {
    const max = Math.max(...state.scores);
    if (max < state.target) return;
    const top = state.scores.map((s, i) => (s === max ? i : -1)).filter((i) => i >= 0);
    if (top.length > 1) {
      if (state.phase === "reveal") HT.toast(`Eşitlik! ${top.map((i) => hosts[i].name).join(" ve ")} — altın soru geliyor`, 3500);
      return;
    }
    state.finished = true;
    save();
    showWinner(top[0]);
  }

  /* ---------------- Şampiyon ---------------- */
  function showWinner(w) {
    const h = hosts[w];
    const order = hosts.map((x, i) => ({ x, i, s: state.scores[i] })).sort((a, b) => b.s - a.s);
    // podyum sırası: 2 - 1 - 3
    const podium = [order[1], order[0], order[2]].filter(Boolean);
    const heights = { 0: 250, 1: 200, 2: 165 };
    const played = state.history.filter((x) => !x.skipped).length;
    $("#winner").innerHTML = `
      <div class="trophy">🏆</div>
      <div class="sub">Yaklaş Kazan şampiyonu</div>
      <h1 style="--c:${h.color}">${esc(h.name)}</h1>
      <div class="muted">${played} soruda ${state.scores[w]} puan</div>
      <div class="podium">
        ${podium.map((p) => {
          const rank = order.indexOf(p);
          return `<div class="step" style="--c:${p.x.color};height:${heights[rank]}px">
            <div class="r">${rank + 1}.</div><div class="n">${esc(p.x.name)}</div><div class="p">${p.s} puan</div></div>`;
        }).join("")}
      </div>
      <div class="row" style="justify-content:center">
        <button class="btn btn-lg" id="w-new">Yeni Oyun</button>
        <button class="btn btn-ghost" id="w-back">Son soruya dön</button>
        <a class="btn btn-ghost" href="muzayede.html">Kör Müzayede'ye geç →</a>
      </div>`;
    showScreen("winner");
    sfx.win();
    HT.confetti([h.color, "#ffc93c", "#ffffff"], 220);
    setTimeout(() => HT.confetti([h.color, "#ffc93c"], 160), 900);
    $("#w-new").addEventListener("click", () => { store.del(STATE_KEY); showScreen("setup"); renderSetup(); });
    $("#w-back").addEventListener("click", () => { showScreen("game"); renderGame(); });
  }

  /* ---------------- Geçmiş ---------------- */
  function renderHistory() {
    const list = state.history.filter((x) => !x.skipped);
    $("#history").classList.toggle("hidden", !list.length || !state.showHistory);
    $("#history-list").innerHTML = list.map((hx) => {
      const q = byId(hx.qid);
      if (!q) return "";
      const ans = q.type === "choice" ? q.options[q.a].t : `${HT.fmt(q.a)} ${esc(q.unit || "")}`;
      const w = hx.winners.length ? hx.winners.map((i) => `<span style="color:${hosts[i].color}">${esc(hosts[i].name)} +${hx.pts[i]}</span>`).join(", ") : '<span class="muted">puan yok</span>';
      return `<div class="history-item"><span>${stripTags(q.q)}</span><b class="muted">${ans}</b><span class="w">${w}</span></div>`;
    }).join("");
  }

  /* ---------------- Klavye ---------------- */
  document.addEventListener("keydown", (e) => {
    if ($("#game").classList.contains("hidden")) return;
    if ($("#custom-modal").classList.contains("show")) return;
    const typing = e.target && /INPUT|TEXTAREA/.test(e.target.tagName);
    if (e.key === "Enter" && !typing) {
      if (e.target && e.target.tagName === "BUTTON" && e.target.id !== "btn-reveal" && e.target.id !== "btn-next") return;
      e.preventDefault();
      if (state.phase === "answer") reveal();
      else if (!state.finished) nextQuestion();
    }
    if (typing) return;
    if (e.key === "z" || e.key === "Z") undo();
    if (e.key === "s" || e.key === "S") skip();
    if (e.key === "m" || e.key === "M") { state.showHistory = !state.showHistory; save(); renderHistory(); }
  });

  /* ---------------- Kendi soruların ---------------- */
  const modal = $("#custom-modal");
  function openCustom() { renderCustomList(); modal.classList.add("show"); setTimeout(() => $("#cq-text").focus(), 50); }
  function closeCustom() { modal.classList.remove("show"); renderSetup(); }
  $("#btn-custom").addEventListener("click", openCustom);
  $("#custom-close").addEventListener("click", closeCustom);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeCustom(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("show")) closeCustom(); });

  $("#custom-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const a = parseNum($("#cq-answer").value);
    if (a == null) { HT.toast("Cevap bir sayı olmalı"); return; }
    const list = store.get(CUSTOM_KEY, []);
    const photo = $("#cq-photo").value.trim();
    list.push({
      id: "u" + Date.now().toString(36),
      q: $("#cq-text").value.trim(),
      a,
      unit: $("#cq-unit").value.trim(),
      note: $("#cq-note").value.trim(),
      photo: photo || undefined,
      name: photo || undefined,
    });
    store.set(CUSTOM_KEY, list);
    e.target.reset();
    renderCustomList();
    HT.toast("Soru eklendi");
    $("#cq-text").focus();
  });

  function renderCustomList() {
    const list = store.get(CUSTOM_KEY, []);
    $("#custom-list").innerHTML = list.length
      ? list.map((q) => `<div><span>${esc(q.q)} <b class="muted">→ ${HT.fmt(q.a)} ${esc(q.unit || "")}</b></span><button data-del="${q.id}" title="Sil">✕</button></div>`).join("")
      : '<div class="muted">Henüz eklenmiş soru yok. Eklediğin sorular bu tarayıcıda saklanır.</div>';
  }
  $("#custom-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-del]");
    if (!b) return;
    store.set(CUSTOM_KEY, store.get(CUSTOM_KEY, []).filter((q) => q.id !== b.dataset.del));
    renderCustomList();
  });

  renderSetup();
})();
