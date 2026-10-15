import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  INDIVIDUAL_TEST_LIMIT,
  INDIVIDUAL_TEST_PRICE_TL,
  fetchIndividualPurchaseQuota,
  formatTl
} from "../services/purchases.js";
import { Alert, Button, Card, Field, Input, Page } from "../components/ui.jsx";
import { CheckoutScreen } from "../components/CheckoutScreen.jsx";

const EMPTY = {
  invoiceType: "individual",
  invoiceName: "",
  taxId: "",
  taxOffice: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  address: ""
};

function purchaseError(err, t) {
  const code = err?.message ?? "";
  if (code.includes("purchase_limit")) return t("purchase.errLimit");
  if (code.includes("individual_only")) return t("purchase.errIndividual");
  if (code.includes("invalid_tax_id")) return t("purchase.errTaxId");
  if (code.includes("invalid_invoice")) return t("purchase.errInvoice");
  if (code.includes("Could not find the function") || code.includes("schema cache")) return t("purchase.errSetup");
  return err?.message || t("common.error");
}

export default function BuyTestPage() {
  const { profile, user, credits } = useAuth();
  const { t, locale } = useLocale();
  const [quota, setQuota] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!profile || profile.role !== "individual") return;
    let cancelled = false;
    setForm((current) => ({
      ...current,
      invoiceName: current.invoiceName || profile.full_name || "",
      email: current.email || user?.email || ""
    }));
    fetchIndividualPurchaseQuota()
      .then((data) => {
        if (cancelled) return;
        setQuota(data);
        setReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(purchaseError(err, t));
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, user?.email, t]);

  if (!profile) {
    return <p className="fp-loading">{t("common.loading")}</p>;
  }

  if (profile.role !== "individual") {
    return <Navigate to="/panel" replace />;
  }

  const remaining = Number(quota?.remaining ?? INDIVIDUAL_TEST_LIMIT);
  const purchased = Number(quota?.purchased ?? 0);
  const unitPrice = Number(quota?.unit_price_tl ?? INDIVIDUAL_TEST_PRICE_TL);
  const total = quantity * unitPrice;
  const atCap = ready && quota && remaining < 1;

  function setQty(next) {
    const value = Math.min(Math.max(1, next), Math.max(remaining, 1));
    setQuantity(value);
  }

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function validate() {
    const tax = form.taxId.replace(/\D/g, "");
    if (!form.invoiceName.trim() || !form.email.includes("@")) return t("purchase.errInvoice");
    if (!form.city.trim() || !form.district.trim() || !form.address.trim()) return t("purchase.errInvoice");
    if (form.phone.replace(/\D/g, "").length < 10) return t("purchase.errInvoice");
    if (form.invoiceType === "company") {
      if (!form.taxOffice.trim()) return t("purchase.errInvoice");
      if (tax.length !== 10) return t("purchase.errTaxId");
    } else if (!/^[1-9]\d{10}$/.test(tax)) {
      return t("purchase.errTaxId");
    }
    if (quantity < 1 || quantity > remaining) return t("purchase.errLimit");
    return "";
  }

  function onSubmit(event) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setCheckout({
      quantity,
      unitPrice,
      total,
      invoiceType: form.invoiceType,
      invoiceName: form.invoiceName.trim(),
      taxId: form.taxId.replace(/\D/g, ""),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      address: form.address.trim()
    });
  }

  return (
    <Page narrow={!checkout}>
      <Card>
        {!checkout ? (
          <>
            <h1 className="fp-card-title">{t("purchase.title")}</h1>
            <p className="fp-card-desc">{t("purchase.lead", { price: formatTl(unitPrice, locale) })}</p>
          </>
        ) : null}

        {error ? (
          <Alert variant="error">{error}</Alert>
        ) : null}

        {!ready ? <p className="fp-loading">{t("common.loading")}</p> : null}

        {ready && !atCap && checkout ? (
          <CheckoutScreen
            t={t}
            total={formatTl(checkout.total, locale)}
            onBack={() => setCheckout(null)}
            lines={[
              { label: t("purchase.quantity"), value: String(checkout.quantity) },
              { label: t("purchase.unit"), value: formatTl(checkout.unitPrice, locale) },
              { label: t("purchase.total"), value: formatTl(checkout.total, locale), strong: true }
            ]}
            buyer={[
              {
                label: t("purchase.invoiceTitle"),
                value: checkout.invoiceType === "company" ? t("purchase.typeCompany") : t("purchase.typeIndividual")
              },
              { label: t("purchase.name"), value: checkout.invoiceName },
              { label: t("purchase.email"), value: checkout.email },
              { label: t("purchase.phone"), value: checkout.phone },
              { label: t("purchase.city"), value: `${checkout.district} / ${checkout.city}` },
              { label: t("purchase.address"), value: checkout.address }
            ]}
          />
        ) : null}

        {atCap ? (
          <div className="fp-buy-cap">
            <h2>{t("purchase.capTitle")}</h2>
            <p>{t("purchase.capBody", { limit: INDIVIDUAL_TEST_LIMIT })}</p>
            <Button asLink to="/iletisim" variant="primary">
              {t("purchase.contact")}
            </Button>
          </div>
        ) : null}

        {ready && !atCap && !checkout ? (
          <form onSubmit={onSubmit} className="fp-buy-form">
            <div className="fp-buy-price">
              <span>{t("purchase.unit")}</span>
              <strong>{formatTl(unitPrice, locale)}</strong>
            </div>
            <p className="fp-hint">
              {t("purchase.limitNote", {
                limit: INDIVIDUAL_TEST_LIMIT,
                purchased,
                remaining
              })}
            </p>
            <p className="fp-hint">{t("purchase.credits", { count: credits })}</p>

            <Field label={t("purchase.quantity")}>
              <div className="fp-buy-qty">
                <button type="button" onClick={() => setQty(quantity - 1)} aria-label={t("purchase.minus")} disabled={quantity <= 1}>
                  −
                </button>
                <Input
                  type="number"
                  min={1}
                  max={remaining}
                  value={quantity}
                  onChange={(event) => setQty(Number(event.target.value))}
                  aria-label={t("purchase.quantity")}
                />
                <button
                  type="button"
                  onClick={() => setQty(quantity + 1)}
                  aria-label={t("purchase.plus")}
                  disabled={quantity >= remaining}
                >
                  +
                </button>
              </div>
            </Field>

            <div className="fp-buy-total">
              <span>{t("purchase.total")}</span>
              <span>{formatTl(total, locale)}</span>
            </div>

            <h2 className="fp-buy-section">{t("purchase.invoiceTitle")}</h2>
            <p className="fp-card-desc">{t("purchase.invoiceLead")}</p>
            <div className="fp-buy-types" role="group" aria-label={t("purchase.invoiceTitle")}>
              <button
                type="button"
                className={form.invoiceType === "individual" ? "is-active" : ""}
                onClick={() => setField("invoiceType", "individual")}
              >
                {t("purchase.typeIndividual")}
              </button>
              <button
                type="button"
                className={form.invoiceType === "company" ? "is-active" : ""}
                onClick={() => setField("invoiceType", "company")}
              >
                {t("purchase.typeCompany")}
              </button>
            </div>

            <Field label={form.invoiceType === "company" ? t("purchase.companyName") : t("purchase.name")}>
              <Input
                value={form.invoiceName}
                onChange={(event) => setField("invoiceName", event.target.value)}
                autoComplete="name"
                required
              />
            </Field>
            <Field label={form.invoiceType === "company" ? t("purchase.vkn") : t("purchase.tckn")}>
              <Input
                value={form.taxId}
                onChange={(event) => setField("taxId", event.target.value)}
                inputMode="numeric"
                required
              />
            </Field>
            {form.invoiceType === "company" ? (
              <Field label={t("purchase.taxOffice")}>
                <Input
                  value={form.taxOffice}
                  onChange={(event) => setField("taxOffice", event.target.value)}
                  required
                />
              </Field>
            ) : null}
            <Field label={t("purchase.email")}>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field label={t("purchase.phone")}>
              <Input
                type="tel"
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                autoComplete="tel"
                required
              />
            </Field>
            <div className="fp-buy-row">
              <Field label={t("purchase.city")}>
                <Input
                  value={form.city}
                  onChange={(event) => setField("city", event.target.value)}
                  autoComplete="address-level1"
                  required
                />
              </Field>
              <Field label={t("purchase.district")}>
                <Input
                  value={form.district}
                  onChange={(event) => setField("district", event.target.value)}
                  autoComplete="address-level2"
                  required
                />
              </Field>
            </div>
            <Field label={t("purchase.address")}>
              <Input
                value={form.address}
                onChange={(event) => setField("address", event.target.value)}
                autoComplete="street-address"
                required
              />
            </Field>

            <Button type="submit" variant="primary" disabled={!quota}>
              {t("purchase.toPay", { total: formatTl(total, locale) })}
            </Button>
          </form>
        ) : null}
      </Card>
    </Page>
  );
}
