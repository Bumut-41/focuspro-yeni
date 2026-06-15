import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button } from "../components/ui.jsx";

export default function HomePage() {
  const { user } = useAuth();
  const { strings, t } = useLocale();
  const home = strings.home;
  const [slide, setSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setSlide((i) => (i + 1) % home.heroSlides.length);
  }, [home.heroSlides.length]);

  useEffect(() => {
    const id = setInterval(nextSlide, 6000);
    return () => clearInterval(id);
  }, [nextSlide]);

  const primaryTo = user ? "/panel" : "/kayit";
  const primaryLabel = user ? t("home.goToPanel") : t("home.freeRegister");

  return (
    <div className="fp-landing">
      <section className="fp-hero" aria-label="Intro">
        {home.heroSlides.map((s, i) => (
          <div
            key={s.title}
            className={`fp-hero-slide fp-hero-slide--hero-${String.fromCharCode(97 + (i % 5))}${i === slide ? " is-active" : ""}`}
            aria-hidden={i !== slide}
          >
            <div className="fp-hero-inner">
              <div className="fp-hero-copy">
                <p className="fp-hero-eyebrow">{t("home.eyebrow")}</p>
                <h1 className="fp-hero-title">{s.title}</h1>
                <p className="fp-hero-text">{s.text}</p>
                <div className="fp-hero-actions">
                  <Button asLink to={primaryTo} variant="primary" size="sm" className="fp-hero-cta">
                    {primaryLabel}
                  </Button>
                  {!user && (
                    <Button asLink to="/giris" variant="secondary" size="sm">
                      {t("home.loginBtn")}
                    </Button>
                  )}
                </div>
                <p className="fp-hero-trust">{t("home.trust")}</p>
              </div>
              <div className="fp-hero-visual" aria-hidden>
                <div className="fp-hero-orb" />
                <div className="fp-hero-card-preview">
                  <span className="fp-hero-card-label">{t("home.liveMetric")}</span>
                  <span className="fp-hero-card-value">{t("home.liveMetricValue")}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="fp-hero-controls">
          <button
            type="button"
            className="fp-hero-arrow"
            aria-label={t("home.prevSlide")}
            onClick={() => setSlide((i) => (i - 1 + home.heroSlides.length) % home.heroSlides.length)}
          >
            ‹
          </button>
          <div className="fp-hero-dots" role="tablist" aria-label={t("home.slideSelect")}>
            {home.heroSlides.map((s, i) => (
              <button
                key={s.title}
                type="button"
                role="tab"
                aria-selected={i === slide}
                aria-label={t("home.slideN", { n: i + 1 })}
                className={`fp-hero-dot${i === slide ? " is-active" : ""}`}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
          <button type="button" className="fp-hero-arrow" aria-label={t("home.nextSlide")} onClick={nextSlide}>
            ›
          </button>
        </div>
      </section>

      <section className="fp-landing-section">
        <div className="fp-landing-container">
          <div className="fp-feature-grid">
            {home.features.map((f) => (
              <article key={f.title} className="fp-feature-card">
                <span className="fp-feature-icon" aria-hidden>
                  {["👧", "🧑", "📊", "⚡"][home.features.indexOf(f)]}
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
          <h2 className="fp-section-title">{t("home.statsTitle")}</h2>
          <p className="fp-section-lead">{t("home.statsLead")}</p>
          <div className="fp-stats-grid">
            {home.stats.map((s) => (
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
          <h2 className="fp-section-title">{t("home.testimonialsTitle")}</h2>
          <div className="fp-testimonial-grid">
            {home.testimonials.map((item) => (
              <blockquote key={item.quote} className="fp-testimonial-card">
                <p>“{item.quote}”</p>
                <footer>{item.role}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="fp-cta-band">
        <div className="fp-landing-container fp-cta-inner">
          <div>
            <h2>{t("home.ctaTitle")}</h2>
            <p>{t("home.ctaSub")}</p>
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
            <p className="fp-footer-tag">{t("home.footerTag")}</p>
          </div>
          <nav className="fp-footer-nav" aria-label="Footer">
            <Link to="/giris">{t("nav.login")}</Link>
            <Link to="/kayit">{t("nav.register")}</Link>
            {user && <Link to="/panel">{t("nav.panel")}</Link>}
            {user && <Link to="/test">{t("nav.test")}</Link>}
          </nav>
          <p className="fp-footer-copy">© {new Date().getFullYear()} FocusProLab</p>
        </div>
      </footer>
    </div>
  );
}
