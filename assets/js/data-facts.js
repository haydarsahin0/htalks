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
    "Burak Yılmaz": "Burak Yılmaz", "Tanju Çolak": "Tanju Çolak",
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

  /* =========================================================
     9) LİG ŞAMPİYONLARI (sezon | şampiyon)
     ========================================================= */
  const CHAMPS = {
    "Premier Lig": `1992-93|Manchester United
1993-94|Manchester United
1994-95|Blackburn Rovers
1995-96|Manchester United
1996-97|Manchester United
1997-98|Arsenal
1998-99|Manchester United
1999-00|Manchester United
2000-01|Manchester United
2001-02|Arsenal
2002-03|Manchester United
2003-04|Arsenal
2004-05|Chelsea
2005-06|Chelsea
2006-07|Manchester United
2007-08|Manchester United
2008-09|Manchester United
2009-10|Chelsea
2010-11|Manchester United
2011-12|Manchester City
2012-13|Manchester United
2013-14|Manchester City
2014-15|Chelsea
2015-16|Leicester City
2016-17|Chelsea
2017-18|Manchester City
2018-19|Manchester City
2019-20|Liverpool
2020-21|Manchester City
2021-22|Manchester City
2022-23|Manchester City
2023-24|Manchester City
2024-25|Liverpool`,
    "La Liga": `2000-01|Real Madrid
2001-02|Valencia
2002-03|Real Madrid
2003-04|Valencia
2004-05|Barcelona
2005-06|Barcelona
2006-07|Real Madrid
2007-08|Real Madrid
2008-09|Barcelona
2009-10|Barcelona
2010-11|Barcelona
2011-12|Real Madrid
2012-13|Barcelona
2013-14|Atlético Madrid
2014-15|Barcelona
2015-16|Barcelona
2016-17|Real Madrid
2017-18|Barcelona
2018-19|Barcelona
2019-20|Real Madrid
2020-21|Atlético Madrid
2021-22|Real Madrid
2022-23|Barcelona
2023-24|Real Madrid
2024-25|Barcelona`,
    "Serie A": `2000-01|Roma
2001-02|Juventus
2002-03|Juventus
2003-04|Milan
2006-07|Inter
2007-08|Inter
2008-09|Inter
2009-10|Inter
2010-11|Milan
2011-12|Juventus
2012-13|Juventus
2013-14|Juventus
2014-15|Juventus
2015-16|Juventus
2016-17|Juventus
2017-18|Juventus
2018-19|Juventus
2019-20|Juventus
2020-21|Inter
2021-22|Milan
2022-23|Napoli
2023-24|Inter
2024-25|Napoli`,
    "Bundesliga": `1999-00|Bayern Münih
2000-01|Bayern Münih
2001-02|Borussia Dortmund
2002-03|Bayern Münih
2003-04|Werder Bremen
2004-05|Bayern Münih
2005-06|Bayern Münih
2006-07|Stuttgart
2007-08|Bayern Münih
2008-09|Wolfsburg
2009-10|Bayern Münih
2010-11|Borussia Dortmund
2011-12|Borussia Dortmund
2012-13|Bayern Münih
2018-19|Bayern Münih
2022-23|Bayern Münih
2023-24|Bayer Leverkusen
2024-25|Bayern Münih`,
    "Ligue 1": `2001-02|Lyon
2002-03|Lyon
2003-04|Lyon
2004-05|Lyon
2005-06|Lyon
2006-07|Lyon
2007-08|Lyon
2008-09|Bordeaux
2009-10|Marsilya
2010-11|Lille
2011-12|Montpellier
2012-13|PSG
2016-17|Monaco
2020-21|Lille
2024-25|PSG`,
  };
  Object.keys(CHAMPS).forEach((lg) => {
    const rows = CHAMPS[lg].trim().split("\n").map((l) => { const [s, w] = l.split("|"); return { s, w }; });
    const teams = Array.from(new Set(rows.map((r) => r.w)));
    rows.forEach((r) => add(choice(("lc-" + lg + r.s).replace(/\s/g, ""), "Lig Şampiyonları", `${lg} ${hl(r.s)} sezonunun şampiyonu kimdi?`, r.w, teams, { note: `${lg} ${r.s}: ${r.w}.` })));
  });
  [["Leicester City", "Premier Lig", 2016, "5000'e 1 oranla gelen mucize şampiyonluk."], ["Blackburn Rovers", "Premier Lig", 1995, "Alan Shearer'lı Blackburn."], ["Montpellier", "Ligue 1", 2012, "Olivier Giroud gol kralı oldu."], ["Wolfsburg", "Bundesliga", 2009, "Džeko ve Grafite ile."], ["Bayer Leverkusen", "Bundesliga", 2024, "Xabi Alonso'nun takımı ligi namağlup bitirdi."]].forEach(([t, lg, y, n]) => {
    add({ id: "lcy-" + t.replace(/\W/g, ""), cat: "Lig Şampiyonları", q: `${hl(t)} tarihindeki ilk ${lg} şampiyonluğunu hangi yıl kazandı?${t === "Blackburn Rovers" ? " (Premier Lig dönemi)" : ""}`, a: y, unit: "yıl", note: `${t}: ${y}. ${n}` });
  });
  add({ id: "lc-juve9", cat: "Lig Şampiyonları", q: `${hl("Juventus")} 2011-12'den başlayarak Serie A'yı üst üste kaç kez kazandı?`, a: 9, unit: "kez", note: "2011-12'den 2019-20'ye kadar üst üste 9 şampiyonluk." });
  add({ id: "lc-bayern11", cat: "Lig Şampiyonları", q: `${hl("Bayern Münih")} 2012-13'ten başlayarak Bundesliga'yı üst üste kaç kez kazandı?`, a: 11, unit: "kez", note: "2012-13'ten 2022-23'e kadar üst üste 11 şampiyonluk; seriyi Leverkusen bitirdi." });
  add({ id: "lc-lyon7", cat: "Lig Şampiyonları", q: `${hl("Lyon")} Ligue 1'i üst üste kaç kez kazandı?`, a: 7, unit: "kez", note: "2001-02'den 2007-08'e kadar üst üste 7 şampiyonluk." });
  add({ id: "lc-city4", cat: "Lig Şampiyonları", q: `${hl("Manchester City")} 2020-21'den başlayarak Premier Lig'i üst üste kaç kez kazandı?`, a: 4, unit: "kez", note: "2020-21'den 2023-24'e kadar üst üste 4 şampiyonluk — Premier Lig rekoru." });

  /* =========================================================
     10) UEFA KUPASI / AVRUPA LİGİ FİNALLERİ
     ========================================================= */
  const UEL = `2000|Galatasaray|Arsenal|0-0|penaltılar 4-1 · Kopenhag
2001|Liverpool|Alavés|5-4|altın gol
2002|Feyenoord|Borussia Dortmund|3-2|
2003|Porto|Celtic|3-2|uzatmalarda
2004|Valencia|Marsilya|2-0|
2005|CSKA Moskova|Sporting|3-1|
2006|Sevilla|Middlesbrough|4-0|
2007|Sevilla|Espanyol|2-2|penaltılar
2008|Zenit|Rangers|2-0|
2009|Shakhtar Donetsk|Werder Bremen|2-1|uzatmalarda
2010|Atlético Madrid|Fulham|2-1|uzatmalarda
2011|Porto|Braga|1-0|
2012|Atlético Madrid|Athletic Bilbao|3-0|
2013|Chelsea|Benfica|2-1|
2014|Sevilla|Benfica|0-0|penaltılar
2015|Sevilla|Dnipro|3-2|
2016|Sevilla|Liverpool|3-1|
2017|Manchester United|Ajax|2-0|
2018|Atlético Madrid|Marsilya|3-0|
2019|Chelsea|Arsenal|4-1|
2020|Sevilla|Inter|3-2|
2021|Villarreal|Manchester United|1-1|penaltılar
2022|Eintracht Frankfurt|Rangers|1-1|penaltılar
2023|Sevilla|Roma|1-1|penaltılar
2024|Atalanta|Bayer Leverkusen|3-0|
2025|Tottenham|Manchester United|1-0|`.split("\n").map((l) => { const [y, w, ls, sc, n] = l.split("|"); return { y: +y, w, l: ls, sc, n }; });
  const uelClubs = Array.from(new Set(UEL.flatMap((u) => [u.w, u.l])));
  UEL.forEach((u) => {
    const extra = u.n ? ` (${u.n})` : "";
    add(choice("uel-" + u.y, "Avrupa Ligi", `${hl(u.y)} UEFA Kupası / Avrupa Ligi finalini kim kazandı?`, u.w, uelClubs, { note: `${u.y} finali: ${u.w} ${u.sc} ${u.l}${extra}.` }));
    add({ id: "uely-" + u.y, cat: "Avrupa Ligi", q: `${hl(u.w)}, finalde ${hl(u.l)} karşısında hangi yıl UEFA Kupası / Avrupa Ligi'ni kazandı?`, a: u.y, unit: "yıl", note: `${u.y} finali: ${u.w} ${u.sc} ${u.l}${extra}.` });
  });
  add({ id: "uel-sevilla", cat: "Avrupa Ligi", q: `${hl("Sevilla")} 2025'e kadar UEFA Kupası / Avrupa Ligi'ni kaç kez kazandı?`, a: 7, unit: "kez", note: "2006, 2007, 2014, 2015, 2016, 2020, 2023 — rekor." });
  add({ id: "uel-gs-pen", cat: "Avrupa Ligi", q: `${hl("Galatasaray")} 2000 UEFA Kupası finalinde Arsenal'e karşı penaltılarda kaç gol attı?`, a: 4, unit: "penaltı", note: "Galatasaray penaltıları 4-1 kazandı; son penaltıyı Popescu attı." });
  add({ id: "usc-2000", cat: "Avrupa Ligi", q: `${hl("Galatasaray")} 2000 UEFA Süper Kupası'nda Real Madrid'i yendi. Maçta toplam kaç gol atıldı?`, a: 3, unit: "gol", note: "Galatasaray 2-1 Real Madrid, Jardel altın golle kazandırdı." });

  /* =========================================================
     11) COPA AMERICA · AFRİKA KUPASI
     ========================================================= */
  const COPA = `2004|Brezilya|Arjantin|2-2|penaltılar
2007|Brezilya|Arjantin|3-0|
2011|Uruguay|Paraguay|3-0|
2015|Şili|Arjantin|0-0|penaltılar
2016|Şili|Arjantin|0-0|penaltılar
2019|Brezilya|Peru|3-1|
2021|Arjantin|Brezilya|1-0|
2024|Arjantin|Kolombiya|1-0|uzatmalarda`.split("\n").map((l) => { const [y, w, r, sc, n] = l.split("|"); return { y: +y, w, r, sc, n }; });
  const copaTeams = ["Brezilya", "Arjantin", "Uruguay", "Şili", "Kolombiya", "Paraguay", "Peru"];
  COPA.forEach((c) => add(choice("copa-" + c.y, "Copa América & Afrika", `${hl("Copa América " + c.y)} şampiyonu hangi ülke?`, c.w, copaTeams, { note: `${c.y} finali: ${c.w} ${c.sc} ${c.r}${c.n ? " (" + c.n + ")" : ""}.` })));
  add({ id: "copa-uy", cat: "Copa América & Afrika", q: `${hl("Uruguay")} 2025'e kadar kaç kez Copa América kazandı?`, a: 15, unit: "kez", note: "Uruguay 15 kez; Arjantin 2024 zaferiyle 16'ya çıkıp rekoru tek başına aldı." });
  add({ id: "copa-ar", cat: "Copa América & Afrika", q: `${hl("Arjantin")} 2024 dahil kaç kez Copa América kazandı?`, a: 16, unit: "kez", note: "2024 zaferiyle 16 — rekor." });
  const AFCON = `2006|Mısır
2008|Mısır
2010|Mısır
2012|Zambiya
2013|Nijerya
2015|Fildişi Sahili
2017|Kamerun
2019|Cezayir
2021|Senegal
2023|Fildişi Sahili`.split("\n").map((l) => { const [y, w] = l.split("|"); return { y: +y, w }; });
  const afTeams = ["Mısır", "Zambiya", "Nijerya", "Fildişi Sahili", "Kamerun", "Cezayir", "Senegal", "Fas", "Gana"];
  AFCON.forEach((c) => add(choice("afcon-" + c.y, "Copa América & Afrika", `${hl("Afrika Uluslar Kupası " + c.y)} şampiyonu hangi ülke?`, c.w, afTeams, { note: `${c.y} Afrika Uluslar Kupası: ${c.w}${c.y === 2023 ? " (turnuva Ocak-Şubat 2024'te oynandı)" : ""}.` })));
  add({ id: "afcon-eg", cat: "Copa América & Afrika", q: `${hl("Mısır")} Afrika Uluslar Kupası'nı 2006-2010 arasında üst üste kaç kez kazandı?`, a: 3, unit: "kez", note: "2006, 2008, 2010 — üst üste 3." });

  /* =========================================================
     12) DÜNYA KUPASI ALTIN TOP · EURO GOL KRALLARI
     ========================================================= */
  const GOLDBALL = `1982|Paolo Rossi
1986|Diego Maradona
1990|Salvatore Schillaci
1994|Romário
1998|Ronaldo Nazário
2002|Oliver Kahn
2006|Zinedine Zidane
2010|Diego Forlán
2014|Lionel Messi
2018|Luka Modrić
2022|Lionel Messi`.split("\n").map((l) => { const [y, n] = l.split("|"); return { y: +y, n }; });
  const gbNames = Array.from(new Set(GOLDBALL.map((g) => g.n)));
  GOLDBALL.forEach((g) => add(choice("gb-" + g.y, "Dünya Kupası", `${hl(g.y)} Dünya Kupası'nda turnuvanın en iyi oyuncusu (Altın Top) kimdi?`, g.n, gbNames, { photos: true, note: `${g.y} Altın Top: ${g.n}.` })));
  add({ id: "gb-kahn", cat: "Dünya Kupası", q: `Dünya Kupası tarihinde Altın Top'u kazanan tek kaleci ${hl("Oliver Kahn")}. Hangi turnuvada kazandı?`, a: 2002, unit: "yıl", photo: "Oliver Kahn", note: "2002 Güney Kore-Japonya; Almanya finalde Brezilya'ya yenildi." });
  [["Michel Platini", 1984, 9, "EURO 1984'te 9 gol — tek turnuva rekoru."], ["Antoine Griezmann", 2016, 6, "EURO 2016'da 6 gol, Fransa finalde Portekiz'e yenildi."], ["Milan Baroš", 2004, 5, "EURO 2004'te 5 gol."], ["David Villa", 2008, 4, "EURO 2008'de 4 gol, İspanya şampiyon."]].forEach(([n, y, g, note]) => {
    add({ id: "eus-" + y, cat: "EURO", q: `${hl(n)} EURO ${y}'te kaç gol atarak gol kralı oldu?`, a: g, unit: "gol", photo: photoOf(n), name: n, note });
  });

  /* =========================================================
     13) KUPA SAYILARI (2025 yazı itibarıyla)
     ========================================================= */
  [["Real Madrid", 15], ["Milan", 7], ["Bayern Münih", 6], ["Liverpool", 6], ["Barcelona", 5], ["Ajax", 4], ["Inter", 3], ["Manchester United", 3]].forEach(([t, n]) => {
    add({ id: "uclc-" + t.replace(/\W/g, ""), cat: "Kupa Sayıları", q: `${hl(t)} 2025 finali dahil kaç kez Avrupa Kupası / Şampiyonlar Ligi kazandı?`, a: n, unit: "kez", note: `${t}: ${n} Avrupa şampiyonluğu (2025 yazı itibarıyla).` });
  });
  [["Galatasaray", 25], ["Fenerbahçe", 19], ["Beşiktaş", 16], ["Trabzonspor", 7]].forEach(([t, n]) => {
    add({ id: "slc-" + t, cat: "Kupa Sayıları", q: `${hl(t)} 2024-25 sezonu dahil kaç kez Süper Lig şampiyonu oldu?`, a: n, unit: "kez", note: `${t}: ${n} Süper Lig şampiyonluğu (1959'dan beri oynanan Türkiye Ligi sayımıyla, 2024-25 dahil).` });
  });
  const COUNTS = [["Real Madrid (Şampiyonlar Ligi)", 15], ["Milan (Şampiyonlar Ligi)", 7], ["Bayern (Şampiyonlar Ligi)", 6], ["Barcelona (Şampiyonlar Ligi)", 5], ["Galatasaray (Süper Lig)", 25], ["Fenerbahçe (Süper Lig)", 19], ["Beşiktaş (Süper Lig)", 16], ["Sevilla (Avrupa Ligi)", 7], ["Brezilya (Dünya Kupası)", 5], ["Almanya (Dünya Kupası)", 4], ["Arjantin (Copa América)", 16], ["İspanya (EURO)", 4]];
  for (let i = 0; i < COUNTS.length; i++) {
    for (let j = i + 1; j < COUNTS.length; j++) {
      const [a, na] = COUNTS[i], [b, nb] = COUNTS[j];
      if (na === nb || (i + j) % 3 !== 0) continue;
      add({ id: `kcmp-${i}-${j}`, cat: "Kim Daha Çok?", type: "choice", q: "Hangisinin kupası daha çok? (2025 yazı itibarıyla)", options: [{ t: a }, { t: b }], a: na > nb ? 0 : 1, note: `${a}: ${na} · ${b}: ${nb}.` });
    }
  }

  /* =========================================================
     14) FORMA NUMARALARI
     ========================================================= */
  const SHIRTS = [
    ["Johan Cruyff", "Ajax ve Hollanda'da efsaneleşen", 14], ["Thierry Henry", "Arsenal'de", 14], ["Andrea Pirlo", "Milan ve Juventus'ta", 21],
    ["Kaká", "Milan'da", 22], ["Paolo Maldini", "Milan'da emekliye ayrılan", 3], ["Zinedine Zidane", "Real Madrid'de", 5],
    ["David Beckham", "Real Madrid'de", 23], ["David Beckham", "Manchester United'da", 7], ["Ronaldinho", "Milan'da", 80],
    ["Pavel Nedvěd", "Juventus'ta", 11], ["Javier Zanetti", "Inter'de emekliye ayrılan", 4], ["Carles Puyol", "Barcelona'da", 5],
    ["Xavi", "Barcelona'da", 6], ["Andrés Iniesta", "Barcelona'da", 8], ["Lionel Messi", "PSG'de", 30], ["Lionel Messi", "Barcelona'daki ilk yıllarında (10'dan önce)", 19],
    ["Steven Gerrard", "Liverpool kaptanıyken", 8], ["Frank Lampard", "Chelsea'de", 8], ["Didier Drogba", "Chelsea'de", 11], ["Robin van Persie", "Manchester United'da", 20],
    ["Zlatan Ibrahimović", "PSG'de", 10], ["Erling Haaland", "Manchester City'de", 9], ["Jude Bellingham", "Real Madrid'de", 5], ["Toni Kroos", "Real Madrid'de", 8],
    ["Victor Osimhen", "Galatasaray'da", 45], ["Kevin De Bruyne", "Manchester City'de", 17], ["Rodri", "Manchester City'de", 16], ["Phil Foden", "Manchester City'de", 47],
    ["Virgil van Dijk", "Liverpool'da", 4], ["Mohamed Salah", "Liverpool'da", 11], ["Son Heung-min", "Tottenham'da", 7], ["Harry Kane", "Bayern'de", 9],
    ["Pedri", "Barcelona'da", 8], ["Gavi", "Barcelona'da", 6], ["Kylian Mbappé", "PSG'de", 7], ["Luka Modrić", "Real Madrid'de 2017'den sonra", 10],
    ["Sergio Ramos", "Real Madrid'de", 4], ["Marcelo", "Real Madrid'de", 12], ["Andriy Shevchenko", "Milan'da", 7], ["Alessandro Nesta", "Milan'da", 13],
    ["Gennaro Gattuso", "Milan'da", 8], ["Cafu", "Milan ve Brezilya'da", 2], ["Patrick Vieira", "Arsenal'de", 4], ["Dennis Bergkamp", "Arsenal'de", 10],
    ["Eric Cantona", "Manchester United'da", 7], ["Ryan Giggs", "Manchester United'da", 11], ["Paul Scholes", "Manchester United'da", 18],
    ["Luis Suárez", "Liverpool'da", 7], ["Vincent Kompany", "Manchester City'de", 4], ["Yaya Touré", "Manchester City'de", 42],
    ["Mauro Icardi", "Galatasaray'da", 9], ["Gheorghe Hagi", "Galatasaray'da", 10], ["Alex de Souza", "Fenerbahçe'de", 10], ["Bukayo Saka", "Arsenal'de 2020'den beri", 7], ["Martin Ødegaard", "Arsenal kaptanıyken", 8],
  ];
  SHIRTS.forEach(([n, where, num], k) => {
    add({ id: "sh-" + k + "-" + n.replace(/\W/g, ""), cat: "Forma Numarası", q: `${hl(n)} ${where} kaç numaralı formayı giydi?`, a: num, unit: "numara", photo: photoOf(n), name: n, note: `${n} ${where} ${num} numarayı giydi.` });
  });

  /* =========================================================
     15) TRANSFER BEDELLERİ (milyon €, bonuslar hariç)
     ========================================================= */
  [["Neymar", "2017'de Barcelona'dan PSG'ye", 222], ["Kylian Mbappé", "2018'de Monaco'dan PSG'ye (kalıcı)", 180], ["João Félix", "2019'da Benfica'dan Atlético'ya", 126],
   ["Enzo Fernández", "2023'te Benfica'dan Chelsea'ye", 121], ["Antoine Griezmann", "2019'da Atlético'dan Barcelona'ya (serbest kalma bedeli)", 120],
   ["Paul Pogba", "2016'da Juventus'tan Manchester United'a", 105], ["Jude Bellingham", "2023'te Dortmund'dan Real Madrid'e", 103],
   ["Eden Hazard", "2019'da Chelsea'den Real Madrid'e", 100], ["Cristiano Ronaldo", "2009'da Manchester United'dan Real Madrid'e", 94]].forEach(([n, d, v]) => {
    add({ id: "tr-" + n.replace(/\W/g, ""), cat: "Transfer", q: `${hl(n)} ${d} kaç milyon euroya transfer oldu?`, a: v, unit: "milyon €", photo: photoOf(n), name: n, note: `${n}: yaklaşık ${v} milyon € (bonuslar hariç).` });
  });

  /* =========================================================
     16) MİLLİ TAKIM & TÜRK KULÜPLERİ
     ========================================================= */
  const TRQ = [
    ["trq-1", "Türkiye EURO 2008 yarı finalinde hangi takıma elendi?", "Almanya", ["Almanya", "İspanya", "Rusya", "Hırvatistan"], "Almanya 3-2 kazandı; Türkiye çeyrek finalde Hırvatistan'ı penaltılarla elemişti."],
    ["trq-2", "Türkiye EURO 2024 çeyrek finalinde hangi takıma elendi?", "Hollanda", ["Hollanda", "İngiltere", "İspanya", "Fransa"], "Hollanda 2-1 kazandı."],
    ["trq-3", "Türkiye 2002 Dünya Kupası yarı finalinde hangi takıma yenildi?", "Brezilya", ["Brezilya", "Almanya", "Güney Kore", "Senegal"], "Brezilya 1-0 (Ronaldo)."],
    ["trq-4", "Türkiye 2002 Dünya Kupası üçüncülük maçında hangi takımı yendi?", "Güney Kore", ["Güney Kore", "Japonya", "Senegal", "ABD"], "Türkiye 3-2 Güney Kore."],
    ["trq-5", "Türkiye 2002 Dünya Kupası çeyrek finalinde hangi takımı altın golle yendi?", "Senegal", ["Senegal", "Japonya", "Kosta Rika", "Çin"], "İlhan Mansız'ın altın golüyle 1-0."],
    ["trq-6", "Galatasaray 2000 UEFA Kupası finalinde hangi takımı yendi?", "Arsenal", ["Arsenal", "Leeds United", "Real Madrid", "Borussia Dortmund"], "0-0 sonrası penaltılarla 4-1, Kopenhag."],
    ["trq-7", "Fenerbahçe 2007-08 Şampiyonlar Ligi çeyrek finalinde hangi takıma elendi?", "Chelsea", ["Chelsea", "Sevilla", "Inter", "Barcelona"], "Son 16'da Sevilla'yı penaltılarla elemişti."],
    ["trq-8", "2002 Dünya Kupası'nda Türkiye'nin altın golünü kim attı?", "İlhan Mansız", ["İlhan Mansız", "Hasan Şaş", "Ümit Davala", "Nihat Kahveci"], "Senegal'e karşı çeyrek finalde."],
    ["trq-9", "EURO 2024'te Türkiye'nin Avusturya'yı 2-1 yendiği maçta iki golü kim attı?", "Merih Demiral", ["Merih Demiral", "Arda Güler", "Kenan Yıldız", "Barış Alper Yılmaz"], "Merih Demiral iki kez kafayla."],
  ];
  TRQ.forEach(([id, q, a, opts, note]) => {
    const r = rng(id);
    const o = opts.slice().sort(() => r() - 0.5);
    add({ id, cat: "Milli Takım & Türk Kulüpleri", type: "choice", q, options: o.map((t) => ({ t, photo: photoOf(t) })), a: o.indexOf(a), note });
  });
  [["trn-1", "Türkiye A Milli Takımı ilk kez hangi yıl Dünya Kupası'na katıldı?", 1954, "yıl", "1954 İsviçre Dünya Kupası."], ["trn-2", "Türkiye EURO 2008'de çeyrek finalde Hırvatistan'a karşı kaçıncı dakikada (uzatmalar dahil) eşitliği yakaladı?", 122, "dakika", "Semih Şentürk 120+2'de attı, penaltılarda Türkiye kazandı."],
   ["trn-3", "Türkiye EURO 2024'te Gürcistan'ı kaç kaç yendi? Toplam gol sayısını yaz.", 4, "gol", "Türkiye 3-1 Gürcistan; Arda Güler'in uzaktan golü vardı."]].forEach(([id, q, a, u, note]) => add({ id, cat: "Milli Takım & Türk Kulüpleri", q, a, unit: u, note }));

  const seen = new Set();
  window.GENERATED_QUESTIONS = OUT.filter((q) => (seen.has(q.id) ? false : seen.add(q.id)));
})();
