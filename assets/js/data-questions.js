/* =========================================================
   OYUN 1 · YAKLAŞ KAZAN — soru bankası
   ---------------------------------------------------------
   Sayısal soru:
     { id, cat, q, a, unit, note, photo, name }
       q     : soru metni (<span class="hl">...</span> ile vurgu yapılabilir)
       a     : doğru cevap (sayı)
       unit  : birim (cm, gol, asist...)
       note  : cevaptan sonra gösterilecek bilgi
       photo : Wikipedia (İngilizce) sayfa başlığı → fotoğraf için
       name  : fotoğraf bulunamazsa aranacak isim
   Seçmeli soru ("Kim daha çok?"):
     { id, cat, type: "choice", q, options: [{ t, photo }], a: doğruIndeks, note }

   Not: İstatistikler resmi kaynaklara dayanır; boy gibi
   değerler kaynağa göre ±1-2 cm değişebilir.
   ========================================================= */
window.QUESTIONS = [
  /* ---------------- GOL (SEZON) ---------------- */
  { id: "g1", cat: "Gol", q: "<span class='hl'>Messi</span> 2011-12 sezonunda tüm kulvarlarda kaç gol attı?", a: 73, unit: "gol", photo: "Lionel Messi", note: "73 gol — bir Avrupa kulübü oyuncusu için tek sezon rekoru. La Liga'da 50 gol." },
  { id: "g2", cat: "Gol", q: "<span class='hl'>Messi</span> 2012 takvim yılında (kulüp + milli takım) kaç gol attı?", a: 91, unit: "gol", photo: "Lionel Messi", note: "91 gol ile Gerd Müller'in 85 gollük rekorunu kırdı." },
  { id: "g3", cat: "Gol", q: "<span class='hl'>Messi</span> 2011-12 La Liga'da kaç gol attı?", a: 50, unit: "gol", photo: "Lionel Messi", note: "50 gol — La Liga tek sezon rekoru." },
  { id: "g4", cat: "Gol", q: "<span class='hl'>Cristiano Ronaldo</span> 2014-15 La Liga'da kaç gol attı?", a: 48, unit: "gol", photo: "Cristiano Ronaldo", note: "48 lig golü; tüm kulvarlarda 61 gol." },
  { id: "g5", cat: "Gol", q: "<span class='hl'>Cristiano Ronaldo</span> 2014-15 sezonunda tüm kulvarlarda kaç gol attı?", a: 61, unit: "gol", photo: "Cristiano Ronaldo", note: "61 gol — Real Madrid'deki en golcü sezonu." },
  { id: "g6", cat: "Gol", q: "<span class='hl'>Cristiano Ronaldo</span> 2007-08 Premier Lig'de kaç gol attı?", a: 31, unit: "gol", photo: "Cristiano Ronaldo", note: "31 gol, Altın Ayakkabı ve ilk Ballon d'Or o sezonun ardından geldi." },
  { id: "g7", cat: "Gol", q: "<span class='hl'>Cristiano Ronaldo</span> 2013-14 Şampiyonlar Ligi'nde kaç gol attı?", a: 17, unit: "gol", photo: "Cristiano Ronaldo", note: "17 gol — tek sezonda Şampiyonlar Ligi rekoru. Real Madrid La Décima'yı kazandı." },
  { id: "g8", cat: "Gol", q: "<span class='hl'>Lewandowski</span> 2020-21 Bundesliga'da kaç gol attı?", a: 41, unit: "gol", photo: "Robert Lewandowski", note: "41 gol ile Gerd Müller'in 49 yıllık rekorunu (40) kırdı." },
  { id: "g9", cat: "Gol", q: "<span class='hl'>Gerd Müller</span> 1971-72 Bundesliga'da kaç gol attı?", a: 40, unit: "gol", photo: "Gerd Müller", note: "40 gol — 2021'de Lewandowski kırana kadar rekordu." },
  { id: "g10", cat: "Gol", q: "<span class='hl'>Haaland</span> 2022-23 Premier Lig'de kaç gol attı?", a: 36, unit: "gol", photo: "Erling Haaland", note: "36 gol — 38 maçlık Premier Lig sezonu rekoru." },
  { id: "g11", cat: "Gol", q: "<span class='hl'>Haaland</span> 2022-23 sezonunda tüm kulvarlarda kaç gol attı?", a: 52, unit: "gol", photo: "Erling Haaland", note: "52 gol, City treble kazandı." },
  { id: "g12", cat: "Gol", q: "<span class='hl'>Haaland</span> 2023-24 Premier Lig'de kaç gol attı?", a: 27, unit: "gol", photo: "Erling Haaland", note: "27 gol ile üst üste ikinci kez gol kralı." },
  { id: "g13", cat: "Gol", q: "<span class='hl'>Mohamed Salah</span> 2017-18 Premier Lig'de kaç gol attı?", a: 32, unit: "gol", photo: "Mohamed Salah", note: "32 gol — Liverpool'daki ilk sezonunda." },
  { id: "g14", cat: "Gol", q: "<span class='hl'>Mohamed Salah</span> 2024-25 Premier Lig'de kaç gol attı?", a: 29, unit: "gol", photo: "Mohamed Salah", note: "29 gol + 18 asist; Liverpool şampiyon oldu." },
  { id: "g15", cat: "Gol", q: "<span class='hl'>Harry Kane</span> 2023-24 Bundesliga'da (Bayern'deki ilk sezonu) kaç gol attı?", a: 36, unit: "gol", photo: "Harry Kane", note: "36 gol — Bundesliga'da bir ilk sezon rekoru." },
  { id: "g16", cat: "Gol", q: "<span class='hl'>Thierry Henry</span> 2003-04 'Yenilmezler' sezonunda Premier Lig'de kaç gol attı?", a: 30, unit: "gol", photo: "Thierry Henry", note: "30 gol; Arsenal ligi namağlup bitirdi." },
  { id: "g17", cat: "Gol", q: "<span class='hl'>Jamie Vardy</span> 2015-16 Leicester şampiyonluğunda kaç lig golü attı?", a: 24, unit: "gol", photo: "Jamie Vardy", note: "24 gol; üst üste 11 maçta gol atarak rekor kırdı." },
  { id: "g18", cat: "Gol", q: "<span class='hl'>Karim Benzema</span> 2021-22 La Liga'da kaç gol attı?", a: 27, unit: "gol", photo: "Karim Benzema", note: "27 gol; o sezon Ballon d'Or'u kazandı." },
  { id: "g19", cat: "Gol", q: "<span class='hl'>Karim Benzema</span> 2021-22 Şampiyonlar Ligi'nde kaç gol attı?", a: 15, unit: "gol", photo: "Karim Benzema", note: "15 gol; PSG, Chelsea ve City'ye hat-trick/kritik goller." },
  { id: "g20", cat: "Gol", q: "<span class='hl'>Kylian Mbappé</span> 2024-25 La Liga'da (Real Madrid'deki ilk sezonu) kaç gol attı?", a: 31, unit: "gol", photo: "Kylian Mbappé", note: "31 gol ile Pichichi ve Avrupa Altın Ayakkabısı." },
  { id: "g21", cat: "Gol", q: "<span class='hl'>Cole Palmer</span> 2023-24 Premier Lig'de kaç gol attı?", a: 22, unit: "gol", photo: "Cole Palmer", note: "22 gol + 11 asist, Chelsea'deki ilk sezonunda." },
  { id: "g22", cat: "Gol", q: "<span class='hl'>Luis Suárez</span> 2015-16 La Liga'da kaç gol attı?", a: 40, unit: "gol", photo: "Luis Suárez", note: "40 gol; Messi-Ronaldo dışında son 'Pichichi'lerden biri." },
  { id: "g23", cat: "Gol", q: "<span class='hl'>Arda Güler</span> 2023-24 La Liga'da kaç gol attı?", a: 6, unit: "gol", photo: "Arda Güler", note: "Sakatlıklarla geçen ilk sezonunda sınırlı sürede 6 lig golü." },
  { id: "g24", cat: "Gol", q: "<span class='hl'>Burak Yılmaz</span> 2020-21 Lille'in şampiyonluğunda Ligue 1'de kaç gol attı?", a: 16, unit: "gol", photo: "Burak Yılmaz", note: "16 gol; Lille PSG'yi geçip şampiyon oldu." },

  /* ---------------- SÜPER LİG ---------------- */
  { id: "s1", cat: "Süper Lig", q: "<span class='hl'>Tanju Çolak</span> 1987-88 sezonunda Galatasaray'da kaç lig golü attı?", a: 39, unit: "gol", photo: "Tanju Çolak", note: "39 gol ile Avrupa Altın Ayakkabı'yı kazandı." },
  { id: "s3", cat: "Süper Lig", q: "<span class='hl'>Enner Valencia</span> 2022-23 Süper Lig'de kaç gol attı?", a: 29, unit: "gol", photo: "Enner Valencia", note: "29 gol ile gol kralı oldu." },
  { id: "s4", cat: "Süper Lig", q: "<span class='hl'>Mauro Icardi</span> 2023-24 Süper Lig'de kaç gol attı?", a: 25, unit: "gol", photo: "Mauro Icardi", note: "25 gol ile gol kralı; Galatasaray 102 puanla şampiyon." },
  { id: "s5", cat: "Süper Lig", q: "<span class='hl'>Victor Osimhen</span> 2024-25 Süper Lig'de kaç gol attı?", a: 26, unit: "gol", photo: "Victor Osimhen", note: "26 gol ile gol kralı; Galatasaray şampiyon oldu." },
  { id: "s6", cat: "Süper Lig", q: "Galatasaray 2023-24 Süper Lig şampiyonluğunu kaç puanla kazandı?", a: 102, unit: "puan", photo: "Galatasaray S.K. (football)", name: "Galatasaray", note: "102 puan — Süper Lig tarihinin puan rekoru." },
  { id: "s7", cat: "Süper Lig", q: "Fenerbahçe 2023-24 Süper Lig'i kaç puanla ikinci bitirdi?", a: 99, unit: "puan", photo: "Fenerbahçe S.K. (football)", name: "Fenerbahçe", note: "99 puanla ikinci olmak da bir rekor." },

  /* ---------------- ASİST ---------------- */
  { id: "a1", cat: "Asist", q: "<span class='hl'>Thomas Müller</span> 2019-20 Bundesliga'da kaç asist yaptı?", a: 21, unit: "asist", photo: "Thomas Müller", note: "21 asist — Bundesliga tek sezon rekoru." },
  { id: "a2", cat: "Asist", q: "<span class='hl'>Kevin De Bruyne</span> 2019-20 Premier Lig'de kaç asist yaptı?", a: 20, unit: "asist", photo: "Kevin De Bruyne", note: "20 asist ile Henry'nin rekoruna ortak oldu." },
  { id: "a3", cat: "Asist", q: "<span class='hl'>Thierry Henry</span> 2002-03 Premier Lig'de kaç asist yaptı?", a: 20, unit: "asist", photo: "Thierry Henry", note: "20 asist + 24 gol." },
  { id: "a4", cat: "Asist", q: "<span class='hl'>Messi</span> 2019-20 La Liga'da kaç asist yaptı?", a: 21, unit: "asist", photo: "Lionel Messi", note: "21 asist — La Liga tek sezon rekoru (25 de gol)." },
  { id: "a5", cat: "Asist", q: "<span class='hl'>Mesut Özil</span> 2015-16 Premier Lig'de kaç asist yaptı?", a: 19, unit: "asist", photo: "Mesut Özil", note: "19 asist, rekora bir asist uzak kaldı." },
  { id: "a6", cat: "Asist", q: "<span class='hl'>Mohamed Salah</span> 2024-25 Premier Lig'de kaç asist yaptı?", a: 18, unit: "asist", photo: "Mohamed Salah", note: "18 asist + 29 gol = 47 gol katkısı (38 maçlık sezon rekoru)." },
  { id: "a7", cat: "Asist", q: "<span class='hl'>Messi</span> 2014-15 La Liga'da kaç asist yaptı?", a: 18, unit: "asist", photo: "Lionel Messi", note: "18 asist + 43 gol; Barcelona treble kazandı." },
  { id: "a8", cat: "Asist", q: "<span class='hl'>Lamine Yamal</span> EURO 2024'te kaç asist yaptı?", a: 4, unit: "asist", photo: "Lamine Yamal", note: "4 asist ile turnuvanın asist kralı; İspanya şampiyon." },
  { id: "a9", cat: "Asist", q: "<span class='hl'>Messi</span> 2022 Dünya Kupası'nda kaç asist yaptı?", a: 3, unit: "asist", photo: "Lionel Messi", note: "7 gol + 3 asist; Arjantin şampiyon." },
  { id: "a10", cat: "Asist", q: "<span class='hl'>Harry Kane</span> 2020-21 Premier Lig'de kaç asist yaptı?", a: 14, unit: "asist", photo: "Harry Kane", note: "14 asist + 23 gol: hem gol hem asist kralı." },

  /* ---------------- KALECİ ---------------- */
  { id: "k1", cat: "Kaleci", q: "<span class='hl'>Iker Casillas</span> 2010 Dünya Kupası'nda kaç gol yedi?", a: 2, unit: "gol", photo: "Iker Casillas", note: "7 maçta yalnızca 2 gol; İspanya şampiyon oldu." },
  { id: "k2", cat: "Kaleci", q: "<span class='hl'>Casillas</span>'ın kalesini koruduğu Real Madrid, 2009-10 La Liga'da kaç gol yedi?", a: 35, unit: "gol", photo: "Iker Casillas", note: "Real Madrid 96 puan topladı, 35 gol yedi ama ligi Barcelona kazandı." },
  { id: "k3", cat: "Kaleci", q: "<span class='hl'>Gianluigi Buffon</span> 2006 Dünya Kupası'nda kaç gol yedi?", a: 2, unit: "gol", photo: "Gianluigi Buffon", note: "Biri kendi kalesine, biri Zidane'ın finaldeki penaltısı." },
  { id: "k4", cat: "Kaleci", q: "<span class='hl'>Petr Čech</span>'li Chelsea 2004-05 Premier Lig'de kaç gol yedi?", a: 15, unit: "gol", photo: "Petr Čech", note: "15 gol — Premier Lig rekoru." },
  { id: "k5", cat: "Kaleci", q: "<span class='hl'>Buffon</span>'lu Juventus 2011-12 namağlup Serie A sezonunda kaç gol yedi?", a: 20, unit: "gol", photo: "Gianluigi Buffon", note: "38 maçta 20 gol." },
  { id: "k6", cat: "Kaleci", q: "<span class='hl'>Alisson</span> 2018-19 Premier Lig'de kaç maçta gol yemedi?", a: 21, unit: "maç", photo: "Alisson Becker", note: "21 'clean sheet' ile Altın Eldiven." },
  { id: "k7", cat: "Kaleci", q: "<span class='hl'>Edwin van der Sar</span> 2008-09'da Premier Lig'de kaç dakika gol yemedi?", a: 1311, unit: "dakika", photo: "Edwin van der Sar", note: "1.311 dakika — dönemin İngiltere rekoru." },
  { id: "k8", cat: "Kaleci", q: "<span class='hl'>Casillas</span>'lı İspanya EURO 2012'de kaç gol yedi?", a: 1, unit: "gol", photo: "Iker Casillas", note: "6 maçta tek gol (İtalya'dan, grupta)." },
  { id: "k9", cat: "Kaleci", q: "Arsenal 2003-04 'Yenilmezler' sezonunda ligde kaç gol yedi?", a: 26, unit: "gol", photo: "Jens Lehmann", name: "Jens Lehmann", note: "26 gol yedi, 73 gol attı; 26 galibiyet 12 beraberlik." },
  { id: "k10", cat: "Kaleci", q: "Liverpool 2018-19 Premier Lig'de kaç gol yedi?", a: 22, unit: "gol", photo: "Alisson Becker", note: "Sadece 22 gol yediler ama 97 puanla ikinci oldular." },

  /* ---------------- KARİYER & REKOR ---------------- */
  { id: "r1", cat: "Kariyer", q: "<span class='hl'>Messi</span> Barcelona formasıyla toplam kaç resmî gol attı?", a: 672, unit: "gol", photo: "Lionel Messi", note: "778 maçta 672 gol." },
  { id: "r2", cat: "Kariyer", q: "<span class='hl'>Cristiano Ronaldo</span> Real Madrid formasıyla kaç gol attı?", a: 450, unit: "gol", photo: "Cristiano Ronaldo", note: "438 maçta 450 gol — kulübün tüm zamanlar golcüsü." },
  { id: "r3", cat: "Kariyer", q: "<span class='hl'>Lewandowski</span> Bayern Münih'te toplam kaç gol attı?", a: 344, unit: "gol", photo: "Robert Lewandowski", note: "375 maçta 344 gol." },
  { id: "r4", cat: "Kariyer", q: "<span class='hl'>Thierry Henry</span> Arsenal'de toplam kaç gol attı?", a: 228, unit: "gol", photo: "Thierry Henry", note: "228 gol — Arsenal tarihinin en golcüsü." },
  { id: "r5", cat: "Kariyer", q: "<span class='hl'>Wayne Rooney</span> Manchester United'da toplam kaç gol attı?", a: 253, unit: "gol", photo: "Wayne Rooney", note: "253 gol — United'ın tüm zamanlar golcüsü." },
  { id: "r6", cat: "Kariyer", q: "<span class='hl'>Harry Kane</span> Tottenham'da toplam kaç gol attı?", a: 280, unit: "gol", photo: "Harry Kane", note: "280 gol — Spurs tarihinin en golcüsü." },
  { id: "r7", cat: "Kariyer", q: "<span class='hl'>Alan Shearer</span> Premier Lig'de toplam kaç gol attı?", a: 260, unit: "gol", photo: "Alan Shearer", note: "260 gol — Premier Lig rekoru." },
  { id: "r8", cat: "Kariyer", q: "<span class='hl'>Cristiano Ronaldo</span> Şampiyonlar Ligi'nde kariyeri boyunca kaç gol attı?", a: 140, unit: "gol", photo: "Cristiano Ronaldo", note: "140 gol — turnuvanın tüm zamanlar golcüsü (Messi 129)." },
  { id: "r9", cat: "Kariyer", q: "<span class='hl'>Paolo Maldini</span> Milan formasıyla kaç resmî maça çıktı?", a: 902, unit: "maç", photo: "Paolo Maldini", note: "902 maç, tek kulüp: Milan." },
  { id: "r10", cat: "Kariyer", q: "<span class='hl'>Messi</span> kaç kez Ballon d'Or kazandı?", a: 8, unit: "kez", photo: "Lionel Messi", note: "8 Ballon d'Or — rekor (Ronaldo 5)." },
  { id: "r12", cat: "Kariyer", q: "<span class='hl'>Lewandowski</span> 2015'te Wolfsburg'a karşı 5 golü kaç dakikada attı?", a: 9, unit: "dakika", photo: "Robert Lewandowski", note: "Oyuna ikinci yarı girdi, 9 dakikada 5 gol!" },

  /* ---------------- DÜNYA KUPASI ---------------- */
  { id: "d1", cat: "Dünya Kupası", q: "<span class='hl'>Miroslav Klose</span> Dünya Kupaları'nda toplam kaç gol attı?", a: 16, unit: "gol", photo: "Miroslav Klose", note: "16 gol — Dünya Kupası rekoru." },
  { id: "d2", cat: "Dünya Kupası", q: "<span class='hl'>Just Fontaine</span> 1958 Dünya Kupası'nda kaç gol attı?", a: 13, unit: "gol", photo: "Just Fontaine", note: "13 gol — tek turnuva rekoru, hâlâ kırılamadı." },
  { id: "d3", cat: "Dünya Kupası", q: "<span class='hl'>Ronaldo Nazário</span> 2002 Dünya Kupası'nda kaç gol attı?", a: 8, unit: "gol", photo: "Ronaldo (Brazilian footballer)", name: "Ronaldo Nazário", note: "8 gol, finalde Almanya'ya 2 gol." },
  { id: "d5", cat: "Dünya Kupası", q: "Türkiye 2002 Dünya Kupası'nda toplam kaç gol attı?", a: 10, unit: "gol", photo: "Turkey national football team", name: "Türkiye milli futbol takımı", note: "7 maçta 10 gol; turnuvayı üçüncü bitirdik." },
  { id: "d6", cat: "Dünya Kupası", q: "<span class='hl'>Kylian Mbappé</span> 2022 Dünya Kupası'nda kaç gol attı?", a: 8, unit: "gol", photo: "Kylian Mbappé", note: "8 gol ile gol kralı; finalde hat-trick." },
  { id: "d7", cat: "Dünya Kupası", q: "<span class='hl'>Messi</span> Dünya Kupaları'nda toplam kaç maça çıktı? (2022 sonu itibarıyla)", a: 26, unit: "maç", photo: "Lionel Messi", note: "26 maç — 2022 sonunda Dünya Kupası rekoru." },
  { id: "d8", cat: "Dünya Kupası", q: "<span class='hl'>Harry Kane</span> 2018 Dünya Kupası'nda kaç gol attı?", a: 6, unit: "gol", photo: "Harry Kane", note: "6 gol ile Altın Ayakkabı." },

  /* ---------------- TAKIM & TRANSFER ---------------- */
  { id: "t1", cat: "Takım & Transfer", q: "Leicester City 2015-16'da Premier Lig'i kaç puanla kazandı?", a: 81, unit: "puan", photo: "Jamie Vardy", note: "81 puan; sezon başı şampiyonluk oranı 5000'e 1'di." },
  { id: "t2", cat: "Takım & Transfer", q: "Manchester City 2017-18 Premier Lig'i kaç puanla kazandı?", a: 100, unit: "puan", photo: "Pep Guardiola", note: "100 puan — 'Centurions'." },
  { id: "t3", cat: "Takım & Transfer", q: "Real Madrid 2011-12 La Liga'da kaç gol attı?", a: 121, unit: "gol", photo: "Cristiano Ronaldo", note: "121 gol ve 100 puan." },
  { id: "t4", cat: "Takım & Transfer", q: "Arsenal'in 'Yenilmezler' dönemindeki ligde yenilmezlik serisi kaç maç sürdü?", a: 49, unit: "maç", photo: "Thierry Henry", note: "49 maç; seriyi Manchester United bitirdi." },
  { id: "t5", cat: "Takım & Transfer", q: "<span class='hl'>Neymar</span>'ın 2017'de Barcelona'dan PSG'ye transfer bedeli kaç milyon euro?", a: 222, unit: "milyon €", photo: "Neymar", note: "222 milyon € — dünya rekoru." },

  /* ---------------- KİM DAHA ÇOK? (seçmeli) ---------------- */
  { id: "c1", cat: "Kim Daha Çok?", type: "choice", q: "Şampiyonlar Ligi'nde kariyeri boyunca kim daha çok gol attı?",
    options: [{ t: "Messi", photo: "Lionel Messi" }, { t: "Ronaldo", photo: "Cristiano Ronaldo" }], a: 1, note: "Ronaldo 140, Messi 129." },
  { id: "c2", cat: "Kim Daha Çok?", type: "choice", q: "2017-18 Premier Lig'de kim daha çok gol attı?",
    options: [{ t: "Salah", photo: "Mohamed Salah" }, { t: "Kane", photo: "Harry Kane" }], a: 0, note: "Salah 32, Kane 30." },
  { id: "c3", cat: "Kim Daha Çok?", type: "choice", q: "Dünya Kupaları'nda kim daha çok gol attı?",
    options: [{ t: "Klose", photo: "Miroslav Klose" }, { t: "Ronaldo Nazário", photo: "Ronaldo (Brazilian footballer)" }], a: 0, note: "Klose 16, Ronaldo 15." },
  { id: "c4", cat: "Kim Daha Çok?", type: "choice", q: "Premier Lig'de kim daha çok gol attı?",
    options: [{ t: "Shearer", photo: "Alan Shearer" }, { t: "Rooney", photo: "Wayne Rooney" }], a: 0, note: "Shearer 260, Rooney 208." },
  { id: "c6", cat: "Kim Daha Çok?", type: "choice", q: "Kulübünde kim daha çok gol attı?",
    options: [{ t: "Henry (Arsenal)", photo: "Thierry Henry" }, { t: "Rooney (Man United)", photo: "Wayne Rooney" }], a: 1, note: "Rooney 253, Henry 228." },
  { id: "c7", cat: "Kim Daha Çok?", type: "choice", q: "Kim daha uzun?",
    options: [{ t: "Courtois", photo: "Thibaut Courtois" }, { t: "Van Dijk", photo: "Virgil van Dijk" }], a: 0, note: "Courtois ~2,00 m, Van Dijk 1,93 m." },
  { id: "c8", cat: "Kim Daha Çok?", type: "choice", q: "Kim daha çok Ballon d'Or kazandı?",
    options: [{ t: "Cristiano Ronaldo", photo: "Cristiano Ronaldo" }, { t: "Johan Cruyff", photo: "Johan Cruyff" }], a: 0, note: "Ronaldo 5, Cruyff 3." },
  { id: "c9", cat: "Kim Daha Çok?", type: "choice", q: "2022-23 Premier Lig'de kim daha çok gol attı?",
    options: [{ t: "Haaland", photo: "Erling Haaland" }, { t: "Kane", photo: "Harry Kane" }], a: 0, note: "Haaland 36, Kane 30." },
  { id: "c10", cat: "Kim Daha Çok?", type: "choice", q: "2020-21 Bundesliga'da kim daha çok gol attı?",
    options: [{ t: "Lewandowski", photo: "Robert Lewandowski" }, { t: "Haaland", photo: "Erling Haaland" }], a: 0, note: "Lewandowski 41, Haaland 27." },
  { id: "c11", cat: "Kim Daha Çok?", type: "choice", q: "2011-12 La Liga'da kim daha çok gol attı?",
    options: [{ t: "Messi", photo: "Lionel Messi" }, { t: "Ronaldo", photo: "Cristiano Ronaldo" }], a: 0, note: "Messi 50, Ronaldo 46." },
  { id: "c12", cat: "Kim Daha Çok?", type: "choice", q: "Tek kulüpte kim daha çok maça çıktı?",
    options: [{ t: "Maldini (Milan)", photo: "Paolo Maldini" }, { t: "Totti (Roma)", photo: "Francesco Totti" }], a: 0, note: "Maldini 902, Totti 786." },
  { id: "c13", cat: "Kim Daha Çok?", type: "choice", q: "Hangisi daha çok Dünya Kupası kazandı?",
    options: [{ t: "Almanya", photo: "Germany national football team" }, { t: "Arjantin", photo: "Argentina national football team" }], a: 0, note: "Almanya 4, Arjantin 3." },
  { id: "c14", cat: "Kim Daha Çok?", type: "choice", q: "Tek sezonda (lig) kim daha çok asist yaptı?",
    options: [{ t: "Müller 2019-20", photo: "Thomas Müller" }, { t: "De Bruyne 2019-20", photo: "Kevin De Bruyne" }], a: 0, note: "Müller 21 (Bundesliga), De Bruyne 20 (Premier Lig)." },
  { id: "c15", cat: "Kim Daha Çok?", type: "choice", q: "Süper Lig'de tek sezonda kim daha çok gol attı?",
    options: [{ t: "Valencia 2022-23", photo: "Enner Valencia" }, { t: "Icardi 2023-24", photo: "Mauro Icardi" }], a: 0, note: "Valencia 29, Icardi 25." },
];
