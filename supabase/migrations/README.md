# Migrations

Hedef: SQL’leri elle yapıştırmak yerine buraya zaman damgalı migration dosyaları koymak.

Şimdilik canonical düzeltmeler `supabase/*.sql` kökünde (ör. `fix-complete-test-session-overload.sql`, `attach-session-press-timeline.sql`).

Geçiş planı:

1. Staging + production ayrı proje  
2. `supabase link` + `supabase db pull` ile baseline  
3. Yeni değişiklikler yalnızca `migrations/` altına  
4. CI’da `supabase db lint` / drift kontrolü  

`complete_test_session` için canlıda **tek imza** kuralı bozulmamalı.
