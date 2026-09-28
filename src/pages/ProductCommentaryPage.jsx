import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button } from "../components/ui.jsx";

export default function ProductCommentaryPage() {
  const { strings } = useLocale();
  const page = strings.home.marketing.productPages.commentary;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fp-mkt fp-detail">
      <div className="fp-mkt-container fp-detail-wrap">
        <Link to="/" className="fp-detail-back">
          ← {page.back}
        </Link>
        <p className="fp-detail-kicker">💬 {page.title}</p>
        <h1>{page.lead}</h1>
        <p className="fp-detail-copy">{page.intro}</p>

        <section className="fp-detail-block">
          <h2>{page.includesTitle}</h2>
          <ul className="fp-detail-checks">
            {page.includes.map((item) => (
              <li key={item}>
                <span aria-hidden>✔️</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="fp-detail-note">{page.note}</p>

        <section className="fp-detail-block">
          <h2>{page.deliveryTitle}</h2>
          <p className="fp-detail-copy">📧 {page.delivery}</p>
        </section>

        <Button type="button" size="lg" className="fp-mkt-btn-teal fp-detail-cta" disabled>
          ▶️ {page.cta}
        </Button>
      </div>
    </div>
  );
}
