/** CSS-only hero device mockup (laptop + tablet). */
export function HomeHeroVisual({ hero }) {
  return (
    <div className="fp-mkt-hero-visual" aria-hidden>
      <div className="fp-mkt-laptop">
        <div className="fp-mkt-laptop-screen">
          <p className="fp-mkt-mock-title">{hero.mockProfile}</p>
          <div className="fp-mkt-radar">
            <div className="fp-mkt-radar-ring fp-mkt-radar-ring--1" />
            <div className="fp-mkt-radar-ring fp-mkt-radar-ring--2" />
            <div className="fp-mkt-radar-ring fp-mkt-radar-ring--3" />
            <div className="fp-mkt-radar-shape fp-mkt-radar-shape--a" />
            <div className="fp-mkt-radar-shape fp-mkt-radar-shape--t" />
            <div className="fp-mkt-radar-shape fp-mkt-radar-shape--i" />
            <div className="fp-mkt-radar-shape fp-mkt-radar-shape--h" />
          </div>
          <div className="fp-mkt-bars">
            <span style={{ width: "88%", background: "#2563eb" }} />
            <span style={{ width: "76%", background: "#0d9488" }} />
            <span style={{ width: "62%", background: "#ea580c" }} />
            <span style={{ width: "94%", background: "#7c3aed" }} />
          </div>
        </div>
        <div className="fp-mkt-laptop-base" />
      </div>
      <div className="fp-mkt-tablet">
        <p className="fp-mkt-mock-title">{hero.mockReport}</p>
        <p className="fp-mkt-mock-score">{hero.mockScore}</p>
        <div className="fp-mkt-mini-bars">
          <span style={{ height: "70%", background: "#2563eb" }} />
          <span style={{ height: "55%", background: "#0d9488" }} />
          <span style={{ height: "40%", background: "#ea580c" }} />
          <span style={{ height: "85%", background: "#7c3aed" }} />
        </div>
        <p className="fp-mkt-mock-caption">{hero.mockCaption}</p>
      </div>
    </div>
  );
}
