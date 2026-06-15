import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { Button } from "../components/ui.jsx";

const HERO_SLIDES = [
  {
    title: "Dikkat ve Sürekli Performansta Yeni Nesil Değerlendirme",
    text: "FocusProLab, dikkat ve yürütücü işlevleri çok aşamalı senaryolarla ölçer; klinik ve bireysel kullanım için objektif veri sunar.",
    accent: "hero-a"
  },
  {
    title: "Gerçek Hayatı Simüle Eden Çeldiriciler",
    text: "Sessiz görsel, yalnızca işitsel ve kombine çeldirici bölümleriyle performansın hangi koşullarda değiştiğini ayrıntılı raporlar.",
    accent: "hero-b"
  },
  {
    title: "Çocuk, Ergen ve Yetişkin Profilleri",
    text: "6–12 yaş çocuk, 13–17 ergen ve 18+ yetişkin için ayrı test süreleri, hız kademeleri ve normatif karşılaştırmalar.",
    accent: "hero-c"
  },
  {
    title: "Anında PDF Rapor ve Yönetim Paneli",
    text: "Test bitince otomatik rapor; psikolog ve yöneticiler için panel, basış çizelgesi ve merkezi kullanıcı yönetimi.",
    accent: "hero-d"
  },
  {
    title: "DEHB Sürecinde Objektif Destek",
    text: "Tanı ve takip süreçlerinde uzmanlara yardımcı ölçüm; danışan ve aileyle paylaşılabilir görsel raporlar.",
    accent: "hero-e"
  }
];

const FEATURES = [
  {
    title: "Çocuklar için dikkat değerlendirmesi",
    text: "13 dakikalık yaş uyumlu senaryo; görsel ve işitsel çeldiricilerle dikkat profili.",
    icon: "👧"
  },
  {
    title: "Yetişkinler ve ergenler",
    text: "15 dakikalık test; hız rampası ve çoklu çeldirici bloklarıyla ayrıntılı performans analizi.",
    icon: "🧑"
  },
  {
    title: "Uzman ve yönetici paneli",
    text: "Tüm testler, basış raporları, rol yönetimi ve Super Admin araçları tek merkezden.",
    icon: "📊"
  },
  {
    title: "Hızlı ve güvenilir sonuç",
    text: "Oturum sonunda metrikler, faz grafikleri ve indirilebilir PDF — ek işlem gerekmez.",
    icon: "⚡"
  }
];

const STATS = [
  { value: "3", label: "Yaş profili", suffix: "" },
  { value: "5", label: "Çeldirici senaryo bloğu", suffix: "+" },
  { value: "20", label: "Dakikaya kadar test", suffix: "+" },
  { value: "1", label: "Tıkla PDF rapor", suffix: "" }
];

const TESTIMONIALS = [
  {
    quote:
      "Görsel ve işitsel çeldiriciler altında performansın nasıl değiştiğini tek raporda görmek seans planlamasını kolaylaştırıyor.",
    role: "Klinik psikolog"
  },
  {
    quote:
      "Danışanımla grafiği ilk görüşmede paylaşmak güven ilişkisini güçlendiriyor; aileler somut veriyi daha iyi anlıyor.",
    role: "Psikolojik danışman"
  },
  {
    quote:
      "Basış zaman çizelgesi ve faz metrikleri, gözlemden çıkan ipuçlarını sayısallaştırmamı sağlıyor.",
    role: "Nöropsikolog"
  },
  {
    quote:
      "Çevrimiçi uygulama sayesinde merkez içi bekleme olmadan testi tamamlayıp arşive alabiliyoruz.",
    role: "Uygulayıcı uzman"
  }
];

export default function HomePage() {
  const { user } = useAuth();
  const [slide, setSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setSlide((i) => (i + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(nextSlide, 6000);
    return () => clearInterval(id);
  }, [nextSlide]);

  const primaryTo = user ? "/panel" : "/kayit";
  const primaryLabel = user ? "Panele git" : "Ücretsiz kayıt ol";

  return (
    <div className="fp-landing">
      <section className="fp-hero" aria-label="Tanıtım">
        {HERO_SLIDES.map((s, i) => (
          <div
            key={s.title}
            className={`fp-hero-slide fp-hero-slide--${s.accent}${i === slide ? " is-active" : ""}`}
            aria-hidden={i !== slide}
          >
            <div className="fp-hero-inner">
              <div className="fp-hero-copy">
                <p className="fp-hero-eyebrow">FocusProLab · Sürekli performans testi</p>
                <h1 className="fp-hero-title">{s.title}</h1>
                <p className="fp-hero-text">{s.text}</p>
                <div className="fp-hero-actions">
                  <Button asLink to={primaryTo} variant="primary" size="sm" className="fp-hero-cta">
                    {primaryLabel}
                  </Button>
                  {!user && (
                    <Button asLink to="/giris" variant="secondary" size="sm">
                      Giriş yap
                    </Button>
                  )}
                </div>
                <p className="fp-hero-trust">
                  <strong>Çok aşamalı çeldirici</strong> · FocusProLab ile güvenle uygulanır
                </p>
              </div>
              <div className="fp-hero-visual" aria-hidden>
                <div className="fp-hero-orb" />
                <div className="fp-hero-card-preview">
                  <span className="fp-hero-card-label">Canlı metrik</span>
                  <span className="fp-hero-card-value">Dikkat · Tepki · Çeldirici</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="fp-hero-controls">
          <button
            type="button"
            className="fp-hero-arrow"
            aria-label="Önceki slayt"
            onClick={() => setSlide((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          >
            ‹
          </button>
          <div className="fp-hero-dots" role="tablist" aria-label="Slayt seçimi">
            {HERO_SLIDES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === slide}
                aria-label={`Slayt ${i + 1}`}
                className={`fp-hero-dot${i === slide ? " is-active" : ""}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
          <button type="button" className="fp-hero-arrow" aria-label="Sonraki slayt" onClick={nextSlide}>
            ›
          </button>
        </div>
      </section>

      <section className="fp-landing-section">
        <div className="fp-landing-container">
          <div className="fp-feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="fp-feature-card">
                <span className="fp-feature-icon" aria-hidden>
                  {f.icon}
                </span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="fp-landing-section fp-landing-section--muted">
        <div className="fp-landing-container">
          <h2 className="fp-section-title">Sayılarla FocusProLab</h2>
          <p className="fp-section-lead">Ölçüm kapasitesi ve raporlama özellikleri tek bakışta.</p>
          <div className="fp-stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="fp-stat-card">
                <p className="fp-stat-value">
                  {s.value}
                  {s.suffix && <span className="fp-stat-suffix">{s.suffix}</span>}
                </p>
                <p className="fp-stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="fp-landing-section">
        <div className="fp-landing-container">
          <h2 className="fp-section-title">Uzmanlardan geri bildirimler</h2>
          <div className="fp-testimonial-grid">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.quote} className="fp-testimonial-card">
                <p>“{t.quote}”</p>
                <footer>{t.role}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="fp-cta-band">
        <div className="fp-landing-container fp-cta-inner">
          <div>
            <h2>Hemen değerlendirmeye başlayın</h2>
            <p>Üye olun, 30 saniyelik deneme ile arayüzü tanıyın veya tam teste geçin.</p>
          </div>
          <Button asLink to={primaryTo} variant="primary">
            {primaryLabel}
          </Button>
        </div>
      </section>

      <footer className="fp-landing-footer">
        <div className="fp-landing-container fp-footer-inner">
          <div>
            <p className="fp-footer-brand">FocusProLab</p>
            <p className="fp-footer-tag">Sürekli performans ve dikkat değerlendirmesi</p>
          </div>
          <nav className="fp-footer-nav" aria-label="Alt menü">
            <Link to="/giris">Giriş</Link>
            <Link to="/kayit">Kayıt</Link>
            {user && <Link to="/panel">Panel</Link>}
            {user && <Link to="/test">Test</Link>}
          </nav>
          <p className="fp-footer-copy">© {new Date().getFullYear()} FocusProLab</p>
        </div>
      </footer>
    </div>
  );
}
