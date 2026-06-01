import { formatTestMs } from "../lib/testTime.js";

/** Deneme / kalibrasyon için test süresi göstergesi */
export function TestDevTimer({ elapsedMs, durationMs }) {
  return (
    <div className="test-dev-timer" aria-live="polite">
      <span className="test-dev-timer-label">Deneme sayacı</span>
      <span className="test-dev-timer-value">
        {formatTestMs(elapsedMs)} / {formatTestMs(durationMs)}
      </span>
    </div>
  );
}
