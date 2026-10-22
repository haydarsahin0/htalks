# HTALKS · Oyun Gecesi

HTALKS canlı yayınının **ikinci saatinde** Hasan, Turan ve Hilmi'nin oynayıp yayında gösterebileceği iki futbol oyunu. Tamamen statik bir site; kurulum, sunucu veya derleme gerekmez. GitHub Pages'te doğrudan çalışır.

## Oyunlar

Site tek bilgisayardan (Hasan'ın ekranı) yönetilecek şekilde tasarlandı: herkesin cevabını ve teklifini Hasan girer, site her adımda **sıranın kimde olduğunu** söyler. Masaüstünde her ekran tek sayfaya sığar, kaydırma yoktur.

### Oyun 01 · Yaklaş Kazan (`tahmin.html`)
- **1.600+ soru**, 16 kategori: doğum yılı, boy, milliyet, lig gol kralları (Premier Lig, La Liga, Bundesliga, Serie A, Ligue 1, Süper Lig), Ballon d'Or, Şampiyonlar Ligi finalleri, Dünya Kupası, EURO, Süper Lig şampiyonları, stadyumlar, "Kim daha çok?", sezon golleri, asistler, kaleciler, rekorlar…
- Kategoriler dengeli karışır; aynı soru havuz bitene kadar tekrar gelmez.
- **Sırayla cevap:** site "Sıra: Turan" der, Hasan cevabı yazıp `Enter`'a basar, cevap gizlenir ve sıra bir sonrakine geçer.
- **Sıra her soruda döner:** 1. soruda Hasan, 2. soruda Turan, 3. soruda Hilmi önce cevap verir.
- En yakın tahmin **+1**, tam isabet **+2**. Şıklı sorularda doğru bilen herkes **+1**.
- Hedef puana (varsayılan **10**) ilk ulaşan kazanır; eşitlikte altın soru.

### Oyun 02 · Kör Müzayede (`muzayede.html`)
- **350+ futbolcu**; her müzayedede rastgele 15 kapalı kart (Karışık · Efsaneler · Günümüz Yıldızları · Türk Futbolu).
- Herkesin **50 coin**'i var, herkes tam **5 futbolcu** alır (her boş yer için 1 coin ayrılır, maksimum teklif otomatik hesaplanır).
- **Sırayla teklif:** sırası gelen +1/+2/+5/+10 ya da özel miktar ile artırır veya **pas** der. Pas diyen o karttan çekilir. Bir kişi kalınca "Gidiyor… gidiyor… satıldı!"
- **İlk söz hakkı her kartta döner.**
- Kimse istemezse kart destenin sonuna gider; ikinci kez de istenmezse en çok boş yeri olana 1 coin'e verilir.
- Sonunda kadrolar sahaya dizilir, seyirci en iyi kadroyu seçer.

## Klavye kısayolları

| Tuş | Yaklaş Kazan | Kör Müzayede |
|---|---|---|
| `Enter` | Cevabı kaydet → sıradaki kişi; herkes hazırsa cevabı göster / sıradaki soru | — |
| `1`–`4` | Şıklı sorularda A–D | +1 · +2 · +5 · +10 teklif |
| `P` | — | Pas |
| `Boşluk` | — | Kartı aç / sıradaki kart |
| `Z` | Puanlamayı geri al | Son işlemi geri al |
| `S` / `M` | Soruyu geç / oynanan sorular | — |
| `F` | Tam ekran | Tam ekran |

Yarışmacı isimleri ve renkleri ana sayfadaki **İsimleri düzenle** ile değiştirilebilir. Oyunlar her adımda kaydedilir; sayfa yenilense de kaldığın yerden devam edilir.

## Canlı adres

**https://haydarsahin0.github.io/htalks/**

Site GitHub Pages ile yayınlanır. Settings → Pages altında kaynak olarak `main` dalı ve `/ (root)` klasörü seçili olmalı; `main`'e yapılan her push birkaç dakika içinde siteye yansır.

> Yayında kullanırken: OBS'te **Pencere Yakalama** veya **Tarayıcı Kaynağı** ile 1920×1080 eklemen yeterli; `F` ile tam ekran yap.

## Fotoğraflar

Futbolcu fotoğrafları, site açıldığında tarayıcı tarafından **Wikipedia / Wikimedia Commons**'tan otomatik çekilir ve tarayıcıda önbelleğe alınır. Fotoğraf bulunamazsa isim baş harfleriyle şık bir kart gösterilir. Müzayedede kartın sağ üstündeki 📷 butonuyla herhangi bir fotoğrafı elle bir URL ile değiştirebilirsin.

## Soru ve futbolcu ekleme

- Elle yazılmış sorular: `assets/js/data-questions.js`
- Otomatik üretilen sorular: `assets/js/data-facts.js` — gol kralları, Ballon d'Or, finaller, Süper Lig şampiyonları gibi tablolar. Tabloya bir satır eklemek birkaç yeni soru demektir.
- Futbolcular: `assets/js/data-players.js` — isim, Wikipedia başlığı, mevki, ülke, açıklama, grup, doğum yılı ve boy. Her futbolcu hem müzayedeye hem de doğum yılı/boy/milliyet sorularına girer.

İstatistikler resmî kaynaklara göre girilmiştir; boy gibi değerler kaynağa göre ±1-2 cm değişebilir.

## Dosya yapısı

```
index.html            Ana sayfa + yarışmacı ayarları
tahmin.html           Oyun 01 · Yaklaş Kazan
muzayede.html         Oyun 02 · Kör Müzayede
assets/css/style.css  Tüm tasarım
assets/js/common.js   Ortak: kayıt, fotoğraf, ses, konfeti
assets/js/tahmin.js   Oyun 01 mantığı
assets/js/muzayede.js Oyun 02 mantığı
assets/js/data-*.js   Soru bankası, soru üreteci ve futbolcu havuzu
assets/img/logo.jpg   Kanal logosu
```
