/* =========================================================
   OYUN 1 · YAKLAŞ KAZAN
   Tüm cevapları tek bilgisayardan (Hasan) sırayla girmek için.
   Cevap sırası her soruda bir kişi kayar.
   ========================================================= */
(function () {
  "use strict";
  const { $, $$, esc, store, sfx } = HT;

  const STATE_KEY = "tahmin.state.v2";
  const USED_KEY = "tahmin.used";
  const CUSTOM_KEY = "tahmin.custom";
  const PREFS_KEY = "tahmin.prefs.v2";
  const CUSTOM_CAT = "Özel Sorular";
  const TARGETS = [5, 7, 10, 15];
  const LETTERS = ["A", "B", "C", "D"];

  let hosts = HT.getHosts();
  let prefs = Object.assign({ target: 10, cats: null, knownCats: null }, store.get(PREFS_KEY, {}));
  let state = null;
  let undoSnap = null;
  let revealTimer = null;

  /* ---------------- Soru havuzu ---------------- */
  const BASE = (window.QUESTIONS || []).concat(window.GENERATED_QUESTIONS || []);
  const BASE_BY_ID = {};
  BASE.forEach((q) => { BASE_BY_ID[q.id] = q; });
  function customQuestions() { return store.get(CUSTOM_KEY, []).map((q) => Object.assign({ cat: CUSTOM_CAT, custom: true }, q)); }
  function allQuestions() { return BASE.concat(customQuestions()); }
  function byId(id) { return BASE_BY_ID[id] || customQuestions().find((q) => q.id === id); }
  function categories() {
    const cats = [];
    allQuestions().forEach((q) => { if (!cats.includes(q.cat)) cats.push(q.cat); });
    return cats;
  }
  function selectedCats() {
    const all = categories();
    if (!prefs.cats) return all;
    const known = prefs.knownCats || [];
    return all.filter((c) => prefs.cats.includes(c) || !known.includes(c));
  }
  const used = () => new Set(store.get(USED_KEY, []));
  const stripTags = (s) => String(s).replace(/<[^>]+>/g, "");
  function richText(q) {
    if (q.custom) return esc(q.q).replace(/\*\*(.+?)\*\*/g, "<span class='hl'>$1</span>");
    return q.q;
  }

  /* ---------------- Kurulum ---------------- */
  function renderSetup() {
    hosts = HT.getHosts();
    $("#target-seg").innerHTML = TARGETS.map((t) => `<button type="button" data-t="${t}" class="${prefs.target === t ? "on" : ""}">${t} puan</button>`).join("");
    const sel = selectedCats();
    const counts = {};
    allQuestions().forEach((q) => { counts[q.cat] = (counts[q.cat] || 0) + 1; });
    $("#cat-list").innerHTML = categories().map((c) => `
      <label class="chk"><input type="checkbox" value="${esc(c)}" ${sel.includes(c) ? "checked" : ""}><span class="box"></span>${esc(c)} <span class="count">${counts[c]}</span></label>`).join("");
    updatePoolInfo();
    const saved = store.get(STATE_KEY, null);
    $("#btn-resume").classList.toggle("hidden", !(saved && !saved.finished));
  }
  function updatePoolInfo() {
    const sel = selectedCats();
    const u = used();
    const pool = allQuestions().filter((q) => sel.includes(q.cat));
    const fresh = pool.filter((q) => !u.has(q.id)).length;
    $("#pool-info").innerHTML = `Seçili kategorilerde <b style="color:var(--text)">${pool.length}</b> soru var; <b style="color:var(--accent)">${fresh}</b> tanesi henüz sorulmadı. Kategoriler sırayla karışık gelir.`;
  }

  $("#target-seg").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-t]");
    if (!b) return;
    prefs.target = +b.dataset.t;
    store.set(PREFS_KEY, prefs);
    sfx.click();
    renderSetup();
  });
  $("#cat-list").addEventListener("change", saveCats);
  function saveCats() {
    prefs.cats = $$("#cat-list input:checked").map((i) => i.value);
    prefs.knownCats = categories();
    store.set(PREFS_KEY, prefs);
    updatePoolInfo();
  }
  $("#cat-toggle").addEventListener("click", () => {
    const boxes = $$("#cat-list input");
    const allOn = boxes.every((b) => b.checked);
    boxes.forEach((b) => { b.checked = !allOn; });
    saveCats();
  });
  $("#btn-reset-used").addEventListener("click", () => { store.del(USED_KEY); updatePoolInfo(); HT.toast("Tüm sorular tekrar havuzda"); });
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
    $("#btn-history").classList.toggle("hidden", name !== "game");
  }

  /* ---------------- Soru sırası: kategoriler dengeli karışır ---------------- */
  function buildQueue() {
    const sel = selectedCats();
    let u = used();
    const pool = allQuestions().filter((q) => sel.includes(q.cat));
    if (!pool.length) return [];
    let fresh = pool.filter((q) => !u.has(q.id));
    if (fresh.length < 10) {
      const ids = new Set(pool.map((q) => q.id));
      store.set(USED_KEY, Array.from(u).filter((id) => !ids.has(id)));
      fresh = pool;
      HT.toast("Soru havuzu yenilendi");
    }
    const byCat = {};
    HT.shuffle(fresh).forEach((q) => { (byCat[q.cat] = byCat[q.cat] || []).push(q.id); });
    const out = [];
    let last = null;
    while (Object.keys(byCat).length) {
      let cats = Object.keys(byCat).filter((c) => c !== last);
      if (!cats.length) cats = Object.keys(byCat);
      const c = cats[Math.floor(Math.random() * cats.length)];
      out.push(byCat[c].pop());
      if (!byCat[c].length) delete byCat[c];
      last = c;
      if (out.length >= 400) break; // bir oyun için fazlasıyla yeter
    }
    return out;
  }

  function startGame() {
    hosts = HT.getHosts();
    const queue = buildQueue();
    if (!queue.length) { HT.toast("En az bir kategori seç"); return; }
    state = {
      target: prefs.target,
      scores: hosts.map(() => 0),
      queue,
      qno: 0,
      current: null,
      phase: "answer",
      order: [0, 1, 2],
      answers: hosts.map(() => null),
      done: hosts.map(() => false),
      editing: null,
      history: [],
      finished: false,
    };
    sfx.whoosh();
    showScreen("game");
    nextQuestion();
  }
  const save = () => store.set(STATE_KEY, state);

  function nextQuestion() {
    clearTimeout(revealTimer);
    if (!state.queue.length) state.queue = buildQueue();
    let id = state.queue.shift();
    while (id && !byId(id) && state.queue.length) id = state.queue.shift();
    state.current = id;
    state.qno += 1;
    state.phase = "answer";
    // Sıra döner: 1. soru 0-1-2, 2. soru 1-2-0, 3. soru 2-0-1 ...
    const start = (state.qno - 1) % hosts.length;
    state.order = hosts.map((_, k) => (start + k) % hosts.length);
    state.answers = hosts.map(() => null);
    state.done = hosts.map(() => false);
    state.editing = null;
    undoSnap = null;
    const u = store.get(USED_KEY, []);
    if (!u.includes(id)) { u.push(id); store.set(USED_KEY, u); }
    save();
    renderGame();
    const nxt = byId(state.queue[0]);
    if (nxt && nxt.photo) HT.preloadPhoto(nxt.photo, nxt.name || nxt.photo);
  }

  /* ---------------- Sıra ---------------- */
  function currentPlayer() {
    if (state.phase !== "answer") return null;
    if (state.editing != null) return state.editing;
    const i = state.order.find((k) => !state.done[k]);
    return i == null ? null : i;
  }

  /* ---------------- Çizim ---------------- */
  function renderGame() {
    hosts = HT.getHosts();
    const revealed = state.phase === "reveal";
    $("#game").classList.toggle("revealed-mode", revealed);
    renderScores();
    renderQuestion();
    renderAnswers();
    renderToolbar();
    $("#reveal").classList.toggle("hidden", !revealed);
    $("#toolbar").classList.toggle("hidden", revealed);
    if (revealed) renderReveal(false);
  }

  function renderScores(bump) {
    const max = Math.max(...state.scores);
    const leaders = state.scores.filter((x) => x === max).length;
    $("#scoreboard").innerHTML = hosts.map((h, i) => {
      const s = state.scores[i];
      const lead = s > 0 && s === max && leaders === 1;
      return `
      <div class="score-card ${lead ? "leader" : ""} ${bump && bump.includes(i) ? "bump" : ""}" style="--c:${h.color}">
        <span class="host-avatar" style="--c:${h.color}">${esc(h.name[0])}</span>
        <div><div class="nm">${esc(h.name)}</div><div class="sub">${lead ? "● Lider · " : ""}Hedef ${state.target}</div></div>
        <div class="pts">${s}</div>
        <div class="score-adj"><button data-adj="${i}" data-d="1" title="Puan ekle">+</button><button data-adj="${i}" data-d="-1" title="Puan çıkar">−</button></div>
        <div class="bar" style="width:${Math.min(100, (s / state.target) * 100)}%"></div>
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
    const stage = $("#q-stage");
    if (!q) { stage.innerHTML = ""; return; }
    const isChoice = q.type === "choice";
    stage.classList.toggle("center", !q.photo);
    stage.innerHTML = `
      ${q.photo ? HT.photoHTML(q.photo, q.name || stripTags(q.q)) : ""}
      <div class="q-body">
        <div class="q-meta">
          <span class="qno">SORU ${state.qno}</span>
          <span class="pill" style="color:var(--accent)">${esc(q.cat)}</span>
          <span class="pill">${isChoice ? "Doğru bilen +1" : "En yakın +1 · Tam isabet +2"}</span>
        </div>
        <h2 class="q-text">${richText(q)}</h2>
        ${isChoice
          ? `<div class="q-options">${q.options.map((o, i) => `
              <div class="opt" data-opt="${i}">${o.photo ? HT.photoHTML(o.photo, o.t) : ""}<span class="k">${LETTERS[i]}</span><span class="t">${esc(o.t)}</span></div>`).join("")}</div>`
          : `<div class="q-unit">Cevap birimi: <b>${esc(q.unit || "sayı")}</b></div>`}
      </div>
      <div class="q-num-bg">${state.qno}</div>`;
    HT.hydratePhotos(stage);
  }

  function renderAnswers() {
    const q = byId(state.current);
    if (!q) return;
    const isChoice = q.type === "choice";
    const cur = currentPlayer();
    const revealed = state.phase === "reveal";
    $("#answers").innerHTML = state.order.map((i, pos) => {
      const h = hosts[i];
      let cls = "ans";
      let stateTxt = "";
      let body = "";
      if (revealed) {
        body = `<div class="reveal-face"><span class="val"></span><span class="diff"></span></div>`;
      } else if (i === cur) {
        cls += " current";
        stateTxt = "SIRA SENDE";
        const val = state.answers[i];
        body = isChoice
          ? `<div class="choices">${q.options.map((o, k) => `<button type="button" data-pick="${k}" title="${esc(o.t)}">${LETTERS[k]}</button>`).join("")}</div>
             <button class="skip-btn" data-skip title="Cevap yok">BOŞ</button>`
          : `<input class="ans-input" id="ans-input" inputmode="decimal" autocomplete="off" placeholder="?" value="${val == null ? "" : esc(String(val).replace(".", ","))}" aria-label="${esc(h.name)} tahmini">
             <button class="go-btn" data-ok title="Kaydet (Enter)">✓</button>
             <button class="skip-btn" data-skip title="Cevap yok">BOŞ</button>`;
      } else if (state.done[i]) {
        cls += " done";
        stateTxt = "HAZIR ✓";
        body = `<div class="done-face" data-edit="${i}" title="Düzeltmek için tıkla">${state.answers[i] == null ? "BOŞ" : "GİZLİ"}</div>`;
      } else {
        cls += " waiting";
        stateTxt = "BEKLİYOR";
        body = `<span>Sırada bekliyor…</span>`;
      }
      return `
      <div class="${cls}" data-card="${i}" style="--c:${h.color}">
        <div class="who">
          <span class="order">${pos + 1}.</span>
          <span class="host-avatar" style="--c:${h.color}">${esc(h.name[0])}</span>
          <b>${esc(h.name)}</b>
          <span class="state">${stateTxt}</span>
        </div>
        <div class="body">${body}</div>
      </div>`;
    }).join("");
    const input = $("#ans-input");
    if (input) setTimeout(() => { input.focus(); input.select(); }, 30);
  }

  function renderToolbar() {
    const cur = currentPlayer();
    const hint = $("#turn-hint");
    const btn = $("#btn-reveal");
    if (cur != null) {
      const h = hosts[cur];
      hint.style.setProperty("--c", h.color);
      hint.innerHTML = `Sıra: <b>${esc(h.name)}</b> — cevabını söyle`;
      btn.classList.remove("pulse");
    } else {
      hint.style.setProperty("--c", "var(--accent)");
      hint.innerHTML = `<b>Herkes hazır!</b>`;
      btn.classList.add("pulse");
      btn.focus();
    }
  }

  /* ---------------- Cevap girişi ---------------- */
  function parseNum(v) {
    if (v == null) return null;
    const s = String(v).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    if (s === "") return null;
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  function commit(i, value) {
    state.answers[i] = value;
    state.done[i] = true;
    state.editing = null;
    sfx.lock();
    save();
    renderAnswers();
    renderToolbar();
  }

  $("#answers").addEventListener("keydown", (e) => {
    if (e.target.id === "ans-input" && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const cur = currentPlayer();
      const n = parseNum(e.target.value);
      if (n == null) { HT.toast("Bir sayı yaz ya da BOŞ'a bas"); return; }
      commit(cur, n);
    }
  });
  $("#answers").addEventListener("input", (e) => {
    if (e.target.id === "ans-input") {
      const clean = e.target.value.replace(/[^\d.,-]/g, "");
      if (clean !== e.target.value) e.target.value = clean;
    }
  });
  $("#answers").addEventListener("click", (e) => {
    const cur = currentPlayer();
    if (e.target.closest("[data-ok]")) {
      const n = parseNum($("#ans-input").value);
      if (n == null) { HT.toast("Bir sayı yaz ya da BOŞ'a bas"); return; }
      commit(cur, n);
      return;
    }
    if (e.target.closest("[data-skip]")) { commit(cur, null); return; }
    const p = e.target.closest("[data-pick]");
    if (p) { commit(cur, +p.dataset.pick); return; }
    const ed = e.target.closest("[data-edit]");
    if (ed && state.phase === "answer") {
      state.editing = +ed.dataset.edit;
      state.done[state.editing] = false;
      save();
      renderAnswers();
      renderToolbar();
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
    const pts = answers.map(() => 0);
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
    const cur = currentPlayer();
    if (cur != null) {
      // Ekranda yazılmış ama kaydedilmemiş cevabı da al
      const input = $("#ans-input");
      const n = input ? parseNum(input.value) : null;
      if (n != null) { state.answers[cur] = n; state.done[cur] = true; }
      const waiting = hosts.map((_, i) => i).filter((i) => !state.done[i]);
      if (waiting.length && !confirm(`${waiting.map((i) => hosts[i].name).join(", ")} henüz cevap vermedi. Yine de cevabı gösterelim mi?`)) return;
    }
    if (state.answers.every((a) => a == null)) { HT.toast("Henüz kimse cevap vermedi"); return; }
    const q = byId(state.current);
    undoSnap = JSON.stringify({ scores: state.scores, history: state.history, answers: state.answers, done: state.done });
    const res = score(q, state.answers);
    state.scores = state.scores.map((s, i) => s + res.pts[i]);
    state.history.unshift({ qid: q.id, answers: state.answers.slice(), pts: res.pts, winners: res.winners });
    state.phase = "reveal";
    state.editing = null;
    save();
    $("#game").classList.add("revealed-mode");
    $("#toolbar").classList.add("hidden");
    $("#reveal").classList.remove("hidden");
    renderAnswers();
    renderReveal(true);
  }

  function renderReveal(animate) {
    const q = byId(state.current);
    const last = state.history.find((x) => x.qid === q.id && !x.skipped) || { pts: [], winners: [] };
    const isChoice = q.type === "choice";
    const ansEl = $("#rv-answer");
    $("#rv-unit").textContent = isChoice ? "" : (q.unit || "");
    $("#rv-note").innerHTML = q.note ? `<b>Bilgi:</b> ${esc(q.note)}` : "";
    if (isChoice) {
      ansEl.textContent = LETTERS[q.a] + " · " + q.options[q.a].t;
      ansEl.style.fontSize = q.options[q.a].t.length > 18 ? "calc(var(--u) * 4)" : "calc(var(--u) * 6)";
      $$(".opt").forEach((el) => el.classList.add(+el.dataset.opt === q.a ? "correct" : "wrong"));
    } else {
      ansEl.style.fontSize = "";
      if (animate) HT.countUp(ansEl, q.a, 1100, Number.isInteger(q.a) ? 0 : 1);
      else ansEl.textContent = HT.fmt(q.a);
    }

    clearTimeout(revealTimer);
    revealTimer = setTimeout(() => {
      hosts.forEach((h, i) => {
        const card = $(`.ans[data-card="${i}"]`);
        if (!card) return;
        const a = state.answers[i];
        const val = card.querySelector(".val");
        const diff = card.querySelector(".diff");
        if (!val) return;
        if (a == null) { val.textContent = "—"; diff.innerHTML = "Cevap yok"; }
        else if (isChoice) {
          val.textContent = LETTERS[a];
          diff.innerHTML = (a === q.a ? "<b style='color:var(--accent)'>DOĞRU</b>" : "<b style='color:var(--danger)'>YANLIŞ</b>") + esc(q.options[a].t);
          diff.style.maxWidth = "75%";
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
      if (!isChoice) renderNumline(q); else $("#numline").innerHTML = "";
      $("#numline").classList.toggle("hidden", isChoice);
      if (animate) {
        renderScores(last.winners);
        if (last.winners.length) { sfx.reveal(); HT.confetti(last.winners.map((i) => hosts[i].color), 90); }
        else sfx.wrong();
        setTimeout(checkWinner, 1400);
      }
      $("#btn-next").focus();
    }, animate ? 1150 : 0);
  }

  function renderNumline(q) {
    const items = state.order.map((i) => ({ i, v: state.answers[i], c: hosts[i].color, n: hosts[i].name })).filter((x) => x.v != null);
    const vals = items.map((x) => x.v).concat([q.a]);
    let lo = Math.min(...vals), hi = Math.max(...vals);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.1;
    lo -= pad; hi += pad;
    const pos = (v) => ((v - lo) / (hi - lo)) * 100;
    // Birbirine çok yakın etiketler: yan yana koymak yerine etiket metnini kısalt
    const sorted = items.slice().sort((a, b) => a.v - b.v);
    const nl = $("#numline");
    nl.innerHTML = `<div class="track"></div>
      <div class="mk answer" style="--c:var(--gold);left:50%" data-left="${pos(q.a)}"><span class="tag">CEVAP · ${HT.fmt(q.a)}</span><span class="stem"></span><span class="dot"></span></div>
      ${sorted.map((it, k) => {
        const prev = sorted[k - 1];
        const tight = prev && pos(it.v) - pos(prev.v) < 9;
        return `<div class="mk lower" style="--c:${it.c};left:50%" data-left="${pos(it.v)}"><span class="tag" style="${tight ? "transform:translateY(calc(var(--u) * 2.6))" : ""}">${esc(it.n)} · ${HT.fmt(it.v)}</span><span class="stem" style="${tight ? "height:calc(var(--u) * 4.3)" : ""}"></span><span class="dot"></span></div>`;
      }).join("")}`;
    requestAnimationFrame(() => requestAnimationFrame(() => { $$(".mk", nl).forEach((m) => { m.style.left = m.dataset.left + "%"; }); }));
  }

  function undo() {
    if (state.phase !== "reveal" || !undoSnap) { HT.toast("Geri alınacak bir şey yok"); return; }
    clearTimeout(revealTimer);
    Object.assign(state, JSON.parse(undoSnap));
    state.phase = "answer";
    state.finished = false;
    state.editing = null;
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
    const podium = [order[1], order[0], order[2]].filter(Boolean);
    const heights = [26, 20, 16];
    const played = state.history.filter((x) => !x.skipped).length;
    $("#winner").innerHTML = `
      <div class="trophy">🏆</div>
      <div class="sub">Yaklaş Kazan şampiyonu</div>
      <h1 style="--c:${h.color}">${esc(h.name)}</h1>
      <div class="muted">${played} soruda ${state.scores[w]} puan</div>
      <div class="podium">
        ${podium.map((p) => {
          const rank = order.indexOf(p);
          return `<div class="step" style="--c:${p.x.color};height:calc(var(--u) * ${heights[rank]})"><div class="r">${rank + 1}.</div><div class="n">${esc(p.x.name)}</div><div class="p">${p.s} puan</div></div>`;
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
  const histModal = $("#history-modal");
  function openHistory() {
    const list = state.history.filter((x) => !x.skipped);
    $("#history-list").innerHTML = list.length ? list.map((hx) => {
      const q = byId(hx.qid);
      if (!q) return "";
      const ans = q.type === "choice" ? q.options[q.a].t : `${HT.fmt(q.a)} ${esc(q.unit || "")}`;
      const w = hx.winners.length ? hx.winners.map((i) => `<span style="color:${hosts[i].color}">${esc(hosts[i].name)} +${hx.pts[i]}</span>`).join(", ") : '<span class="muted">puan yok</span>';
      return `<div class="history-item"><span>${stripTags(q.q)}</span><b class="muted">${ans}</b><span class="w">${w}</span></div>`;
    }).join("") : '<div class="muted">Henüz soru oynanmadı.</div>';
    histModal.classList.add("show");
  }
  $("#btn-history").addEventListener("click", openHistory);
  $("#history-close").addEventListener("click", () => histModal.classList.remove("show"));
  histModal.addEventListener("click", (e) => { if (e.target === histModal) histModal.classList.remove("show"); });

  /* ---------------- Klavye ---------------- */
  document.addEventListener("keydown", (e) => {
    if ($("#game").classList.contains("hidden")) return;
    if ($(".modal.show")) { if (e.key === "Escape") $$(".modal.show").forEach((m) => m.classList.remove("show")); return; }
    const typing = e.target && /INPUT|TEXTAREA/.test(e.target.tagName);
    if (typing) return;
    const q = byId(state.current);
    const cur = currentPlayer();
    if (state.phase === "answer" && cur != null && q && q.type === "choice") {
      const map = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const k = map[e.key.toLowerCase()];
      if (k != null && k < q.options.length) { e.preventDefault(); commit(cur, k); return; }
    }
    if (e.key === "Enter") {
      if (e.target && e.target.tagName === "BUTTON" && !["btn-reveal", "btn-next"].includes(e.target.id)) return;
      e.preventDefault();
      if (state.phase === "answer") reveal();
      else if (!state.finished) nextQuestion();
      return;
    }
    const k = e.key.toLowerCase();
    if (k === "z") undo();
    if (k === "s") skip();
    if (k === "m") openHistory();
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
    list.push({ id: "u" + Date.now().toString(36), q: $("#cq-text").value.trim(), a, unit: $("#cq-unit").value.trim(), note: $("#cq-note").value.trim(), photo: photo || undefined, name: photo || undefined });
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
