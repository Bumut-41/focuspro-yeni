import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";

export default function ProductTestPage() {
  const { strings } = useLocale();
  const page = strings.home.marketing.productPages.test;

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
        {page.intro.map((paragraph) => (
          <p key={paragraph} className="fp-detail-copy">
            {paragraph}
          </p>
        ))}

        <section className="fp-detail-block">
          <h2>{page.areasTitle}</h2>
          <div className="fp-detail-areas">
            {page.areas.map((area) => (
              <article key={area.code} className={`fp-detail-area fp-detail-area--${area.color}`}>
                <div className="fp-detail-area-head">
                  <span className="fp-detail-code">{area.code}</span>
                  <h3>{area.label}</h3>
                  <p>{area.en}</p>
                </div>
                <ul>
                  {area.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="fp-detail-block">
          <h2>{page.processTitle}</h2>
          <ul className="fp-detail-process">
            {page.process.map((item, index) => (
              <li key={item}>
                <span aria-hidden>{page.processIcons[index]}</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="fp-detail-block">
          <h2>{page.afterTitle}</h2>
          <p className="fp-detail-copy">{page.afterLead}</p>
          <p className="fp-detail-copy">{page.afterHint}</p>
          <div className="fp-detail-services">
            {page.services.map((service) => (
              <article key={service.title}>
                <span aria-hidden>{service.icon}</span>
                <h3>{service.title}</h3>
              </article>
            ))}
          </div>
          <p className="fp-detail-copy">{page.afterNote}</p>
        </section>

        <section className="fp-detail-block">
          <h2>{page.approachTitle}</h2>
          {page.approach.map((paragraph) => (
            <p key={paragraph} className="fp-detail-copy">
              {paragraph}
            </p>
          ))}
        </section>

        <section className="fp-detail-notice">
          <h2>{page.noticeTitle}</h2>
          {page.notice.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      </div>
    </div>
  );
}
