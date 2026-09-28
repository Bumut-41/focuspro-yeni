import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button } from "../components/ui.jsx";

export default function ProductReportPage() {
  const { user } = useAuth();
  const { strings } = useLocale();
  const page = strings.home.marketing.productPages.report;
  const testTo = user ? "/test" : "/kayit";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fp-mkt fp-detail">
      <div className="fp-mkt-container fp-detail-wrap">
        <Link to="/" className="fp-detail-back">
          ← {page.back}
        </Link>
        <p className="fp-detail-kicker">📊 {page.kicker}</p>
        <h1>{page.title}</h1>
        <p className="fp-detail-lead">{page.lead}</p>

        <section className="fp-detail-block">
          <h2>{page.contentsTitle}</h2>
          <div className="fp-detail-services">
            {page.contents.map((item) => (
              <article key={item.title}>
                <span aria-hidden>{item.icon}</span>
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="fp-detail-block">
          <h2>{page.deliveryTitle}</h2>
          <p className="fp-detail-copy">📧 {page.delivery}</p>
        </section>

        <section className="fp-detail-block">
          <h2>{page.audienceTitle}</h2>
          <ul className="fp-detail-audience">
            {page.audience.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <Button asLink to={testTo} variant="primary" size="lg" className="fp-mkt-btn-teal fp-detail-cta">
          ▶️ {page.cta}
        </Button>
      </div>
    </div>
  );
}
