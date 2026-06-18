import { useState } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { ShapeView } from "../shapeUtils.jsx";
import { FIXED_TARGET_COLOR } from "../constants.js";

export function TestParticipantGuide({ onStartPractice, targetShape = "triangle" }) {
  const { t, strings } = useLocale();
  const g = strings.test.participantGuide;
  const pages = ["usage", "scenarios", "criteria"];
  const [page, setPage] = useState(0);
  const key = pages[page];
  const isLast = page === pages.length - 1;

  return (
    <div className="test-participant-guide">
      <p className="test-guide-kicker">{t("test.stepGuide")}</p>
      <h2 className="test-participant-guide-title">{g.title}</h2>
      <p className="test-participant-guide-step">
        {t("test.participantGuide.stepOf", { current: page + 1, total: pages.length })}
      </p>

      <div className="test-participant-tabs" role="tablist" aria-label={g.title}>
        {pages.map((p, i) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={i === page}
            className={`test-participant-tab${i === page ? " is-active" : ""}${i < page ? " is-done" : ""}`}
            onClick={() => setPage(i)}
          >
            {g.tabs[p]}
          </button>
        ))}
      </div>

      <div className="test-participant-panel" role="tabpanel">
        {key === "usage" && (
          <>
            <h3 className="test-participant-h3">{g.usage.title}</h3>
            <p className="test-participant-lead">{g.usage.lead}</p>
            <ol className="test-participant-flow">
              {g.usage.steps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <div className="test-participant-hero" style={{ marginTop: 16 }}>
              <ShapeView shape={targetShape} color={FIXED_TARGET_COLOR} size={56} />
              <div>
                <h3 style={{ fontSize: "1rem" }}>{g.usage.ruleTitle}</h3>
                <p>{g.usage.rule}</p>
              </div>
            </div>
          </>
        )}

        {key === "scenarios" && (
          <>
            <h3 className="test-participant-h3">{g.scenarios.title}</h3>
            <p className="test-participant-lead">{g.scenarios.lead}</p>
            <div className="test-participant-scenarios">
              {g.scenarios.items.map((item) => (
                <article key={item.title} className="test-participant-scenario-card">
                  <h4>{item.title}</h4>
                  <p className="test-participant-scenario-what">
                    <strong>{g.scenarios.happensLabel}</strong> {item.happens}
                  </p>
                  <p className="test-participant-scenario-do">
                    <strong>{g.scenarios.actionLabel}</strong> {item.action}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}

        {key === "criteria" && (
          <>
            <h3 className="test-participant-h3">{g.criteria.title}</h3>
            <p className="test-participant-lead">{g.criteria.lead}</p>
            <div className="test-participant-metrics">
              {g.criteria.items.map((item) => (
                <article key={item.code} className={`test-participant-metric test-participant-metric--${item.code.toLowerCase()}`}>
                  <span className="test-participant-metric-code">{item.code}</span>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <p className="test-participant-metric-how">
                      <strong>{g.criteria.measuresLabel}</strong> {item.measures}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            <p className="test-participant-privacy">{g.criteria.privacy}</p>
          </>
        )}
      </div>

      <div className="test-participant-actions">
        {page > 0 && (
          <button type="button" className="test-participant-btn test-participant-btn--ghost" onClick={() => setPage((p) => p - 1)}>
            {g.back}
          </button>
        )}
        {!isLast ? (
          <button type="button" className="test-participant-btn test-participant-btn--primary" onClick={() => setPage((p) => p + 1)}>
            {g.next}
          </button>
        ) : (
          <button type="button" className="test-participant-btn test-participant-btn--primary" onClick={onStartPractice}>
            {g.startPractice}
          </button>
        )}
      </div>
    </div>
  );
}
