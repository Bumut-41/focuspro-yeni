# Google / Microsoft / Apple ile giriş

## Sitede ne var?

Giriş ve Kayıt sayfalarında 3 düğme:

- Google ile devam et
- Microsoft ile devam et
- Apple ile devam et

İlk kez sosyal hesapla girince **Profilinizi tamamlayın** ekranı çıkar (18 yaş + psikolog/bireysel).

---

## Sizin yapmanız gereken (Supabase — bir kez)

### 1) SQL güncellemesi

Supabase → **SQL Editor** → **New query**  
Dosya: `supabase/oauth-update.sql` → tümünü yapıştır → **Run** → Success.

### 2) Site adresini izinli yapın

Supabase → **Authentication** → **URL Configuration**

**Redirect URLs** listesine ekleyin:

```
http://localhost:5173/**
```

(Canlı site adresiniz varsa onu da ekleyin, örn. `https://siteniz.vercel.app/**`)

**Site URL** (varsa):

```
http://localhost:5173
```

### 3) Google

Authentication → **Providers** → **Google** → **Enable**  
Google Cloud Console’da OAuth client oluşturup Client ID / Secret yapıştırın (Supabase sayfasında link var).

### 4) Microsoft

Providers → **Azure** (Microsoft) → **Enable**  
Azure portal’dan Application + secret (Supabase rehberi linki var).

### 5) Apple

Providers → **Apple** → **Enable**  
Apple Developer hesabı gerekir (ücretli geliştirici hesabı).

---

Hangisini açarsanız o düğme çalışır. Hepsini açmak zorunda değilsiniz; önce **Google** yeterli.

---

## Test

1. `npm run dev`
2. `/giris` → **Google ile devam et**
3. Google hesabı seç
4. Profil formunu doldur → Panel
