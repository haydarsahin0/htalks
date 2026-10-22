# HTALKS · Oyun Gecesi

HTALKS canlı yayınının **ikinci saatinde** Hasan, Turan ve Hilmi'nin oynayıp yayında gösterebileceği iki futbol oyunu. Tamamen statik bir site; kurulum, sunucu veya derleme gerekmez. GitHub Pages'te doğrudan çalışır.

## Oyunlar

### Oyun 01 · Yaklaş Kazan (`tahmin.html`)
- Ekrana bir futbol sorusu gelir: boy, sezon golü, asist, kalecinin yediği gol, rekorlar, Süper Lig, Dünya Kupası…
- Herkes tahminini kendi kutusuna yazar ve **Enter** ile kilitler (cevap gizlenir).
- **Cevabı Göster** ile doğru cevap açıklanır; sayı doğrusunda kim ne kadar yaklaştı görünür.
- En yakın tahmin **+1**, tam isabet **+2** puan. Eşitlikte ikisi de alır.
- "Kim daha çok?" sorularında doğru bilen herkes +1 alır.
- Hedef puana (varsayılan **10**) ilk ulaşan kazanır. Eşitlikte altın soruyla devam edilir.
- Kendi sorularını **"+ Kendi sorunu ekle"** ile ekleyebilirsin (tarayıcıda saklanır).

### Oyun 02 · Kör Müzayede (`muzayede.html`)
- Herkesin **50 coin**'i var. Toplam **15 futbolcu** (3 × 5) kapalı kart olarak sırayla gelir.
- Kart açılır, futbolcu (fotoğrafıyla) ekrana gelir; açık artırma **1 coin**'den başlar.
- "Gidiyor… gidiyor… satıldı!" — en yüksek teklifi veren futbolcuyu kadrosuna yazar.
- Herkes tam **5 futbolcu** alır. Her boş yer için 1 coin ayrıldığından maksimum teklif otomatik hesaplanır.
- Sonunda üç kadro sahaya dizilir; **seyirci** en iyi kadroyu seçer, taç basılır.
- Havuz seçenekleri: Karışık · Efsaneler · Günümüz Yıldızları · Türk Futbolu.

## Klavye kısayolları

| Tuş | Yaklaş Kazan | Kör Müzayede |
|---|---|---|
| `Enter` | Kutudaysan kilitle; değilsen cevabı göster / sıradaki soru | — |
| `Boşluk` | — | Kartı aç → çekici vur → sıradaki kart |
| `1` `2` `3` | — | Hasan / Turan / Hilmi **+1** teklif |
| `Q` `W` `E` | — | Hasan / Turan / Hilmi **+5** teklif |
| `Z` | Son puanlamayı geri al | Son işlemi geri al |
| `S` | Soruyu puansız geç | — |
| `M` | Oynanan soruları göster/gizle | — |
| `F` | Tam ekran | Tam ekran |

Yarışmacı isimleri ve renkleri ana sayfadan değiştirilebilir. Oyunlar her adımda kaydedilir; sayfa yenilense de **"Kaldığın yerden devam et"** ile sürdürülebilir.

## GitHub Pages ile yayınlama

1. Bu dosyaları reponun ana dalına (ör. `main`) birleştir.
2. GitHub'da repo → **Settings** → **Pages**.
3. **Build and deployment** altında *Source*: **Deploy from a branch**, *Branch*: `main` ve klasör `/ (root)` seç, **Save**.
4. Bir iki dakika sonra site `https://<kullanıcı-adı>.github.io/htalks/` adresinde açılır.

> Yayında kullanırken: OBS'te **Pencere Yakalama** veya **Tarayıcı Kaynağı** ile 1920×1080 eklemen yeterli; `F` ile tam ekran yap.

## Fotoğraflar

Futbolcu fotoğrafları, site açıldığında tarayıcı tarafından **Wikipedia / Wikimedia Commons**'tan otomatik çekilir ve tarayıcıda önbelleğe alınır. Fotoğraf bulunamazsa isim baş harfleriyle şık bir kart gösterilir. Müzayedede kartın sağ üstündeki 📷 butonuyla herhangi bir fotoğrafı elle bir URL ile değiştirebilirsin.

## Soru ve futbolcu ekleme

- Sorular: `assets/js/data-questions.js` — dosyanın başında format açıklaması var.
- Futbolcular: `assets/js/data-players.js` — isim, Wikipedia başlığı, mevki (KL/DF/OS/FV), ülke kodu ve grup.

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
assets/js/data-*.js   Soru bankası ve futbolcu havuzu
```
