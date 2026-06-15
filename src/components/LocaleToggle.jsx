import { useLocale } from "../i18n/LocaleContext.jsx";

function FlagTr({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#E30A17" rx="1" />
      <circle cx="9.2" cy="8" r="3.2" fill="#fff" />
      <circle cx="10.1" cy="8" r="2.6" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="13.8,8 15.9,8.65 14.85,6.55 14.85,9.45 15.9,7.35"
      />
    </svg>
  );
}

function FlagGb({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 16" aria-hidden="true">
      <rect width="24" height="16" fill="#012169" rx="1" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#fff" strokeWidth="2.4" />
      <path d="M0 0l24 16M24 0L0 16" stroke="#C8102E" strokeWidth="1.2" />
      <path d="M12 0v16M0 8h24" stroke="#fff" strokeWidth="4" />
      <path d="M12 0v16M0 8h24" stroke="#C8102E" strokeWidth="2.2" />
    </svg>
  );
}

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="fp-locale-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={`fp-locale-btn${locale === "tr" ? " is-active" : ""}`}
        onClick={() => setLocale("tr")}
        aria-pressed={locale === "tr"}
        aria-label="Türkçe"
        title="Türkçe"
      >
        <FlagTr className="fp-locale-flag" />
      </button>
      <button
        type="button"
        className={`fp-locale-btn${locale === "en" ? " is-active" : ""}`}
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        aria-label="English"
        title="English"
      >
        <FlagGb className="fp-locale-flag" />
      </button>
    </div>
  );
}
