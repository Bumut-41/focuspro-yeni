# FocusPro — Üyelik ve SaaS senaryosu

## Kimler üye olur?

| Rol | Açıklama |
|-----|----------|
| **Bireysel** | Kendi adına test yapar |
| **Psikolog** | Danışan/katılımcı adına test yapar |
| **Admin** | Siz — tüm sonuçlar ve kullanıcılar |

**Üyelik şartı:** Hesap sahibi **18 yaş ve üzeri** (doğum tarihi kayıtta kontrol edilir).

> Test yapan **katılımcı** 6–99 yaş olabilir (çocuk/ergen onamı). 18 kuralı **üye olan kişi** içindir.

## Test kredisi

1. Üye giriş yapar → panelde **kalan test hakkı** görünür.
2. **Test satın al** → krediye eklenir (şimdilik demo buton; ileride ödeme).
3. **Yeni test** başlatır → test bitince **1 kredi düşer** ve sonuç kaydedilir.
4. Kredi **0** ise test başlatılamaz.

## Yetkiler

| İşlem | Bireysel / Psikolog | Admin |
|--------|---------------------|--------|
| Kendi geçmiş testler | Evet | Evet |
| Başkasının testleri | Hayır | Evet |
| Tüm kullanıcı listesi | Hayır | Evet |
| Kullanıcıya kredi verme | Hayır | Evet |

## Kurulum (tek sefer)

1. [supabase.com](https://supabase.com) → proje oluştur.
2. SQL Editor → `supabase/schema.sql` içeriğini yapıştır → Run.
3. Authentication → Email açık.
4. `.env.example` → `.env` kopyala, URL ve anon key yaz.
5. İlk admin kullanıcıyı Auth’ta oluştur, sonra SQL:
   ```sql
   update public.profiles set role = 'admin', test_credits = 100 where id = 'KULLANICI-UUID';
   ```
6. `npm install` → `npm run dev`

## Uygulama rotaları

| Yol | Sayfa |
|-----|--------|
| `/` | Panel (geçmiş testler, kredi) |
| `/giris` | Giriş |
| `/kayit` | Kayıt (18+, rol seçimi) |
| `/test` | Dikkat testi |
| `/admin` | Yönetim (sadece admin) |
