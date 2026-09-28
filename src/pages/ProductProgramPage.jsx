import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button } from "../components/ui.jsx";

export default function ProductProgramPage() {
  const { strings } = useLocale();
  const page = strings.home.marketing.productPages.program;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fp-mkt fp-detail">
      <div className="fp-mkt-container fp-detail-wrap">
        <Link to="/" className="fp-detail-back">
          ← {page.back}
        </Link>
        <h1>{page.title}</h1>
        <p className="fp-detail-lead">{page.lead}</p>
        {page.notes.map((note) => (
          <p key={note} className="fp-detail-copy">
            {note}
          </p>
        ))}

        <section className="fp-detail-block">
          <h2>{page.contentsTitle}</h2>
          <ul className="fp-detail-checks">
            {page.contents.map((item) => (
              <li key={item}>
                <span aria-hidden>✅</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="fp-detail-block">
          <h2>{page.goalTitle}</h2>
          <p className="fp-detail-copy">{page.goal}</p>
        </section>

        <div className="fp-detail-facts">
          <article>
            <h2>{page.durationTitle}</h2>
            <p>{page.duration}</p>
          </article>
          <article>
            <h2>{page.dailyTitle}</h2>
            <p>{page.daily}</p>
          </article>
        </div>

        <Button asLink to="/urun/gelisim-programi/deneme" variant="primary" size="lg" className="fp-mkt-btn-teal fp-detail-cta">
          ▶️ {page.cta}
        </Button>
      </div>
    </div>
  );
}
