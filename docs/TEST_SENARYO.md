# FocusProLab — Test senaryosu (Çocuk / Ergen / Yetişkin)

Kaynak: `src/profiles.js`, `src/distractorSchedule.js`, `src/useAttentionTest.js`

## Tüm profillerde ortak

| Kural | Değer |
|--------|--------|
| **Görev** | Ortada kısa süre bir **şekil** görünür → kaybolur → boşluk → tekrar (tüm test boyunca) |
| **Doğru yanıt** | Sadece **mavi üçgen** görünce **Boşluk** tuşu |
| **Hedef rengi** | Sabit mavi `#2563EB` (her koşuda aynı) |
| **Diğer şekiller** | Basılmamalı (yanlış alarm) |
| **Çeldirici** | En fazla **2 GIF** aynı anda; **en fazla 1 sesli** GIF |
| **GIF süresi** | Her GIF **10 sn** (pencere kısaysa kısalır) |
| **GIF arası** | Yaklaşık **2 sn** (8 sn adımla dizilir) |
| **Sadece ses** | Ekranda GIF yok, ses çalar |

Zamanlar **test başlangıcından** itibaren `dakika:saniye` formatındadır.

---

## Karşılaştırma tablosu

| | **Çocuk (13 dk)** | **Yetişkin (15 dk)** | **Ergen (16 dk)** |
|--|-------------------|----------------------|-------------------|
| Geç yanıt eşiği | 1000 ms | 800 ms | 900 ms |
| Hedef çıkma olasılığı | ~%45 | ~%40 | ~%42 |
| Sessiz GIF penceresi | 7:00 – 10:00 | 3:00 – 6:00 | 9:00 – 11:00 |
| Sadece ses penceresi | 10:00 – 11:00 | 6:00 – 9:00 | 11:00 – 12:00 |
| Sessiz + sesli GIF | 11:00 – 12:00 | 9:00 – 12:00 | 12:00 – 14:00 |

---

## ÇOCUK — 13 dakika

### Ana simge fazları (hız)

| Zaman | Faz | Simge ekranda | Boşluk | Tur süresi |
|-------|-----|---------------|--------|------------|
| 0:00 – 2:00 | 0–2 dk | 1800 ms | 810 ms | 2,61 sn |
| 2:00 – 5:00 | 2–5 dk | 1700 ms | 765 ms | 2,47 sn |
| 5:00 – 7:00 | 5–7 dk | 1600 ms | 720 ms | 2,32 sn |
| 7:00 – 10:00 | 7–10 dk (+ sessiz GIF) | 1600 ms | 720 ms | 2,32 sn |
| 10:00 – 11:00 | 10–11 dk (+ sadece ses) | 1600 ms | 720 ms | 2,32 sn |
| 11:00 – 12:00 | 11–12 dk (+ sesli GIF) | 1600 ms | 720 ms | 2,32 sn |
| 12:00 – 13:00 | 12–13 dk | 1850 ms | 833 ms | 2,68 sn |

### Sessiz GIF (7:00 – 10:00) — örnek sıra

| Başlangıç | Bitiş | GIF | Konum |
|-----------|-------|-----|--------|
| 7:00 | 7:10 | Top | sol üst |
| 7:08 | 7:18 | Koşan İnsan | sağ alt |
| 7:16 | 7:26 | Kedi | sağ üst |
| 7:24 | 7:34 | Araba | sol orta |
| … | … | (11 gif daha, 8 sn arayla) | … |
| 9:56 | 10:00 | Top | sağ üst |

### Sadece ses (10:00 – 11:00)

| Başlangıç | Bitiş | Ses |
|-----------|-------|-----|
| 10:00 | 10:10 | alarm |
| 10:12 | 10:22 | cekic |
| 10:24 | 10:34 | gemi |
| 10:36 | 10:46 | sudamlasi |
| 10:48 | 10:58 | kussesi |

### Sesli GIF (11:00 – 12:00)

| Başlangıç | Bitiş | GIF (sesli) | Konum |
|-----------|-------|-------------|--------|
| 11:00 | 11:10 | Top | sol alt |
| 11:12 | 11:22 | Koşan İnsan | sağ alt |
| 11:24 | 11:34 | Kedi | sol alt |
| 11:36 | 11:46 | Araba | sağ alt |
| 11:48 | 11:58 | Ağaç | sol alt |

*Not: 11:00–12:00 arasında aynı pencerede sessiz GIF’ler de devam eder (Top, Koşan, … Cam Temizliği 11:56’da).*

---

## YETİŞKİN — 15 dakika

### Ana simge fazları

| Zaman | Faz | Simge | Boşluk | Tur |
|-------|-----|-------|--------|-----|
| 0:00 – 1:00 | 0–1 dk | 1300 ms | 585 ms | 1,89 sn |
| 1:00 – 2:00 | 1–2 dk | 1100 ms | 495 ms | 1,60 sn |
| 2:00 – 3:00 | 2–3 dk | 1000 ms | 450 ms | 1,45 sn |
| 3:00 – 6:00 | 3–6 dk (+ sessiz GIF) | 1100 ms | 495 ms | 1,60 sn |
| 6:00 – 9:00 | 6–9 dk (+ sadece ses) | 900 ms | 405 ms | 1,31 sn |
| 9:00 – 12:00 | 9–12 dk (+ sessiz + sesli GIF) | 1200 ms | 540 ms | 1,74 sn |
| 12:00 – 13:00 | 12–13 dk | 1100 ms | 495 ms | 1,60 sn |
| 13:00 – 14:00 | 13–14 dk | 900 ms | 405 ms | 1,31 sn |
| 14:00 – 15:00 | 14–15 dk | 700 ms | 315 ms | 1,02 sn |

### Sessiz GIF (3:00 – 6:00)

Sürekli sessiz gif; en fazla 2 ekranda; gif başına max 10 sn; aralar max 2 sn.

### Sadece ses (6:00 – 9:00)

Sadece ses; en fazla 1 ses; 9. dakikada biter.

### Sessiz + sesli GIF (9:00 – 12:00)

Sessiz ve sesli gif birlikte; en fazla 1 sesli gif; 12. dakikada biter.

---

## ERGEN — 16 dakika

### Ana simge fazları

| Zaman | Faz | Simge | Boşluk | Tur |
|-------|-----|-------|--------|-----|
| 0:00 – 3:00 | 0–3 dk | 1300 ms | 585 ms | 1,89 sn |
| 3:00 – 6:00 | 3–6 dk | 1100 ms | 495 ms | 1,60 sn |
| 6:00 – 7:00 | 6–7 dk | 1000 ms | 450 ms | 1,45 sn |
| 7:00 – 8:00 | 7–8 dk | 900 ms | 405 ms | 1,31 sn |
| 8:00 – 9:00 | 8–9 dk | **800 ms** | 360 ms | **1,16 sn** |
| 9:00 – 11:00 | 9–11 dk (+ sessiz GIF) | 1100 ms | 495 ms | 1,60 sn |
| 11:00 – 12:00 | 11–12 dk (+ sadece ses) | 900 ms | 405 ms | 1,31 sn |
| 12:00 – 14:00 | 12–14 dk (+ sesli GIF) | 1200 ms | 540 ms | 1,74 sn |
| 14:00 – 16:00 | 14–16 dk | 1100 ms | 495 ms | 1,60 sn |

### Sessiz GIF (9:00 – 11:00)

9:00’den itibaren 8 sn adımla Top … Araba 10:52’ye kadar; 12:00–14:00 sesli pencerede tekrar sessiz GIF dizisi.

### Sadece ses (11:00 – 12:00)

alarm, cekic, gemi, sudamlasi, kussesi (11:00’dan başlayarak, çocuk/yetişkinle aynı sıra).

### Sesli GIF (12:00 – 14:00)

12:00 Top … 13:48 Motorsiklet; ~12 sn arayla, alt köşelerde dönüşümlü.

---

## Güncelleme yaparken

| Dosya | Ne değişir |
|-------|------------|
| `src/profiles.js` | Süre, fazlar, çeldirici pencerelerinin dakikaları |
| `src/distractorSchedule.js` | GIF/ses zamanlama kuralları |
| `src/constants.js` | GIF/ses listesi ve sırası |

Tam listeyi terminalde görmek: `node scripts/print-scenario.mjs`
