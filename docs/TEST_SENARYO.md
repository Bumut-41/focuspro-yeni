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

| | **Çocuk (13 dk)** | **Yetişkin (15 dk)** | **Ergen (15 dk)** |
|--|-------------------|----------------------|-------------------|
| Geç yanıt eşiği | 1000 ms | 800 ms | 900 ms |
| Hedef çıkma olasılığı | ~%45 | ~%40 | ~%42 |
| Sessiz GIF penceresi | 3:00 – 6:00 | 3:00 – 6:00 | 3:00 – 6:00 |
| Sadece ses penceresi | 6:00 – 8:00 | 6:00 – 9:00 | 6:00 – 9:00 |
| Sessiz + sesli GIF | 8:00 – 11:00 | 9:00 – 12:00 | 9:00 – 12:00 |

---

## ÇOCUK — 13 dakika

### Ana simge fazları (hız)

| Zaman | Faz | Simge ekranda | Boşluk | Tur süresi |
|-------|-----|---------------|--------|------------|
| 0:00 – 1:00 | 0–1 dk | 1800 ms | 810 ms | 2,61 sn |
| 1:00 – 2:00 | 1–2 dk | 1700 ms | 765 ms | 2,47 sn |
| 2:00 – 3:00 | 2–3 dk | 1600 ms | 720 ms | 2,32 sn |
| 3:00 – 6:00 | 3–6 dk (+ sessiz GIF) | 1600 ms | 720 ms | 2,32 sn |
| 6:00 – 8:00 | 6–8 dk (+ sadece ses) | 1600 ms | 720 ms | 2,32 sn |
| 8:00 – 11:00 | 8–11 dk (+ sessiz + sesli GIF) | 1600 ms | 720 ms | 2,32 sn |
| 11:00 – 12:00 | 11–12 dk | 1850 ms | 833 ms | 2,68 sn |
| 12:00 – 13:00 | 12–13 dk | 1650 ms | 743 ms | 2,39 sn |

### Sessiz GIF (3:00 – 6:00)

Sürekli sessiz gif; en fazla 2 ekranda; 6. dakikada biter.

### Sadece ses (6:00 – 8:00)

Sadece ses; en fazla 1 ses; 2 dakika sürer (8. dakikada biter).

### Sessiz + sesli GIF (8:00 – 11:00)

Sessiz ve sesli gif birlikte; en fazla 1 sesli gif; 11. dakikada biter.

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

## ERGEN — 15 dakika

### Ana simge fazları

| Zaman | Faz | Simge | Boşluk | Tur |
|-------|-----|-------|--------|-----|
| 0:00 – 1:00 | 0–1 dk | 1400 ms | 630 ms | 2,03 sn |
| 1:00 – 2:00 | 1–2 dk | 1200 ms | 540 ms | 1,74 sn |
| 2:00 – 3:00 | 2–3 dk | 1000 ms | 450 ms | 1,45 sn |
| 3:00 – 6:00 | 3–6 dk (+ sessiz GIF) | 1100 ms | 495 ms | 1,60 sn |
| 6:00 – 9:00 | 6–9 dk (+ sadece ses) | 1000 ms | 450 ms | 1,45 sn |
| 9:00 – 12:00 | 9–12 dk (+ sessiz + sesli GIF) | 900 ms | 405 ms | 1,31 sn |
| 12:00 – 13:00 | 12–13 dk | 1300 ms | 585 ms | 1,89 sn |
| 13:00 – 14:00 | 13–14 dk | 1100 ms | 495 ms | 1,60 sn |
| 14:00 – 15:00 | 14–15 dk | 900 ms | 405 ms | 1,31 sn |

### Sessiz GIF (3:00 – 6:00)

Sürekli sessiz gif; en fazla 2 ekranda; 6. dakikada biter.

### Sadece ses (6:00 – 9:00)

Sadece ses; en fazla 1 ses; 9. dakikada biter.

### Sessiz + sesli GIF (9:00 – 12:00)

Sessiz ve sesli gif birlikte; en fazla 1 sesli gif; 12. dakikada biter.

---

## Güncelleme yaparken

| Dosya | Ne değişir |
|-------|------------|
| `src/profiles.js` | Süre, fazlar, çeldirici pencerelerinin dakikaları |
| `src/distractorSchedule.js` | GIF/ses zamanlama kuralları |
| `src/constants.js` | GIF/ses listesi ve sırası |

Tam listeyi terminalde görmek: `node scripts/print-scenario.mjs`
