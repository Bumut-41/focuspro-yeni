import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CENTERS } from "../data/centers.js";
import { useLocale } from "../i18n/LocaleContext.jsx";

function mapTarget(center) {
  return `${encodeURIComponent(center.name)}@${center.lat},${center.lng}`;
}

function CenterMap({ center, label, openLabel, locale }) {
  const target = mapTarget(center);
  const placeHref = `https://www.google.com/maps?q=${target}&z=16`;
  const embedSrc = `https://maps.google.com/maps?q=${target}&z=16&hl=${locale}&output=embed`;

  return (
    <div className="fp-center-map">
      <iframe title={label} src={embedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <a className="fp-center-map-hit" href={placeHref} target="_blank" rel="noreferrer" aria-label={label}>
        <span className="fp-center-map-chip">{openLabel}</span>
      </a>
    </div>
  );
}

function directionsHref(center) {
  return `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
}

export default function CentersPage() {
  const { strings, locale } = useLocale();
  const page = strings.home.marketing.centersPage;

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

        <div className="fp-center-list">
          {CENTERS.map((center) => (
            <article key={center.id} className="fp-center-card">
              <div className="fp-center-info">
                <h2>{center.name}</h2>
                {center.subtitle ? <p className="fp-center-sub">{center.subtitle}</p> : null}
                <dl className="fp-center-facts">
                  <div>
                    <dt>{page.address}</dt>
                    <dd>{center.address}</dd>
                  </div>
                  <div>
                    <dt>{page.phone}</dt>
                    <dd>
                      <a href={center.phoneHref}>{center.phone}</a>
                    </dd>
                  </div>
                </dl>
                <a className="fp-center-directions" href={directionsHref(center)} target="_blank" rel="noreferrer">
                  {page.directions}
                </a>
              </div>
              <CenterMap
                center={center}
                locale={locale}
                openLabel={page.openMap}
                label={`${page.openMap}: ${center.name}`}
              />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
