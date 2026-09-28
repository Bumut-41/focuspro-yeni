import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button } from "../components/ui.jsx";

export default function ProductConsultationPage() {
  const { strings } = useLocale();
  const page = strings.home.marketing.productPages.consultation;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fp-mkt fp-detail">
      <div className="fp-mkt-container fp-detail-wrap">
        <Link to="/" className="fp-detail-back">
          ← {page.back}
        </Link>
        <p className="fp-detail-kicker">🎥 {page.title}</p>
        <h1>{page.lead}</h1>
        <p className="fp-detail-copy">{page.intro}</p>

        <section className="fp-detail-block">
          <h2>{page.sessionTitle}</h2>
          <div className="fp-detail-services">
            {page.session.map((item) => (
              <article key={item.title}>
                <span aria-hidden>{item.icon}</span>
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <div className="fp-detail-facts">
          <article>
            <h2>{page.durationTitle}</h2>
            <p>{page.duration}</p>
          </article>
          <article>
            <h2>{page.formatTitle}</h2>
            <p>{page.format}</p>
          </article>
        </div>

        <section className="fp-detail-block">
          <h2>{page.outcomeTitle}</h2>
          <ul className="fp-detail-checks">
            {page.outcomes.map((item) => (
              <li key={item}>
                <span aria-hidden>✔️</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <Button type="button" size="lg" className="fp-mkt-btn-teal fp-detail-cta" disabled>
          ▶️ {page.cta}
        </Button>
      </div>
    </div>
  );
}
