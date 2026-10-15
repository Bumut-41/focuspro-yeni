import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";

export default function MetricDetailPage() {
  const { slug } = useParams();
  const { strings } = useLocale();
  const pages = strings.home.marketing.metricPages;
  const page = pages.items[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="fp-mkt fp-detail">
      <div className="fp-mkt-container fp-detail-wrap">
        <Link to="/" className="fp-detail-back">
          ← {pages.back}
        </Link>
        <img src={`/metric-${page.color}.png`} alt="" className="fp-detail-metric-photo" />
        <div className={`fp-mkt-metric--${page.color}`}>
          <span className="fp-mkt-metric-code">{page.code}</span>
        </div>
        <h1>
          {page.title} {page.en ? <span className="fp-detail-en">({page.en})</span> : null}
        </h1>
        {page.summary ? <p className="fp-detail-summary">{page.summary}</p> : null}
        {(page.paragraphs || []).map((paragraph) => (
          <p key={paragraph} className="fp-detail-copy">
            {paragraph}
          </p>
        ))}
        {page.indicators ? (
          <section className="fp-detail-block">
            <h2>{pages.indicatorsTitle}</h2>
            <div className="fp-detail-indicators">
              {page.indicators.map((item) => (
                <article key={item.title} className="fp-detail-indicator">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <>
            {page.desc ? <p className="fp-detail-copy">{page.desc}</p> : null}
            {page.points ? (
              <ul className="fp-detail-checks">
                {page.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
