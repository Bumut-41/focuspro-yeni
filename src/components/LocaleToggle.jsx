import { useLocale } from "../i18n/LocaleContext.jsx";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="fp-locale-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={`fp-locale-btn${locale === "tr" ? " is-active" : ""}`}
        onClick={() => setLocale("tr")}
        aria-pressed={locale === "tr"}
      >
        TR
      </button>
      <button
        type="button"
        className={`fp-locale-btn${locale === "en" ? " is-active" : ""}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
