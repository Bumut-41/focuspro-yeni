import { Button } from "./ui.jsx";

function Rows({ rows }) {
  return (
    <dl className="fp-checkout-rows">
      {rows.map((row) => (
        <div key={row.label} className={row.strong ? "is-total" : undefined}>
          <dt>{row.label}</dt>
          <dd>{row.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CheckoutScreen({ t, lines, buyer, total, onBack }) {
  return (
    <div className="fp-checkout">
      <button type="button" className="fp-back-link fp-checkout-back" onClick={onBack}>
        {t("purchase.edit")}
      </button>
      <h1 className="fp-card-title">{t("purchase.payTitle")}</h1>
      <p className="fp-card-desc">{t("purchase.payLead")}</p>

      <div className="fp-checkout-grid">
        <section className="fp-checkout-card">
          <h2>{t("purchase.orderTitle")}</h2>
          <Rows rows={lines} />
          <h2>{t("purchase.invoiceTitle")}</h2>
          <Rows rows={buyer} />
        </section>

        <section className="fp-checkout-pay">
          <div className="fp-checkout-lock" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="28" height="28">
              <path
                fill="currentColor"
                d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9z"
              />
            </svg>
          </div>
          <h2>{t("purchase.secureTitle")}</h2>
          <p className="fp-checkout-amount">{total}</p>
          <p className="fp-checkout-note">{t("purchase.payNote")}</p>
          <Button type="button" variant="primary" disabled>
            {t("purchase.payButton")}
          </Button>
        </section>
      </div>
    </div>
  );
}
