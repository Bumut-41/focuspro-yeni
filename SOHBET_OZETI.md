# FocusPro — Sohbet Özeti (Focusprolab → FocusPro-yeni)

> **Kaynak:** Eski Cursor sohbeti (Focusprolab klasörü, ~420 satır)  
> **Güncel proje klasörü:** `C:\Users\ERNKIT03\OneDrive - Eren Holding\Masaüstü\FocusPro-yeni`  
> **Kural:** Bundan sonra tüm kod ve talimatlar **yalnızca FocusPro-yeni** içinde yapılır.

Ham kayıt kopyası: `docs/arsiv/focusprolab-sohbet-070db2e4.jsonl`

---

## Sizin çalışma tercihleriniz (buna uyulacak)

1. **Türkçe**, sade dil — teknik terim az, adım adım.
2. **“Adım tamam” demeden sonraki adıma geçme.**
3. **Kopyala-yapıştır parçaları istemiyorsunuz** — dosyaları ben (Cursor) doğrudan güncellemeliyim.
4. **GitHub Web’de elle düzenleme** yerine PC’deki proje + otomatik senkron tercih edildi.
5. Değişikliklerden sonra **GitHub’a otomatik gitmesi** istendi → `npm run sync` + `.githooks/post-commit`.

---

## Proje hedefi (özet)

**FocusProLab** — React + Vite dikkat testi uygulaması:

| Özellik | Durum (FocusPro-yeni) |
|--------|------------------------|
| Yaş profilleri (çocuk / ergen / yetişkin) | Var — `src/profiles.js` (kıstas süreleri) |
| Dikkat testi (hedef şekil+renk, SPACE) | Var — `useAttentionTest.js` |
| Hedef şekil sabit **üçgen** | Var — `FIXED_TARGET_SHAPE = "triangle"` |
| Çeldiriciler (11 GIF + 10 bağımsız ses, `public/distractors/`) | Var — tam set `constants.js` |
| Rapor ekranı + grafik | Var — `ReportPanel.jsx`, Chart.js |
| PDF indirme | Var — `pdfReport.js` |
| Space tuşu kontrolü (ayrı animasyonlu ekran) | Var — `App.jsx` adım: `spaceCheck` |
| Test her koşuda **birebir aynı** (sabit tohum) | Var — `src/random.js` `FIXED_TEST_SEED` |
| Supabase / kayıt / SaaS | Eski sohbette planlandı; **şu an pakette yok** (sadece Chart + pdfmake) |
| Web yayını (Vercel) | `vercel.json` mevcut |

---

## Sohbette geçen ana talepler (kronoloji)

### 1. Analiz ve mimari (kod yok)
- Eski monolit `App.js` için dosya yapısı, SaaS, modülerleştirme anlatıldı.

### 2. Sıfırdan basit proje
- Yaş profili, test, çeldirici, rapor, PDF — Supabase’siz basit sürüm.

### 3. Web + kayıt isteği
- Daha büyük proje, kayıtların webde kalması → Supabase + login + panel denemeleri (Focusprolab klasöründe).

### 4. Sadeleştirme
- “Şimdilik sadece test”, rapor sonra.
- Ayrı klasör: `focusprolabv1` (ana projeye dokunma).

### 5. GitHub + yayın (adım adım)
- GitHub Desktop / Web karışıklığı.
- **FocusPro-yeni** resmi klasör olarak netleşti.
- Otomatik `git push` isteği → `scripts/sync-github.mjs`, post-commit hook.

### 6. Test özellikleri
- Üçgen sabit hedef.
- Space kontrolü testten **önce**, ayrı ekran, animasyonlu.
- Canlı sitede space görünmeme sorunu (deploy gecikmesi).
- **AItalimat.xlsx** kıstaslarına göre faz süreleri → `profiles.js` + yedek `backup/pre-kistas-2026-05-15/`.
- Ekranda “Süre: 15 dk” (profil bazlı metin).
- Testin **deterministik** olması (aynı GIF/ses zamanları) → `random.js` + `distractorSchedule.js`.

### 7. Sohbet taşıma
- Cursor’da **FocusPro-yeni** workspace açıldı.
- Bu dosya = eski sohbetin özeti + devam kuralı.

---

## Güncel dosya yapısı (FocusPro-yeni)

```
FocusPro-yeni/
├── src/
│   ├── App.jsx              # Akış: form → spaceCheck → brief → test → report
│   ├── useAttentionTest.js  # Test motoru
│   ├── profiles.js          # Çocuk 13dk / Yetişkin 15dk / Ergen 16dk fazları
│   ├── distractorSchedule.js
│   ├── random.js            # Sabit tohum
│   ├── constants.js, metrics.js, shapeUtils.jsx, pdfReport.js
│   └── components/ReportPanel.jsx
├── public/distractors/      # GIF ve ses dosyaları buraya
├── backup/pre-kistas-2026-05-15/  # Geri dönüş yedeği
├── scripts/sync-github.mjs
├── vercel.json
└── SOHBET_OZETI.md          # Bu dosya
```

---

## Akış (kullanıcı deneyimi)

1. **Katılımcı formu** — ad, doğum tarihi, cinsiyet, (çocuk/ergen) onam  
2. **Space kontrolü** — animasyonlu ayrı ekran, SPACE ile doğrulama  
3. **Kısa bilgi** — hedef üçgen + renk, süre metni  
4. **Test** — SPACE veya dokunma  
5. **Rapor** — skorlar, grafik, PDF indir  

---

## Sizin için kısa komutlar

| Ne yapmak istiyorsunuz? | Komut / işlem |
|-------------------------|----------------|
| Bilgisayarda test | `npm install` → `npm run dev` → tarayıcı `http://localhost:5173` |
| GitHub’a gönder | `npm run sync -- "mesajınız"` veya commit sonrası hook |
| Hook kurulumu (bir kez) | `npm run setup-hooks` |
| Eski kıstasa dön | `backup/pre-kistas-2026-05-15/GERI_YUKLE.txt` |

---

## Henüz yapılmayan / erteelenen (eski sohbetten)

- Supabase Auth, Storage, kullanıcı paneli, webde kalıcı kayıt (SaaS tam hali).
- Tam modüler klasör yapısı (`features/auth`, `pages/` vb.) — Focusprolab’da denendi; **FocusPro-yeni** daha düz yapıda.
- Rapor/Supabase’in “büyük proje” sürümü — birlikte tekrar kurgulanacak denmişti.

---

## Cursor’a not (yeni sohbetlerde)

Kullanıcı şunu istiyor: **Tüm işlemler `FocusPro-yeni` klasöründe.** Focusprolab veya focusprolabv1 **referans değil**, sadece arşiv. Adım adım Türkçe anlat; kodu doğrudan dosyalara yaz; mümkünse `npm run sync` ile GitHub güncelle.

*Son güncelleme: 2026-05-20*
