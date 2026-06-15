# Test raporu e-posta gönderimi (şimdilik kapalı)

Bu özellik kodda hazır ancak **devre dışı**. Test bitince yalnızca PDF panelde kaydedilir; otomatik e-posta gönderilmez.

Tekrar açmak için: `src/lib/persistSessionPdfs.js` içinde `sendSessionReportEmail` çağrısını geri ekleyin ve aşağıdaki kurulumu yapın.

---

### 1. SQL

Supabase → **SQL Editor** → `supabase/report-email.sql` dosyasını çalıştırın.

### 2. Resend hesabı

1. [resend.com](https://resend.com) üzerinde ücretsiz hesap açın.
2. **API Keys** → yeni anahtar oluşturun.
3. Test için `onboarding@resend.dev` gönderen adresi kullanılabilir (yalnızca kendi doğrulanmış e-postanıza gider).
4. Canlı kullanım için kendi alan adınızı doğrulayın (ör. `rapor@sizindomain.com`).

### 3. Supabase Edge Function

Bilgisayarınızda [Supabase CLI](https://supabase.com/docs/guides/cli) kurulu olmalı.

```bash
cd proje-klasoru
supabase login
supabase link --project-ref SIZIN_PROJE_REF
```

**Secrets** (Supabase Dashboard → Edge Functions → Secrets veya CLI):

| Secret | Değer |
|--------|--------|
| `RESEND_API_KEY` | Resend API anahtarınız |
| `RESEND_FROM_EMAIL` | `FocusProLab <onboarding@resend.dev>` veya doğrulanmış adres |

Deploy:

```bash
supabase functions deploy send-report-email
```

JWT doğrulaması varsayılan olarak açıktır; istemci giriş token'ı ile çağırır.

### 4. Test

1. Giriş yapın, testi tamamlayın.
2. Rapor ekranında «Rapor kayıtlı e-posta adresinize gönderildi» mesajını görün.
3. Gelen kutusunu (ve spam) kontrol edin.

## Notlar

- Yalnızca **katılımcı test raporu** e-postalanır; admin basış raporu e-postalanmaz.
- Aynı oturum için e-posta yalnızca **bir kez** gönderilir (`report_email_sent_at`).
- Resend yapılandırılmamışsa test ve PDF kaydı normal çalışır; e-posta sessizce atlanır.
- E-posta **hesap sahibine** gider (giriş yapan kullanıcı), katılımcı adına değil.
