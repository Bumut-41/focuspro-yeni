# FocusProLab — Operasyon & Güvenlik

Global ürün için zorunlu disiplin. Kod otomasyonu CI’da; bulut ayarları burada checklist.

## 1. Ortamlar (zorunlu)

| Ortam | Amaç | Vercel | Supabase |
|-------|------|--------|----------|
| local | Geliştirme | — | isteğe bağlı local / staging |
| staging | Deneme, QA | Preview env | **ayrı proje** |
| production | Canlı | Production env | **ayrı proje** |

**Kural:** Staging’de production anon key / service role kullanma. Resend staging’de allowlist veya sandbox.

## 2. Secret matrisi

| Secret | Nerede | İstemci? |
|--------|--------|----------|
| `VITE_SUPABASE_URL` | Vercel + `.env` | Evet (anon) |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env` | Evet (RLS ile) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yalnızca CI / admin script / Edge | **Hayır** |
| `RESEND_API_KEY` | Supabase Edge secrets | **Hayır** |
| `RESEND_FROM_EMAIL` | Edge secrets | **Hayır** |

Doğrulama: `npm run check:security` (service role / `VITE_` dışı env istemcide → FAIL).

## 3. GitHub otomasyonu (repoda)

- `.github/workflows/ci.yml` — `npm ci`, security basics, distractor check, production build
- `.github/workflows/security.yml` — basics + `npm audit` + gitleaks
- `.github/dependabot.yml` — haftalık npm / Actions PR

**Sizin yapmanız gereken (GitHub UI):**

1. Settings → Branches → `main` protection  
   - Require PR  
   - Require status checks: `Build + security basics`  
   - Restrict force push  
2. Settings → Actions → genel workflow izinleri (read/write ihtiyaca göre)  
3. Dependabot PR’larını güvenlik güncellemelerinde öncelikli merge

## 4. Vercel

- Production = yalnızca `main`
- Preview = PR; env = **staging** Supabase
- `vercel.json` güvenlik header’ları: nosniff, frame deny, HSTS, referrer, permissions-policy
- Production domain’de HTTPS zorunlu (Vercel varsayılan)

## 5. Supabase

- Staging + production ayrı proje
- Auth: güçlü şifre politikası; mümkünse MFA admin hesaplarda
- Database → Backups / PITR açık (prod)
- RLS: her tablo için “kim SELECT/INSERT/UPDATE/DELETE”
- RPC: `complete_test_session` **tek imza** (`fix-complete-test-session-overload.sql`)
- Edge secrets: Resend anahtarları dashboard’da; repo’da yok
- SQL değişiklikleri: mümkün olan en kısa sürede `supabase/migrations/` disiplinine geçin (elle yapıştırma ↓)

## 6. Resend (global e-posta)

1. Kendi domain (SPF + DKIM + DMARC)
2. From: `noreply@domain` / `reports@domain`
3. Staging: test allowlist
4. Webhook → bounce/complaint → oturum `report_email_*` alanları
5. Danışana **admin press PDF** asla gitmez (ürün kuralı)

## 7. İzleme (sonraki sprint)

| Katman | Öneri |
|--------|--------|
| FE hataları | Sentry (Vercel env: `VITE_SENTRY_DSN` yalnızca public DSN) |
| Uptime | Vercel + harici ping (auth sayfası / health) |
| Edge log | Supabase Functions logs + alarm |
| Audit | `/admin/algoritma-dogrulama` + `npm run refresh-reports` (service role) |

## 8. Olay runbook (kısa)

1. **Mail gitmiyor:** Resend dashboard → Edge log → `report_email_status` → domain DNS  
2. **Test kayıt timeout:** Network / `complete_test_session` / timeline attach RPC  
3. **PGRST203:** ikinci `complete_test_session` overload → fix SQL  
4. **Secret sızıntısı:** key rotate (Supabase + Resend), git history temizliği, gitleaks CI yeşil  
5. **Yanlış ortam:** staging’e prod key basıldıysa hemen rotate

## 9. Yerel komutlar

```bash
npm run check:security   # güvenlik temelleri
npm run ci               # security + distractor + build
npm run build
```

## 10. Uygulama sırası (sizin taraf)

- [ ] Staging Supabase projesi oluştur  
- [ ] Vercel Preview env → staging keys  
- [ ] Vercel Production env → production keys (mevcut)  
- [ ] GitHub `main` branch protection + required checks  
- [ ] Resend domain + DMARC  
- [ ] PITR / backup doğrula  
- [ ] (Sonra) Sentry + e-posta webhook  
