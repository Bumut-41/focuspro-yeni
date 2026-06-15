import { formatTestMs } from "../lib/testTime.js";
import { useLocale } from "../i18n/LocaleContext.jsx";

/** Deneme / kalibrasyon için test süresi göstergesi */
export function TestDevTimer({ elapsedMs, durationMs }) {
  const { t } = useLocale();

  return (
    <div className="test-dev-timer" aria-live="polite">
      <span className="test-dev-timer-label">{t("test.devTimer")}</span>
      <span className="test-dev-timer-value">
        {formatTestMs(elapsedMs)} / {formatTestMs(durationMs)}
      </span>
    </div>
  );
}
