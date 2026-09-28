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
        <div className={`fp-mkt-metric--${page.color}`}>
          <span className="fp-mkt-metric-code">{page.code}</span>
        </div>
        <h1>{page.title}</h1>
        <p className="fp-detail-lead">{page.en}</p>
        <p className="fp-detail-copy">{page.desc}</p>
        <ul className="fp-detail-checks">
          {page.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
