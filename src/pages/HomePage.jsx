import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { BrandLogo } from "../components/BrandLogo.jsx";
import { HomeHeroVisual } from "../components/home/HomeHeroVisual.jsx";
import { Button } from "../components/ui.jsx";

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`fp-mkt-faq-item${open ? " is-open" : ""}`}>
      <button type="button" className="fp-mkt-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className="fp-mkt-faq-icon" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <p className="fp-mkt-faq-a">{a}</p>}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { strings, t } = useLocale();
  const m = strings.home.marketing;
  const [faqOpen, setFaqOpen] = useState(0);

  const testTo = user ? "/test" : "/kayit";
  const panelTo = user ? "/panel" : "/giris";

  return (
    <div className="fp-mkt">
      <section className="fp-mkt-hero" id="top">
        <div className="fp-mkt-container fp-mkt-hero-grid">
          <div className="fp-mkt-hero-copy">
            <h1 className="fp-mkt-hero-title">{m.hero.title}</h1>
            <p className="fp-mkt-hero-sub">{m.hero.subtitle}</p>
            <div className="fp-mkt-age-pills">
              {m.hero.ages.map((a) => (
                <span key={a.label} className="fp-mkt-age-pill">
                  <span aria-hidden>{a.icon}</span> {a.label}
                </span>
              ))}
            </div>
            <div className="fp-mkt-hero-ctas">
              <Button asLink to={testTo} variant="primary" size="lg" className="fp-mkt-btn-teal">
                {m.hero.ctaTest}
              </Button>
              <Button asLink to={panelTo} variant="secondary" size="lg" className="fp-mkt-btn-outline">
                {m.hero.ctaExpert}
              </Button>
            </div>
            <div className="fp-mkt-badges">
              {m.hero.badges.map((b) => (
                <span key={b.label} className="fp-mkt-badge">
                  <span aria-hidden>{b.icon}</span> {b.label}
                </span>
              ))}
            </div>
          </div>
          <HomeHeroVisual hero={m.hero} />
        </div>
      </section>

      <div className="fp-mkt-container fp-mkt-body">
        <div className="fp-mkt-main">
          <section className="fp-mkt-section" id="nedir">
            <h2 className="fp-mkt-section-title">{m.metrics.title}</h2>
            <p className="fp-mkt-section-lead">{m.sections.about}</p>
            <div className="fp-mkt-metrics">
              {m.metrics.items.map((item) => (
                <article key={item.code} className={`fp-mkt-metric fp-mkt-metric--${item.color}`}>
                  <span className="fp-mkt-metric-code">{item.code}</span>
                  <h3>{item.label}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="fp-mkt-section" id="kimler">
            <h2 className="fp-mkt-section-title">{m.audience.title}</h2>
            <div className="fp-mkt-audience">
              {m.audience.cards.map((card) => (
                <article key={card.key} className={`fp-mkt-audience-card fp-mkt-audience-card--${card.theme}`}>
                  <span className="fp-mkt-audience-icon" aria-hidden>
                    {card.icon}
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <Button
                    asLink
                    to={card.key === "pro" && user ? "/panel" : card.to}
                    variant="primary"
                    size="sm"
                    className="fp-mkt-audience-cta"
                  >
                    {card.cta}
                  </Button>
                </article>
              ))}
            </div>
          </section>

          <section className="fp-mkt-section">
            <h2 className="fp-mkt-section-title">{m.products.title}</h2>
            <div className="fp-mkt-products">
              {m.products.items.map((p) => (
                <article key={p.title} className="fp-mkt-product">
                  <span className="fp-mkt-product-icon" aria-hidden>
                    {p.icon}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <button type="button" className="fp-mkt-product-link">
                    {m.products.cta}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="fp-mkt-section" id="uzmanlar">
            <h2 className="fp-mkt-section-title">{m.professionals.title}</h2>
            <div className="fp-mkt-pro-grid">
              {m.professionals.items.map((label) => (
                <div key={label} className="fp-mkt-pro-item">
                  <span className="fp-mkt-pro-dot" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
            <div className="fp-mkt-pro-cta-wrap">
              <Button asLink to="/kayit" variant="primary" className="fp-mkt-btn-navy">
                {m.professionals.cta}
              </Button>
            </div>
          </section>

          <section className="fp-mkt-section fp-mkt-section--muted" id="merkezler">
            <h2 className="fp-mkt-section-title">{m.nav.centers}</h2>
            <p className="fp-mkt-section-lead">{m.sections.centers}</p>
          </section>

          <section className="fp-mkt-section" id="iletisim">
            <h2 className="fp-mkt-section-title">{m.nav.contact}</h2>
            <p className="fp-mkt-section-lead">{m.sections.contactLead}</p>
            <div className="fp-mkt-contact-cards">
              <a href={`mailto:${m.footer.email}`} className="fp-mkt-contact-card">
                ✉️ {m.footer.email}
              </a>
              <a href={`tel:${m.footer.phone.replace(/\s/g, "")}`} className="fp-mkt-contact-card">
                📞 {m.footer.phone}
              </a>
              <span className="fp-mkt-contact-card">📍 {m.footer.address}</span>
            </div>
          </section>
        </div>

        <aside className="fp-mkt-aside">
          <div className="fp-mkt-aside-card">
            <h2 className="fp-mkt-aside-title">{m.afterTest.title}</h2>
            <ol className="fp-mkt-timeline">
              {m.afterTest.steps.map((step, i) => (
                <li key={step}>
                  <span className="fp-mkt-timeline-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <Button asLink to={testTo} variant="primary" className="fp-mkt-btn-teal fp-mkt-btn-block">
              {m.afterTest.cta}
            </Button>
          </div>

          <div className="fp-mkt-aside-card" id="sss">
            <h2 className="fp-mkt-aside-title">{m.faq.title}</h2>
            <div className="fp-mkt-faq">
              {m.faq.items.map((item, i) => (
                <FaqItem
                  key={item.q}
                  q={item.q}
                  a={item.a}
                  open={faqOpen === i}
                  onToggle={() => setFaqOpen(faqOpen === i ? -1 : i)}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="fp-mkt-footer">
        <div className="fp-mkt-container fp-mkt-footer-grid">
          <div>
            <BrandLogo variant="footer" />
            <p className="fp-mkt-footer-tag">{m.footer.tag}</p>
          </div>
          <div>
            <h3>{m.footer.quickLinks}</h3>
            <nav className="fp-mkt-footer-nav">
              {m.footer.quickNav.map((l) => (
                <Link key={l.label} to={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h3>{m.footer.legal}</h3>
            <ul className="fp-mkt-footer-list">
              {m.footer.legalLinks.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{m.footer.contactTitle}</h3>
            <ul className="fp-mkt-footer-list">
              <li>{m.footer.phone}</li>
              <li>
                <a href={`mailto:${m.footer.email}`}>{m.footer.email}</a>
              </li>
              <li>{m.footer.address}</li>
            </ul>
            <p className="fp-mkt-footer-follow">{m.footer.follow}</p>
            <div className="fp-mkt-social">
              <span aria-hidden>📷</span>
              <span aria-hidden>in</span>
              <span aria-hidden>▶</span>
            </div>
          </div>
        </div>
        <p className="fp-mkt-footer-copy">{t("home.marketing.footer.copyright", { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}
