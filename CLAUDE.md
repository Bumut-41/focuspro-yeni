# FocusProLab — Claude talimatı (Cursor dışı)

Bu dosya **Claude Code** ve Claude sohbetleri için ana giriş noktasıdır.

## Zorunlu oku

1. `docs/CLAUDE-HANDOFF.md` — test safhaları, skor V4, PDF, Supabase, müdahale haritası, kırılgan kurallar  
2. `AGENTS.md` — kısa özet  

İşine başlamadan önce HANDOFF’u oku. Kör değişiklik yapma.

## Bu ürün nedir?

Dikkat / zamanlama / dürtüsellik / motor kontrol testi (A/T/I/H), uzman paneli, PDF rapor, davet + kredi.  
Stack: Vite + React → Vercel; Supabase (Auth, DB, Storage, Edge).  
Canlı skor: **V4** (`src/scoringVersion.js`).

## Sakıncalar (özet)

- `src/testQaMode.js` bayraklarını canlıda açma  
- V4 T’de ortalama hız puanı yok; ağırlıkları izinsiz değiştirme  
- Genel RT sayısı ≠ faz RT toplamı olabilir (dilim IQR) — “bug” diye eşitleme  
- A/I/H ayrımı: FA → I; idle/multi → H  
- `complete_test_session` ikinci overload ekleme  
- Faz `section` isimlerini rastgele değiştirme  
- Pratik testi kaydetme  

## Sık işler → dosya

| İş | Dosya |
|----|--------|
| Test süresi / bölümler | `src/profiles.js`, `src/useAttentionTest.js` |
| Çeldirici | `src/distractors/**`, `src/distractorSchedule.js` |
| Skor | `src/metricsV3.js`, `src/metricsV4.js`, `src/metrics.js` |
| PDF metin | `src/pdfReport.js`, `src/i18n/reportPdfStrings.js` |
| Denetim | `src/lib/algorithmAudit.js` |
| Danışan / davet | `src/services/clients.js`, `invites.js` |

Detay: `docs/CLAUDE-HANDOFF.md` §3–§11.

## Ortam

- İstemci: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (`.env`)  
- Deploy: `main` → GitHub → Vercel  
- Toplu PDF yenileme: `npm run refresh-reports` (service role gerekir)  

## Kullanıcıya cevap dili

Kullanıcı Türkçe konuşuyor; kısa ve net cevap ver. Teknik dosya/fonksiyon adlarını İngilizce bırak.
