import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CENTERS } from "../data/centers.js";
import { useLocale } from "../i18n/LocaleContext.jsx";

const TILE = 256;
const ZOOM = 16;

function project(lat, lng) {
  const n = 2 ** ZOOM;
  const x = ((lng + 180) / 360) * n;
  const s = Math.sin((lat * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
  return { x, y };
}

function CenterMap({ center, label }) {
  const { x, y } = project(center.lat, center.lng);
  const tileX = Math.floor(x);
  const tileY = Math.floor(y);
  const originX = tileX - 1;
  const originY = tileY - 1;
  const pinLeft = (x - originX) * TILE;
  const pinTop = (y - originY) * TILE;
  const tiles = [];
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      tiles.push({ col, row, tx: originX + col, ty: originY + row });
    }
  }
  const placeHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name}, ${center.address}`)}`;

  return (
    <a className="fp-center-map" href={placeHref} target="_blank" rel="noreferrer" aria-label={label}>
      <div className="fp-center-tiles" style={{ left: `calc(50% - ${pinLeft}px)`, top: `calc(50% - ${pinTop}px)` }}>
        {tiles.map((tile) => (
          <img
            key={`${tile.tx}-${tile.ty}`}
            alt=""
            width={TILE}
            height={TILE}
            src={`https://tile.openstreetmap.org/${ZOOM}/${tile.tx}/${tile.ty}.png`}
            style={{ left: tile.col * TILE, top: tile.row * TILE }}
          />
        ))}
        <span className="fp-center-pin" style={{ left: pinLeft, top: pinTop }} />
      </div>
    </a>
  );
}

function directionsHref(center) {
  return `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`;
}

export default function CentersPage() {
  const { strings, t } = useLocale();
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
                  {center.opensAt ? (
                    <div>
                      <dt>{page.hours}</dt>
                      <dd>{t("home.marketing.centersPage.opensAt", { time: center.opensAt })}</dd>
                    </div>
                  ) : null}
                </dl>
                <a className="fp-center-directions" href={directionsHref(center)} target="_blank" rel="noreferrer">
                  {page.directions}
                </a>
              </div>
              <CenterMap center={center} label={`${page.openMap}: ${center.name}`} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
