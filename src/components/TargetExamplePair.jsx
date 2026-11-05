import { ShapeView } from "../shapeUtils.jsx";
import { FIXED_TARGET_COLOR } from "../constants.js";

/** Alıştırma / yönerge: yukarı dolu mavi üçgen (BAS) vs aşağı bakan mavi üçgen (BASMA). */
export function TargetExamplePair({ title, pressLabel, dontPressLabel, pressCaption, dontCaption }) {
  return (
    <div className="test-shape-examples" aria-label={title}>
      {title ? <p className="test-shape-examples-title">{title}</p> : null}
      <div className="test-shape-examples-grid">
        <div className="test-shape-example test-shape-example--do">
          <ShapeView shape="triangle" color={FIXED_TARGET_COLOR} size={72} />
          <p className="test-shape-example-badge test-shape-example-badge--do">✓ {pressLabel}</p>
          <p className="test-shape-example-caption">{pressCaption}</p>
        </div>
        <div className="test-shape-example test-shape-example--dont">
          <ShapeView shape="triangle_down" color={FIXED_TARGET_COLOR} size={72} />
          <p className="test-shape-example-badge test-shape-example-badge--dont">✕ {dontPressLabel}</p>
          <p className="test-shape-example-caption">{dontCaption}</p>
        </div>
      </div>
    </div>
  );
}
