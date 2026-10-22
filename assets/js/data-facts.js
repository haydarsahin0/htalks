/* =========================================================
   OTOMATİK SORU ÜRETECİ
   ---------------------------------------------------------
   Aşağıdaki tablolardan ve futbolcu havuzundan (data-players.js)
   yüzlerce soru üretir. Tablolara satır eklemek yeni soru demektir.
   Not: 2025-26 sezonu ve 2026 Dünya Kupası bilgileri bilerek
   eklenmedi; yalnızca 2025 yazına kadar kesinleşmiş veriler var.
   ========================================================= */
(function () {
  "use strict";

  /* ---------------- Yardımcılar ---------------- */
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // Soru kimliğine göre sabit rastgelelik: sayfa yenilense de şıklar aynı kalır
  function rng(seed) {
    let a = hashStr(seed);
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pickDistinct(pool, exclude, n, r) {
    const cand = Array.from(new Set(pool.filter((x) => !exclude.includes(x))));
    const out = [];
    while (out.length < n && cand.length) out.push(cand.splice(Math.floor(r() * cand.length), 1)[0]);
    return out;
  }
  function choice(id, cat, q, correct, pool, opts) {
    const o = opts || {};
    const r = rng(id);
    const others = pickDistinct(pool, [correct].concat(o.exclude || []), (o.n || 4) - 1, r);
    if (others.length < 1) return null;
    const all = others.concat([correct]);
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
    return {
      id, cat, type: "choice", q,
      options: all.map((t) => ({ t, photo: o.photos ? photoOf(t) : undefined })),
      a: all.indexOf(correct),
      note: o.note, photo: o.photo, name: o.name,
    };
  }
  const hl = (s) => `<span class='hl'>${String(s).replace(/</g, "&lt;")}</span>`;
  const OUT = [];
  const add = (q) => { if (q) OUT.push(q); };

  const PLAYERS = window.FOOTBALLERS || [];
  const byName = {};
  PLAYERS.forEach((p) => { byName[p.n] = p; });
  const ALIAS = {
    "Ronaldo": "Cristiano Ronaldo", "Messi": "Lionel Messi", "Lewandowski": "Robert Lewandowski", "Kane": "Harry Kane",
    "Haaland": "Erling Haaland", "Mbappé": "Kylian Mbappé", "Salah": "Mohamed Salah", "Henry": "Thierry Henry",
    "Suárez": "Luis Suárez", "Benzema": "Karim Benzema", "Drogba": "Didier Drogba", "Agüero": "Sergio Agüero",
    "Van Persie": "Robin van Persie", "Van Nistelrooy": "Ruud van Nistelrooy", "Shearer": "Alan Shearer",
    "Vardy": "Jamie Vardy", "Owen": "Michael Owen", "Berbatov": "Dimitar Berbatov", "Tevez": "Carlos Tevez",
    "Anelka": "Nicolas Anelka", "Mané": "Sadio Mané", "Aubameyang": "Pierre-Emerick Aubameyang", "Son": "Son Heung-min",
    "Eto'o": "Samuel Eto'o", "Forlán": "Diego Forlán", "Džeko": "Edin Džeko", "Gómez": "Mario Gómez",
    "Icardi": "Mauro Icardi", "Immobile": "Ciro Immobile", "Cavani": "Edinson Cavani", "Osimhen": "Victor Osimhen",
    "Lautaro": "Lautaro Martínez", "Ibrahimović": "Zlatan Ibrahimović", "Nkunku": "Christopher Nkunku",
    "Valencia": "Enner Valencia", "Sørloth": "Alexander Sørloth", "Gomis": "Bafétimbi Gomis", "Alex": "Alex de Souza",
    "Burak Yılmaz": "Burak Yılmaz", "Hakan Şükür": "Hakan Şükür", "Tanju Çolak": "Tanju Çolak",
  };
  function photoOf(name) {
    const full = ALIAS[name] || name;
    const p = byName[full];
    return p ? p.w : undefined;
  }

  /* =========================================================
     1) FUTBOLCU HAVUZUNDAN: doğum yılı · boy · milliyet
     ========================================================= */
  const countryNames = Object.values(window.COUNTRIES || {});
  PLAYERS.forEach((p, i) => {
    const slug = p.n.toLowerCase().replace(/[^a-z0-9]+/gi, "-");
    if (p.y) add({ id: "y-" + slug, cat: "Doğum Yılı", q: `${hl(p.n)} hangi yıl doğdu?`, a: p.y, unit: "yıl", photo: p.w, name: p.n, note: `${p.n}, ${p.y} doğumlu.` });
    if (p.h) add({ id: "h-" + slug, cat: "Boy", q: `${hl(p.n)} kaç santim?`, a: p.h, unit: "cm", photo: p.w, name: p.n, note: `${p.n} yaklaşık ${(p.h / 100).toFixed(2).replace(".", ",")} m (kaynağa göre ±1-2 cm).` });
    const cn = (window.COUNTRIES || {})[p.c];
    if (cn) add(choice("n-" + slug, "Milliyet", `${hl(p.n)} hangi ülkenin futbolcusu?`, cn, countryNames, { photo: p.w, name: p.n, note: `${p.n} — ${cn}.` }));
  });

  /* =========================================================
     2) LİG GOL KRALLARI  (sezon | oyuncu(lar) | gol)
     ========================================================= */
  const LEAGUES = {
    "Premier Lig": `1992-93|Teddy Sheringham|22
1993-94|Andy Cole|34
1994-95|Shearer|34
1995-96|Shearer|31
1996-97|Shearer|25
1997-98|Dion Dublin/Owen/Chris Sutton|18
1998-99|Jimmy Floyd Hasselbaink/Owen/Dwight Yorke|18
1999-00|Kevin Phillips|30
2000-01|Jimmy Floyd Hasselbaink|23
2001-02|Henry|24
2002-03|Van Nistelrooy|25
2003-04|Henry|30
2004-05|Henry|25
2005-06|Henry|27
2006-07|Drogba|20
2007-08|Ronaldo|31
2008-09|Anelka|19
2009-10|Drogba|29
2010-11|Berbatov/Tevez|20
2011-12|Van Persie|30
2012-13|Van Persie|26
2013-14|Suárez|31
2014-15|Agüero|26
2015-16|Kane|25
2016-17|Kane|29
2017-18|Salah|32
2018-19|Salah/Mané/Aubameyang|22
2019-20|Vardy|23
2020-21|Kane|23
2021-22|Salah/Son|23
2022-23|Haaland|36
2023-24|Haaland|27
2024-25|Salah|29`,
    "La Liga": `2004-05|Forlán|25
2005-06|Eto'o|26
2006-07|Van Nistelrooy|25
2007-08|Dani Güiza|27
2008-09|Forlán|32
2009-10|Messi|34
2010-11|Ronaldo|41
2011-12|Messi|50
2012-13|Messi|46
2013-14|Ronaldo|31
2014-15|Ronaldo|48
2015-16|Suárez|40
2016-17|Messi|37
2017-18|Messi|34
2018-19|Messi|36
2019-20|Messi|25
2020-21|Messi|30
2021-22|Benzema|27
2022-23|Lewandowski|23
2023-24|Artem Dovbyk|24
2024-25|Mbappé|31`,
    "Bundesliga": `1971-72|Gerd Müller|40
2009-10|Džeko|22
2010-11|Gómez|28
2011-12|Klaas-Jan Huntelaar|29
2012-13|Stefan Kießling|25
2013-14|Lewandowski|20
2014-15|Alexander Meier|19
2015-16|Lewandowski|30
2016-17|Aubameyang|31
2017-18|Lewandowski|29
2018-19|Lewandowski|22
2019-20|Lewandowski|34
2020-21|Lewandowski|41
2021-22|Lewandowski|35
2022-23|Niclas Füllkrug/Nkunku|16
2023-24|Kane|36
2024-25|Kane|26`,
    "Serie A": `2012-13|Cavani|29
2013-14|Immobile|22
2014-15|Icardi/Luca Toni|22
2015-16|Gonzalo Higuaín|36
2016-17|Džeko|29
2017-18|Icardi/Immobile|29
2018-19|Fabio Quagliarella|26
2019-20|Immobile|36
2020-21|Ronaldo|29
2021-22|Immobile|27
2022-23|Osimhen|26
2023-24|Lautaro|24
2024-25|Mateo Retegui|25`,
    "Ligue 1": `2012-13|Ibrahimović|30
2013-14|Ibrahimović|26
2014-15|Alexandre Lacazette|27
2015-16|Ibrahimović|38
2016-17|Cavani|35
2017-18|Cavani|28
2018-19|Mbappé|33
2019-20|Mbappé/Wissam Ben Yedder|18
2020-21|Mbappé|27
2021-22|Mbappé|28
2022-23|Mbappé|29
2023-24|Mbappé|27`,
    "Süper Lig": `1987-88|Tanju Çolak|39
1996-97|Hakan Şükür|38
2010-11|Alex|28
2011-12|Burak Yılmaz|33
2012-13|Burak Yılmaz|24
2015-16|Gómez|26
2017-18|Gomis|29
2018-19|Mbaye Diagne|30
2019-20|Sørloth|24
2020-21|Aaron Boupendza|22
2022-23|Valencia|29
2023-24|Icardi|25
2024-25|Osimhen|26`,
  };

  const SCORERS = []; // karşılaştırmalar için
  Object.keys(LEAGUES).forEach((lg) => {
    const rows = LEAGUES[lg].trim().split("\n").map((l) => { const [s, pl, g] = l.split("|"); return { s, pl: pl.split("/"), g: +g }; });
    const allNames = Array.from(new Set(rows.flatMap((r) => r.pl)));
    rows.forEach((r) => {
      const key = (lg + "-" + r.s).replace(/\s/g, "");
      const shared = r.pl.length > 1;
      const disp = (n) => (ALIAS[n] || n);
      const who = r.pl.map(disp).join(", ");
      add({
        id: "gk-" + key, cat: "Gol Kralları",
        q: shared ? `${lg} ${r.s} sezonunda gol krallığı paylaşıldı. ${hl(who)} kaçar gol attı?` : `${hl(disp(r.pl[0]))} ${r.s} ${lg} sezonunda kaç gol atarak gol kralı oldu?`,
        a: r.g, unit: "gol", photo: photoOf(r.pl[0]), name: disp(r.pl[0]),
        note: `${lg} ${r.s} gol kralı: ${who} (${r.g} gol).`,
      });
      if (!shared) {
        add(choice("gkc-" + key, "Gol Kralları", `${lg} ${hl(r.s)} sezonunun gol kralı kimdi?`, disp(r.pl[0]), allNames.map(disp), { photos: true, note: `${disp(r.pl[0])}, ${r.g} golle gol kralı oldu.` }));
        SCORERS.push({ lg, s: r.s, n: disp(r.pl[0]), g: r.g });
      }
    });
  });

  // Kim daha çok? — iki gol krallığı sezonunu karşılaştır
  for (let i = 0; i < SCORERS.length; i++) {
    const A = SCORERS[i];
    const r = rng("cmp" + i);
    for (let k = 0; k < 2; k++) {
      const B = SCORERS[Math.floor(r() * SCORERS.length)];
      if (!B || B === A || B.g === A.g || B.n === A.n) continue;
      const [x, y] = r() < 0.5 ? [A, B] : [B, A];
      const lx = `${x.n} (${x.lg} ${x.s})`;
      const ly = `${y.n} (${y.lg} ${y.s})`;
      add({
        id: `cmp-${x.lg}${x.s}-${y.lg}${y.s}`.replace(/\s/g, ""), cat: "Kim Daha Çok?", type: "choice",
        q: "Hangisi o sezon ligde daha çok gol attı?",
        options: [{ t: lx, photo: photoOf(x.n) }, { t: ly, photo: photoOf(y.n) }],
        a: x.g > y.g ? 0 : 1,
        note: `${x.n}: ${x.g} gol · ${y.n}: ${y.g} gol.`,
      });
    }
  }

  /* =========================================================
     3) BALLON D'OR  (yıl | kazanan)
     ========================================================= */
  const BALLON = `1970|Gerd Müller
1971|Johan Cruyff
1972|Franz Beckenbauer
1973|Johan Cruyff
1974|Johan Cruyff
1975|Oleg Blokhin
1976|Franz Beckenbauer
1977|Allan Simonsen
1978|Kevin Keegan
1979|Kevin Keegan
1980|Karl-Heinz Rummenigge
1981|Karl-Heinz Rummenigge
1982|Paolo Rossi
1983|Michel Platini
1984|Michel Platini
1985|Michel Platini
1986|Igor Belanov
1987|Ruud Gullit
1988|Marco van Basten
1989|Marco van Basten
1990|Lothar Matthäus
1991|Jean-Pierre Papin
1992|Marco van Basten
1993|Roberto Baggio
1994|Hristo Stoichkov
1995|George Weah
1996|Matthias Sammer
1997|Ronaldo Nazário
1998|Zinedine Zidane
1999|Rivaldo
2000|Luís Figo
2001|Michael Owen
2002|Ronaldo Nazário
2003|Pavel Nedvěd
2004|Andriy Shevchenko
2005|Ronaldinho
2006|Fabio Cannavaro
2007|Kaká
2008|Cristiano Ronaldo
2009|Lionel Messi
2010|Lionel Messi
2011|Lionel Messi
2012|Lionel Messi
2013|Cristiano Ronaldo
2014|Cristiano Ronaldo
2015|Lionel Messi
2016|Cristiano Ronaldo
2017|Cristiano Ronaldo
2018|Luka Modrić
2019|Lionel Messi
2021|Lionel Messi
2022|Karim Benzema
2023|Lionel Messi
2024|Rodri
2025|Ousmane Dembélé`.split("\n").map((l) => { const [y, n] = l.split("|"); return { y: +y, n }; });
  const bWinners = BALLON.map((b) => b.n);
  BALLON.forEach((b) => {
    add(choice("bdo-" + b.y, "Ballon d'Or", `${hl(b.y)} Ballon d'Or ödülünü kim kazandı?`, b.n, bWinners, { photos: true, note: `${b.y} Ballon d'Or: ${b.n}.` }));
  });
  const bCount = {};
  BALLON.forEach((b) => { bCount[b.n] = (bCount[b.n] || 0) + 1; });
  BALLON.filter((b) => bCount[b.n] === 1 && b.y >= 1980).forEach((b) => {
    add({ id: "bdy-" + b.y, cat: "Ballon d'Or", q: `${hl(b.n)} Ballon d'Or'u hangi yıl kazandı?`, a: b.y, unit: "yıl", photo: photoOf(b.n), name: b.n, note: `${b.n}, ${b.y} Ballon d'Or sahibi.` });
  });
  ["Johan Cruyff", "Michel Platini", "Marco van Basten", "Franz Beckenbauer", "Kevin Keegan", "Karl-Heinz Rummenigge", "Ronaldo Nazário"].forEach((n) => {
    add({ id: "bdn-" + n.replace(/\W/g, ""), cat: "Ballon d'Or", q: `${hl(n)} kaç kez Ballon d'Or kazandı?`, a: bCount[n], unit: "kez", photo: photoOf(n), name: n, note: `${n}: ${bCount[n]} Ballon d'Or (${BALLON.filter((b) => b.n === n).map((b) => b.y).join(", ")}).` });
  });

  /* =========================================================
     4) ŞAMPİYONLAR LİGİ FİNALLERİ  (yıl | kazanan | kaybeden | skor | not)
     ========================================================= */
  const UCL = `1993|Marseille|Milan|1-0|
1994|Milan|Barcelona|4-0|
1995|Ajax|Milan|1-0|
1996|Juventus|Ajax|1-1|penaltılar
1997|Borussia Dortmund|Juventus|3-1|
1998|Real Madrid|Juventus|1-0|
1999|Manchester United|Bayern Münih|2-1|
2000|Real Madrid|Valencia|3-0|
2001|Bayern Münih|Valencia|1-1|penaltılar
2002|Real Madrid|Bayer Leverkusen|2-1|
2003|Milan|Juventus|0-0|penaltılar
2004|Porto|Monaco|3-0|
2005|Liverpool|Milan|3-3|penaltılar · İstanbul mucizesi
2006|Barcelona|Arsenal|2-1|
2007|Milan|Liverpool|2-1|
2008|Manchester United|Chelsea|1-1|penaltılar
2009|Barcelona|Manchester United|2-0|
2010|Inter|Bayern Münih|2-0|
2011|Barcelona|Manchester United|3-1|
2012|Chelsea|Bayern Münih|1-1|penaltılar
2013|Bayern Münih|Borussia Dortmund|2-1|
2014|Real Madrid|Atlético Madrid|4-1|uzatmalarda
2015|Barcelona|Juventus|3-1|
2016|Real Madrid|Atlético Madrid|1-1|penaltılar
2017|Real Madrid|Juventus|4-1|
2018|Real Madrid|Liverpool|3-1|
2019|Liverpool|Tottenham|2-0|
2020|Bayern Münih|PSG|1-0|
2021|Chelsea|Manchester City|1-0|
2022|Real Madrid|Liverpool|1-0|
2023|Manchester City|Inter|1-0|
2024|Real Madrid|Borussia Dortmund|2-0|
2025|PSG|Inter|5-0|`.split("\n").map((l) => { const [y, w, ls, sc, n] = l.split("|"); return { y: +y, w, l: ls, sc, n }; });
  const uclClubs = Array.from(new Set(UCL.flatMap((u) => [u.w, u.l])));
  UCL.forEach((u) => {
    const extra = u.n ? ` (${u.n})` : "";
    add(choice("ucl-" + u.y, "Şampiyonlar Ligi", `${hl(u.y)} Şampiyonlar Ligi finalini hangi takım kazandı?`, u.w, uclClubs, { note: `${u.y} finali: ${u.w} ${u.sc} ${u.l}${extra}.` }));
    add({ id: "ucly-" + u.y, cat: "Şampiyonlar Ligi", q: `${hl(u.w)}, finalde ${hl(u.l)} karşısında hangi yıl Şampiyonlar Ligi'ni kazandı?`, a: u.y, unit: "yıl", note: `${u.y} finali: ${u.w} ${u.sc} ${u.l}${extra}.` });
    const [g1, g2] = u.sc.split("-").map(Number);
    add({ id: "uclg-" + u.y, cat: "Şampiyonlar Ligi", q: `${hl(u.y)} Şampiyonlar Ligi finalinde (${u.w} – ${u.l}) toplam kaç gol atıldı? (penaltılar hariç)`, a: g1 + g2, unit: "gol", note: `Skor: ${u.w} ${u.sc} ${u.l}${extra}.` });
  });

  /* =========================================================
     5) DÜNYA KUPASI  (yıl | ev sahibi | şampiyon | finalist | final skoru | gol kralı | gol)
     ========================================================= */
  const WC = `1930|Uruguay|Uruguay|Arjantin|4-2||
1934|İtalya|İtalya|Çekoslovakya|2-1||
1938|Fransa|İtalya|Macaristan|4-2||
1954|İsviçre|Batı Almanya|Macaristan|3-2||
1958|İsveç|Brezilya|İsveç|5-2|Just Fontaine|13
1962|Şili|Brezilya|Çekoslovakya|3-1||
1966|İngiltere|İngiltere|Batı Almanya|4-2||
1970|Meksika|Brezilya|İtalya|4-1|Gerd Müller|10
1974|Batı Almanya|Batı Almanya|Hollanda|2-1|Grzegorz Lato|7
1978|Arjantin|Arjantin|Hollanda|3-1|Mario Kempes|6
1982|İspanya|İtalya|Batı Almanya|3-1|Paolo Rossi|6
1986|Meksika|Arjantin|Batı Almanya|3-2|Gary Lineker|6
1990|İtalya|Batı Almanya|Arjantin|1-0|Salvatore Schillaci|6
1994|ABD|Brezilya|İtalya|0-0|Hristo Stoichkov|6
1998|Fransa|Fransa|Brezilya|3-0|Davor Šuker|6
2002|Güney Kore & Japonya|Brezilya|Almanya|2-0|Ronaldo Nazário|8
2006|Almanya|İtalya|Fransa|1-1|Miroslav Klose|5
2010|Güney Afrika|İspanya|Hollanda|1-0|Thomas Müller|5
2014|Brezilya|Almanya|Arjantin|1-0|James Rodríguez|6
2018|Rusya|Fransa|Hırvatistan|4-2|Harry Kane|6
2022|Katar|Arjantin|Fransa|3-3|Kylian Mbappé|8`.split("\n").map((l) => { const [y, h, w, r, sc, ts, tg] = l.split("|"); return { y: +y, h, w, r, sc, ts, tg: +tg }; });
  const wcTeams = Array.from(new Set(WC.flatMap((x) => [x.w, x.r]).concat(["Hollanda", "Portekiz", "Belçika", "Hırvatistan", "Uruguay"])));
  const wcHosts = Array.from(new Set(WC.map((x) => x.h).concat(["Kanada", "Japonya", "Türkiye"])));
  WC.forEach((x) => {
    const pens = x.sc.split("-")[0] === x.sc.split("-")[1] ? " (penaltılarla)" : "";
    add(choice("wc-" + x.y, "Dünya Kupası", `${hl(x.y)} Dünya Kupası'nı kim kazandı?`, x.w, wcTeams, { note: `${x.y} finali: ${x.w} ${x.sc} ${x.r}${pens}.` }));
    add(choice("wch-" + x.y, "Dünya Kupası", `${hl(x.y)} Dünya Kupası hangi ülkede oynandı?`, x.h, wcHosts, { note: `${x.y} Dünya Kupası — ev sahibi: ${x.h}, şampiyon: ${x.w}.` }));
    add({ id: "wcy-" + x.y, cat: "Dünya Kupası", q: `${hl(x.w)}, finalde ${hl(x.r)} karşısında hangi yıl Dünya Kupası'nı kazandı?`, a: x.y, unit: "yıl", note: `${x.y} finali: ${x.w} ${x.sc} ${x.r}${pens}.` });
    add({ id: "wcg-" + x.y, cat: "Dünya Kupası", q: `${hl(x.y)} Dünya Kupası finalinde (${x.w} – ${x.r}) toplam kaç gol atıldı? (penaltılar hariç)`, a: x.sc.split("-").map(Number).reduce((a, b) => a + b, 0), unit: "gol", note: `Skor: ${x.w} ${x.sc} ${x.r}${pens}.` });
    if (x.ts) add({ id: "wcs-" + x.y, cat: "Dünya Kupası", q: `${hl(x.ts)} ${x.y} Dünya Kupası'nda kaç gol atarak gol kralı oldu?`, a: x.tg, unit: "gol", photo: photoOf(x.ts), name: x.ts, note: `${x.y} gol kralı: ${x.ts}, ${x.tg} gol${x.y === 1994 ? " (Oleg Salenko ile paylaştı)" : ""}.` });
  });
  [["Brezilya", 5], ["Almanya", 4], ["İtalya", 4], ["Arjantin", 3], ["Fransa", 2], ["Uruguay", 2]].forEach(([t, n]) => {
    add({ id: "wcn-" + t, cat: "Dünya Kupası", q: `${hl(t)} 2022 Dünya Kupası dahil kaç kez dünya şampiyonu oldu?`, a: n, unit: "kez", note: `${t}: ${n} Dünya Kupası (2022 itibarıyla; Almanya'nınkiler Batı Almanya dahil).` });
  });

  /* =========================================================
     6) AVRUPA ŞAMPİYONASI  (yıl | şampiyon | finalist)
     ========================================================= */
  const EURO = `1960|Sovyetler Birliği|Yugoslavya
1964|İspanya|Sovyetler Birliği
1968|İtalya|Yugoslavya
1972|Batı Almanya|Sovyetler Birliği
1976|Çekoslovakya|Batı Almanya
1980|Batı Almanya|Belçika
1984|Fransa|İspanya
1988|Hollanda|Sovyetler Birliği
1992|Danimarka|Almanya
1996|Almanya|Çek Cumhuriyeti
2000|Fransa|İtalya
2004|Yunanistan|Portekiz
2008|İspanya|Almanya
2012|İspanya|İtalya
2016|Portekiz|Fransa
2020|İtalya|İngiltere
2024|İspanya|İngiltere`.split("\n").map((l) => { const [y, w, r] = l.split("|"); return { y: +y, w, r }; });
  const euroTeams = Array.from(new Set(EURO.flatMap((e) => [e.w, e.r]).concat(["Türkiye", "Hırvatistan", "Belçika"])));
  EURO.forEach((e) => {
    add(choice("eu-" + e.y, "EURO", `${hl("EURO " + e.y)} şampiyonu hangi ülke?`, e.w, euroTeams, { note: `EURO ${e.y} finali: ${e.w} – ${e.r}.` }));
    add({ id: "euy-" + e.y, cat: "EURO", q: `${hl(e.w)}, finalde ${hl(e.r)} karşısında hangi yıl Avrupa şampiyonu oldu?`, a: e.y, unit: "yıl", note: `EURO ${e.y}: ${e.w} şampiyon, ${e.r} finalist.` });
  });

  /* =========================================================
     7) SÜPER LİG ŞAMPİYONLARI
     ========================================================= */
  const SL = `1989-90|Beşiktaş
1990-91|Beşiktaş
1991-92|Beşiktaş
1992-93|Galatasaray
1993-94|Galatasaray
1994-95|Beşiktaş
1995-96|Fenerbahçe
1996-97|Galatasaray
1997-98|Galatasaray
1998-99|Galatasaray
1999-00|Galatasaray
2000-01|Fenerbahçe
2001-02|Galatasaray
2002-03|Beşiktaş
2003-04|Fenerbahçe
2004-05|Fenerbahçe
2005-06|Galatasaray
2006-07|Fenerbahçe
2007-08|Galatasaray
2008-09|Beşiktaş
2009-10|Bursaspor
2010-11|Fenerbahçe
2011-12|Galatasaray
2012-13|Galatasaray
2013-14|Fenerbahçe
2014-15|Galatasaray
2015-16|Beşiktaş
2016-17|Beşiktaş
2017-18|Galatasaray
2018-19|Galatasaray
2019-20|Başakşehir
2020-21|Beşiktaş
2021-22|Trabzonspor
2022-23|Galatasaray
2023-24|Galatasaray
2024-25|Galatasaray`.split("\n").map((l) => { const [s, w] = l.split("|"); return { s, w }; });
  const slTeams = ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Bursaspor", "Başakşehir"];
  SL.forEach((x) => {
    add(choice("sl-" + x.s, "Süper Lig", `${hl(x.s)} sezonunda Süper Lig şampiyonu kimdi?`, x.w, slTeams, { note: `${x.s} şampiyonu: ${x.w}.` }));
  });
  [["Bursaspor", "2009-10"], ["Başakşehir", "2019-20"]].forEach(([t, s]) => {
    add({ id: "sly-" + t, cat: "Süper Lig", q: `${hl(t)} tarihindeki tek Süper Lig şampiyonluğunu hangi sezon kazandı? (sezonun bitiş yılı)`, a: +("20" + s.slice(-2)), unit: "yıl", note: `${t}, ${s} sezonunda şampiyon oldu.` });
  });

  /* =========================================================
     8) STADYUMLAR
     ========================================================= */
  const STADIUMS = [
    ["Anfield", "Liverpool"], ["Old Trafford", "Manchester United"], ["Santiago Bernabéu", "Real Madrid"],
    ["Camp Nou", "Barcelona"], ["Allianz Arena", "Bayern Münih"], ["Signal Iduna Park", "Borussia Dortmund"],
    ["Emirates Stadyumu", "Arsenal"], ["Stamford Bridge", "Chelsea"], ["Etihad Stadyumu", "Manchester City"],
    ["Parc des Princes", "PSG"], ["Metropolitano", "Atlético Madrid"], ["Allianz Stadium (Torino)", "Juventus"],
    ["Şükrü Saracoğlu", "Fenerbahçe"], ["RAMS Park (Ali Sami Yen)", "Galatasaray"], ["Tüpraş Stadyumu (eski Vodafone Park)", "Beşiktaş"],
    ["Papara Park (Şenol Güneş)", "Trabzonspor"], ["St James' Park", "Newcastle United"], ["Mestalla", "Valencia"],
    ["Estádio da Luz", "Benfica"], ["Estádio do Dragão", "Porto"], ["Celtic Park", "Celtic"], ["Johan Cruijff Arena", "Ajax"],
    ["La Bombonera", "Boca Juniors"], ["El Monumental", "River Plate"], ["Diego Armando Maradona Stadyumu", "Napoli"],
    ["BayArena", "Bayer Leverkusen"], ["Villa Park", "Aston Villa"],
  ];
  const stClubs = Array.from(new Set(STADIUMS.map((s) => s[1])));
  STADIUMS.forEach(([s, c]) => {
    add(choice("st-" + s.replace(/\W/g, ""), "Stadyumlar", `${hl(s)} hangi takımın stadı?`, c, stClubs, { note: `${s} → ${c}.` }));
  });

  const seen = new Set();
  window.GENERATED_QUESTIONS = OUT.filter((q) => (seen.has(q.id) ? false : seen.add(q.id)));
})();
