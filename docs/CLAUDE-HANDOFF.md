# FocusProLab — Claude / AI Devralma El Kitabı

**Amaç:** Bu projeyi Claude (veya başka bir ajan) devam ettirirken testin tüm safhalarına, skorlamaya, rapora ve altyapıya **hâkim** olsun; kör müdahale ile kırılmasın.

**Ürün:** FocusProLab — dikkat / zamanlama / dürtüsellik / motor kontrol ölçümü (MOXO-benzeri dört endeks), uzman paneli, PDF rapor, davet/kredi.

**Canlı:** Vite + React SPA → Vercel (`main`). Backend: Supabase (Auth, Postgres, Storage, Edge Functions).

**Aktif skor:** `ACTIVE_REPORT_SCORING_VERSION = "v4"` (`src/scoringVersion.js`). Kullanıcıya yalnızca V4; V1–V3 kodda karşılaştırma/araştırma için saklı.

---

## 0. Cursor DIŞI Claude’ye nasıl verilir?

Bu proje artık Cursor’a bağlı değil; **Claude uygulaması / Claude Code** ile geliştirilecek.

### A) Claude Code (bilgisayarda klasörle kod yazar — önerilen)

1. Claude Code’u kur / aç.  
2. Çalışma klasörü olarak bu proje kökünü ver:  
   `…/FocusPro-yeni`  
3. Claude otomatik `CLAUDE.md` okur; sen de ilk mesajda de:  
   `docs/CLAUDE-HANDOFF.md dosyasını oku, sonra …`  
4. Kod, git, terminal burada çalışır. Cursor gerekmez.

### B) Claude.ai Project (sohbet + bilgi yükleme)

1. [claude.ai](https://claude.ai) → **Projects** → yeni proje: `FocusProLab`.  
2. **Project knowledge**’a şunları yükle (en azından):  
   - `CLAUDE.md`  
   - `AGENTS.md`  
   - `docs/CLAUDE-HANDOFF.md`  
   - İstersen tüm `src/` ve `supabase/` (mümkünse zip / çoklu dosya)  
3. İlk mesaj:

```
Sen FocusProLab’ın tek geliştiricisisin. Yüklenen HANDOFF ve CLAUDE.md kurallarına uy.
Kod değişikliklerini net diff / tam dosya içeriği olarak ver; ben bilgisayardaki repoya uygulayacağım.
Görev: …
```

Not: Sadece sohbet kullanıyorsan Claude dosyaları senin diske yazmaz; çıktıyı sen kaydedersin. Kod yazdırıp kaydettirmek için **Claude Code (A)** daha doğru.

### C) GitHub

Repo: GitHub `main` (Vercel buradan deploy eder). Claude Code ile `git push` yapabilirsin; Claude.ai ile sen push edersin.

### İlk talimat (her iki yol)

```
Bu repo FocusProLab. Önce CLAUDE.md + docs/CLAUDE-HANDOFF.md + AGENTS.md oku.
Kırılgan kurallar: testQaMode bayraklarını canlıda açma; V4 ağırlıklarını / A-I-H ayrımını izinsiz değiştirme;
genel RT N ≠ faz RT toplamını “bug” sanıp düzeltme (dilim IQR beklenen);
faz section isimlerini rastgele değiştirme; complete_test_session overload çoğaltma.
Değişiklikten önce HANDOFF’taki “Nereye müdahale” tablosunu kullan.
Görev: …
```

---

## 1. Mimari özet

```
Tarayıcı (Vite/React)
  ├─ Test motoru: useAttentionTest + profiles + distractors
  ├─ Skor: metricsV4 ← metricsV3 (+ metrics.js A/I/H)
  ├─ Rapor: reportHelpers → pdfReport + reportClinical + i18n
  └─ Servisler: sessions / clients / invites / emailReport
         ↓
Supabase
  ├─ Auth + profiles.role
  ├─ test_sessions (logs, metrics, pdf_path)
  ├─ test_press_timelines
  ├─ test_invites, specialist_clients, krediler
  ├─ Storage bucket: reports
  └─ Edge: send-report-email, send-test-invite, register-account
```

| Katman | Giriş noktaları |
|--------|-----------------|
| Routing / shell | `src/App.jsx`, `src/main.jsx` |
| Auth / roller | `src/auth/AuthContext.jsx`, `src/lib/userRoles.js` |
| Test UI | `src/pages/TestFlowPage.jsx` |
| Test motoru | `src/useAttentionTest.js` |
| Profil / tempo / süre | `src/profiles.js` |
| Çeldirici | `src/distractorSchedule.js`, `src/distractors/**` |
| QA (kapalı tut) | `src/testQaMode.js` |
| Skor | `src/metrics.js` … `metricsV4.js`, `reportHelpers.js` |
| PDF | `src/pdfReport.js`, `src/i18n/reportPdfStrings.js` |
| Denetim | `src/lib/algorithmAudit.js` |

---

## 2. Roller ve paneller

| `profiles.role` | Yetki |
|-----------------|--------|
| `individual` | Kendi testleri, satın alma, otomatik rapor maili (akışa göre) |
| `psychologist` | Danışanlar, davet (kredi düşer), panelden rapor e-posta |
| `admin` | Yönetim paneli (oturumlar, başvurular, …) |
| `super_admin` | Admin + kredi/silme/promosyon/danışan tüm kayıtlar |

- Panel: `/panel` → `DashboardPage.jsx`
- Admin: `/admin/*` → `AdminPage.jsx`
- Test: `/test` → `TestFlowPage.jsx` (lazy)
- Davet: `/davet/:token` → `InvitePage.jsx`

---

## 3. Test akışı — safha safha (NEREDE / NASIL)

Kaynak: `TestFlowPage.jsx` `step` state + `useAttentionTest.js`.

| # | `step` | Ne olur | Müdahale dosyaları |
|---|--------|---------|-------------------|
| 1 | `form` | Bireysel: ad/doğum/cinsiyet. Psikolog: **danışan ara** → seç → Teste başla | `TestFlowPage.jsx`, `clients.js`, `SpecialistClientsPanel.jsx` (kayıt ayrı) |
| 2 | `prep` | Yönerge metinleri | `copy/testInstructions.js`, i18n `test.prep` |
| 3 | `spaceCheck` | Space / dokunma doğrulama | `TestFlowPage.jsx`, `useTouchTest.js` |
| 4 | `audioCheck` | Ses kontrolü | `TestFlowPage.jsx`, `AUDIO_CHECK_SOUND` |
| 5 | `guide` | Katılımcı rehberi (immersive) | `TestParticipantGuide.jsx` |
| 6 | `countdown` | 3-2-1 | `TestFlowPage.jsx` |
| 7 | `practiceRun` | ~30 sn pratik — **kaydedilmez** | `getPracticeProfile()` in `profiles.js` |
| 8 | `brief` | Ana teste geçiş metni | i18n / instructions |
| 9 | `countdown` | Ana test geri sayım | |
| 10 | `run` | Ana ölçüm | `useAttentionTest`, `profiles`, distractors |
| 11 | `thanks` | `saveTestSession` + PDF persist (+ mail kuralları) | `sessions.js`, `emailReport.js`, `persistSessionPdfs.js` |

**Immersive chrome:** `TestChromeContext` — guide/space/audio/countdown/run’da header gizlenir.

### 3.1 Profil süreleri ve geç yanıt eşiği

`src/profiles.js` → `PROFILES`:

| key | Süre | `lateResponseMs` | Blok özeti |
|-----|------|------------------|------------|
| `child` | 13 dk | 1000 ms | temel → sessiz gif → sadece ses → kombine → kapanış |
| `teen` | 15 dk | 900 ms | aynı mantık, 3’er dk pencereler |
| `adult` | 15 dk | 800 ms | aynı |

Blok içi tempo: yavaş → orta → hızlı (`ADULT_TEMPO` / `CHILD_TEMPO` / `TEEN_TEMPO`).

**Dikkat:** Faz etiketleri Türkçe (`sessiz gif`, `sadece ses`, …). `report/phaseBuckets.js` → `classifyPhaseSection` bunlara bağlı. İsmi değiştirirsen PDF faz kovaları + denetim kırılır.

### 3.2 Motor davranışları (`useAttentionTest`)

- Deterministik RNG: `random.js` (seed). Seed/algoritma değişirse geçmişle yeniden üretilebilirlik bozulur.
- Hedef: sabit üçgen + renk (oturum başında seçilir).
- Her deneme loglanır; Space/touch → `pressTimeline`.
- Çeldirici tavanları (yaklaşık): sessiz GIF ≤2, sesli GIF ≤1, solo ses sınırlı — `scheduleDistractors`.

### 3.3 Çeldirici alt sistem

| Tür | Klasör / API |
|-----|----------------|
| Sessiz GIF | `distractors/silent/` |
| Solo ses | `distractors/` + `soloSoundSchedule.js` |
| Kombine | `distractors/combined/` |
| Zamanlama sabitleri | `distractorTiming.js` |
| Takvim birleştirme | `distractorSchedule.js` |

Asset’ler: `public/distractors/`.

### 3.4 QA bayrakları — CANLIDA AÇMA

`src/testQaMode.js`:

- `DISTRACTOR_ONLY_QA`
- `DISTRACTOR_GIF_SECTIONS_QA`
- `DISTRACTOR_SECTIONS_ONLY_QA`

Hepsi **`false`** olmalı. `true` yapınca test kısalır / bölümler değişir → canlı kullanıcıya gitmesin.

---

## 4. Veri modeli (log)

### 4.1 Deneme (`logs[]` — `trialToLog`)

Önemli alanlar: `trialNumber`, `section`, `isTarget`, `responded`, `reactionTime`, `responseCount`, `onsetMs`/`offsetMs`, şekil/renk, `trialPresses`.

### 4.2 Basış çizelgesi (`pressTimeline[]`)

Her basış: `atMs`, `trialNumber`, `section`, `onScreen`, `errorType` (`none|late|multi|false_alarm|idle`), `isCorrectHit`, `reactionMs`, …

**H (motor) idle** için timeline şart. Yoksa idle=0; denetimde idle tarafı NOT VERIFIED olabilir.

### 4.3 Kayıt yolu

```
onDone(snapshot, target, timeline)
  → computeReportMetrics(...)  // her zaman V4
  → saveTestSession → RPC complete_test_session
  → deliverSessionReport / persistAllSessionPdfs
```

- Davetli test: `owner_id` = psikolog; kredi **davet oluştururken** düşer, test bitince tekrar düşmez.
- Storage yolu: `{owner_id}/{session_id}.pdf` (invite’da owner ≠ taker olabilir).

---

## 5. Skorlama (A / T / I / H)

### 5.1 Sürümler

| Sürüm | Dosya | Not |
|-------|-------|-----|
| V1 | `metrics.js` | Eski T (hız merkezli) |
| V2 | `metricsV2.js` | T + 450 ms hız + IQR |
| V3 | `metricsV3.js` | T = stabilite + geç; **hız puanı yok** |
| **V4** | `metricsV4.js` | Sayısal skor ≈ V3; rapor dili / bayraklar V4 |

Kullanıcı yüzü: `reportHelpers.computeReportMetrics` → V4.

### 5.2 Endeks mantığı (V4 / V3 T)

| Endeks | Ne ölçer | Kabaca formül |
|--------|----------|----------------|
| **A** | İhmal | `100 − (omissions/targets)×100` — FA A’ya girmez |
| **I** | Yanlış alarm (hedef dışı ilk tepki) | `100 − faRate×5` |
| **H** | Çoklu basış + boş ekran (idle) | FA H’ye **girmez** |
| **T** | Tutarlılık + zamanında yanıt | `0.55×stabilite + 0.45×geçOran` — **ortalama hız skorlanmaz** |
| Genel | | `0.30A + 0.25T + 0.30I + 0.15H` |

**Zamanında RT örneği:** hedef + yanıt + `0 < RT ≤ lateMs`. Sonra dilimde N≥4 ise **1.5×IQR** aykırı atılır.

### 5.3 Genel RT N ≠ faz RT toplamı (BİLİNÇLİ)

IQR **her dilimde kendi dağılımına** uygulanır. Aynı olay genel sete dahil, fazda `iqr_outlier` (veya tersi) olabilir → örn. 169/167.

**Denetim kuralı B (sabit — değiştirme):**

- Eşit N zorunlu değil.
- Farklar yalnızca `included ↔ iqr_outlier` ise → **RT_FILTER PASS**.
- Beklenmeyen gerekçe / faz dışı orphan → **FAIL**.
- Ledger yok → **NOT VERIFIED**.
- A/I/H ve puan hesabı **RT_FILTER’ın parçası değil** (ayrı gruplar).

Kod: `src/lib/algorithmAudit.js` → `compareOverallVsPhaseRt`, `RT_OVERALL_VS_PHASE_OK`.

---

## 6. Rapor / PDF — nereye dokunulur

| İhtiyaç | Dosya |
|---------|--------|
| Sayfa düzeni, kutular, ekler | `pdfReport.js` |
| Skor / faz serisi / matris | `reportHelpers.js` |
| Klinik metin, geçerlilik | `report/reportClinical.js` |
| Faz yorumları / çeldirici etiket | `report/phaseComments.js`, `report/scoreTiers.js` |
| Grafik PNG | `reportCharts.js` |
| TR/EN PDF metin | `i18n/reportPdfStrings.js` |
| IT PDF metin | `i18n/reportPdfIt.js` |
| Faz kovaları | `report/phaseBuckets.js` |

**T tanımı (kullanıcıya):** yalnızca tutarlılık + zamanında yanıt — V4 teknik notu kaldırıldı (bilinçli).

**Saklanan PDF vs canlı:** İndirme çoğu yerde log’dan V4 yeniden üretir. E-posta eki Storage dosyasını kullanır → metin değişince `ReportRefreshPanel` veya `npm run refresh-reports` ile toplu yenile.

Admin basış PDF’i (`*-admin.pdf`) **yalnızca admin** — danışana mail atma.

---

## 7. Uzman / davet / e-posta

| Özellik | Dosyalar |
|---------|----------|
| Danışan CRUD + ara + sil | `SpecialistClientsPanel.jsx`, `clients.js`, SQL `specialist-clients*.sql` |
| Süper admin tüm danışanlar | `AdminClientsPanel.jsx`, `/admin/danisanlar` |
| Davet oluştur / mail | `invites.js`, `PsychologistInvitesPanel`, Edge `send-test-invite` |
| Rapor mail | `emailReport.js`, Edge `send-report-email`, `docs/EMAIL_SETUP.md` |

Psikolog: test bitince PDF sisteme; mail panelden. Bireysel: akışta otomatik mail denemesi (`TestFlowPage` `shouldAutoEmail`).

---

## 8. Admin araçları

| Araç | Yol |
|------|-----|
| Algoritma doğrulama | `/admin/algoritma-dogrulama` → `AlgorithmAuditPanel` |
| Kayıtlı rapor yenile | aynı sayfa `ReportRefreshPanel` + `refreshStoredReports.js` |
| CLI yenileme | `npm run refresh-reports` (`SUPABASE_SERVICE_ROLE_KEY`) |
| Skor karşılaştırma V1–V4 | `ScoringComparisonPanel` |
| Storage admin yazma | `supabase/admin-refresh-reports-storage.sql` (uygulanmış olmalı) |

---

## 9. Supabase

**Tablolar (çekirdek):** `profiles`, `test_sessions`, `test_press_timelines`, `test_invites`, `specialist_clients`, `credit_transactions`, satın alma / başvuru tabloları.

**Kritik SQL (overload tuzağı):**

- `complete_test_session` **tek imza** olmalı. İkinci overload → PostgREST PGRST203.
- Düzeltme referansı: `supabase/fix-complete-test-session-overload.sql`
- Debit varyantları: `individual-test-debit.sql`, `specialist-test-debit.sql` — dikkatli birleştir.

**Env (istemci):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`  
**Edge:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

---

## 10. “Şunu değiştirmek istiyorum” haritası

| İstek | Önce oku / değiştir | Sakın |
|-------|---------------------|-------|
| Test süresi / tempo | `profiles.js` | Faz adlarını rastgele değiştirme |
| Geç yanıt eşiği | `lateResponseMs` profilde | Skor+PDF+audit aynı değeri kullanmalı |
| Çeldirici sıklığı / GIF | `distractors/**`, `distractorTiming.js` | QA bayraklarını açık bırakma |
| Pratik uzunluğu | `getPracticeProfile` | Pratiği `saveTestSession`’a bağlama |
| A/I/H formülü | `metrics.js` + V3/V4 yolları | FA→H veya late→A karıştırma; audit bozulur |
| T formülü / ağırlık | `metricsV3.js` (`TIMING_W_*`) | İzinsiz “hız puanı” geri ekleme; PDF metni ile çelişir |
| Genel ağırlık | `OVERALL_WEIGHTS` | Aktif sürüm V4; eski oturumlar için refresh düşün |
| Rapor metni / T tanımı | `reportPdfStrings.js` / It | |
| Faz grafikleri | `phaseBuckets.js`, `reportCharts.js` | |
| Danışan alanları | `specialist-clients*.sql` + `clients.js` + panel | |
| RT denetim kuralı | `algorithmAudit.js` | “N eşit olmalı”ya geri dönme (kural B) |
| Deploy | `main` push → Vercel | |

---

## 11. Kırılgan kurallar (checklist)

1. `testQaMode.js` canlıda hep `false`.
2. Kullanıcı skoru = V4; V1–V3’ü silme, karşılaştırma için duruyor.
3. Genel dahil RT ≠ faz toplamı beklenen olabilir → audit PASS (IQR flip).
4. A / I / H ayrımı (özellikle FA≠H, idle yalnız H).
5. `complete_test_session` overload çoğaltma.
6. Davet kredisi oluşturmada; complete’te ikinci debit yok.
7. `random.js` / distractor takvimi = yeniden üretilebilirlik.
8. Faz `section` string’leri = PDF kovaları.
9. `pressTimeline` olmadan H idle güvenilmez.
10. Storage path = `owner_id`.
11. Admin press PDF’i danışana gönderme.
12. Practice kaydedilmez.
13. PDF metin değişince Storage e-posta ekleri eski kalabilir → refresh.

---

## 12. Yerel komutlar

```bash
npm install
npm run dev          # geliştirme
npm run build        # Vercel ile aynı build
npm run refresh-reports   # service_role ile tüm PDF/metrik yenileme
npx supabase db query --linked -f supabase/....sql
```

---

## 13. Claude oturumu önerilen düzen

1. Bu dosya + `AGENTS.md` + `.cursor/rules/*` yüklü olsun.
2. Görev alınca **önce** §10 tablosundan dosyayı bul; kör global arama ile formül değiştirme.
3. Skor/algoritma değişikliği istenirse: formülü, PDF metnini, audit beklentisini ve (gerekirse) rapor refresh’i birlikte planla.
4. Test motoru değişikliğinde pratik vs ana test ayrımını doğrula.
5. Commit mesajında “why” yaz; kullanıcı istemeden force-push / amend yapma.

---

## 14. Son durum notları (2026-11)

- Aktif rapor V4; T açıklamasında V4 teknik cümle yok.
- RT_FILTER kural B sabit kabul edildi (GPT denetim tartışması kapandı).
- Danışan: telefon/adres/not, düzenle/sil, panelde RecordFilters arama; Test’te danışan ara.
- Kayıtlı raporlar toplu V4 yenilenebilir (`refresh-reports` / admin panel).

Bu belge güncellenmeli: skor formülü, faz yapısı veya RPC imzası değişince §5–§9’u revize et.
