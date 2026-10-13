import { useLocale } from "../i18n/LocaleContext.jsx";
import { ShapeView } from "../shapeUtils.jsx";
import { FIXED_TARGET_COLOR } from "../constants.js";

export function TestParticipantGuide({ onStartPractice, targetShape = "triangle" }) {
  const { t, strings } = useLocale();
  const g = strings.test.participantGuide;

  return (
    <div className="test-participant-guide">
      <p className="test-guide-kicker">{t("test.stepGuide")}</p>
      <p className="test-participant-lead" style={{ marginBottom: 4, fontWeight: 700, color: "var(--fp-text)" }}>
        {g.brand}
      </p>
      <h2 className="test-participant-guide-title">{g.title}</h2>
      <p className="test-participant-lead">{g.intro}</p>
      <p className="test-participant-lead">{g.purpose}</p>
      <h3 className="test-participant-h3">{g.directive}</h3>
      <p className="test-participant-lead">{g.shapes}</p>
      <ul className="test-participant-flow">
        {g.rules.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="test-participant-lead">{g.duration}</p>
      <p className="test-participant-lead">{g.notScored}</p>
      <p className="test-participant-lead">{g.ready}</p>
      <p className="test-participant-lead">{g.note}</p>
      <div className="test-participant-hero" style={{ marginTop: 16 }}>
        <ShapeView shape={targetShape} color={FIXED_TARGET_COLOR} size={56} />
        <div>
          <h3 style={{ fontSize: "1rem" }}>{g.ruleTitle}</h3>
          <p>{g.rule}</p>
        </div>
      </div>
      <div className="test-participant-actions">
        <button type="button" className="test-participant-btn test-participant-btn--primary" onClick={onStartPractice}>
          {g.startPractice}
        </button>
      </div>
    </div>
  );
}
