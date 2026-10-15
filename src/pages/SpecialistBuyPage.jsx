import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  SPECIALIST_PACKS,
  formatTl,
  specialistPackTotals
} from "../services/purchases.js";
import { Alert, Button, Card, Field, Input, Page } from "../components/ui.jsx";
import { CheckoutScreen } from "../components/CheckoutScreen.jsx";

const EMPTY = {
  invoiceType: "company",
  invoiceName: "",
  taxId: "",
  taxOffice: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  address: ""
};

export default function SpecialistBuyPage() {
  const { profile, user, credits } = useAuth();
  const { t, locale } = useLocale();
  const [pack, setPack] = useState(SPECIALIST_PACKS[0]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState(null);

  useEffect(() => {
    if (!profile || profile.role !== "psychologist") return;
    setForm((current) => ({
      ...current,
      invoiceName: current.invoiceName || profile.full_name || "",
      email: current.email || user?.email || ""
    }));
  }, [profile, user?.email]);

  if (!profile) {
    return <p className="fp-loading">{t("common.loading")}</p>;
  }

  if (profile.role !== "psychologist") {
    return <Navigate to="/panel" replace />;
  }

  const totals = specialistPackTotals(pack);

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
      quantity: pack.quantity,
      unitPrice: pack.unitPriceTl,
      net: totals.net,
      vat: totals.vat,
      vatRate: totals.vatRate,
      total: totals.total,
      invoiceType: form.invoiceType,
      invoiceName: form.invoiceName.trim(),
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
            <p className="fp-card-desc">{t("purchase.packLead")}</p>
            <p className="fp-hint">{t("purchase.credits", { count: credits })}</p>
          </>
        ) : null}
        {error ? <Alert variant="error">{error}</Alert> : null}

        {checkout ? (
          <CheckoutScreen
            t={t}
            total={formatTl(checkout.total, locale)}
            onBack={() => setCheckout(null)}
            lines={[
              { label: t("purchase.packTests", { count: checkout.quantity }), value: formatTl(checkout.unitPrice, locale) },
              { label: t("purchase.net"), value: formatTl(checkout.net, locale) },
              { label: t("purchase.vat", { rate: checkout.vatRate }), value: formatTl(checkout.vat, locale) },
              { label: t("purchase.gross"), value: formatTl(checkout.total, locale), strong: true }
            ]}
            buyer={[
              {
                label: t("purchase.invoiceTitle"),
                value: checkout.invoiceType === "company" ? t("purchase.typeCompany") : t("purchase.typeIndividual")
              },
              { label: checkout.invoiceType === "company" ? t("purchase.companyName") : t("purchase.name"), value: checkout.invoiceName },
              { label: t("purchase.email"), value: checkout.email },
              { label: t("purchase.phone"), value: checkout.phone },
              { label: t("purchase.city"), value: `${checkout.district} / ${checkout.city}` },
              { label: t("purchase.address"), value: checkout.address }
            ]}
          />
        ) : (
        <form onSubmit={onSubmit} className="fp-buy-form">
          <div className="fp-buy-packs" role="radiogroup" aria-label={t("purchase.packLead")}>
            {SPECIALIST_PACKS.map((item) => (
              <button
                key={item.quantity}
                type="button"
                role="radio"
                aria-checked={pack.quantity === item.quantity}
                className={pack.quantity === item.quantity ? "is-active" : ""}
                onClick={() => setPack(item)}
              >
                <strong>{t("purchase.packTests", { count: item.quantity })}</strong>
                <span>{t("purchase.packUnit", { price: formatTl(item.unitPriceTl, locale) })}</span>
              </button>
            ))}
          </div>

          <div className="fp-buy-lines">
            <div>
              <span>{t("purchase.net")}</span>
              <span>{formatTl(totals.net, locale)}</span>
            </div>
            <div>
              <span>{t("purchase.vat", { rate: totals.vatRate })}</span>
              <span>{formatTl(totals.vat, locale)}</span>
            </div>
            <div className="fp-buy-total">
              <span>{t("purchase.gross")}</span>
              <span>{formatTl(totals.total, locale)}</span>
            </div>
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
            <Input value={form.invoiceName} onChange={(event) => setField("invoiceName", event.target.value)} autoComplete="organization" required />
          </Field>
          <Field label={form.invoiceType === "company" ? t("purchase.vkn") : t("purchase.tckn")}>
            <Input value={form.taxId} onChange={(event) => setField("taxId", event.target.value)} inputMode="numeric" required />
          </Field>
          {form.invoiceType === "company" ? (
            <Field label={t("purchase.taxOffice")}>
              <Input value={form.taxOffice} onChange={(event) => setField("taxOffice", event.target.value)} required />
            </Field>
          ) : null}
          <Field label={t("purchase.email")}>
            <Input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} autoComplete="email" required />
          </Field>
          <Field label={t("purchase.phone")}>
            <Input type="tel" value={form.phone} onChange={(event) => setField("phone", event.target.value)} autoComplete="tel" required />
          </Field>
          <div className="fp-buy-row">
            <Field label={t("purchase.city")}>
              <Input value={form.city} onChange={(event) => setField("city", event.target.value)} autoComplete="address-level1" required />
            </Field>
            <Field label={t("purchase.district")}>
              <Input value={form.district} onChange={(event) => setField("district", event.target.value)} autoComplete="address-level2" required />
            </Field>
          </div>
          <Field label={t("purchase.address")}>
            <Input value={form.address} onChange={(event) => setField("address", event.target.value)} autoComplete="street-address" required />
          </Field>

          <Button type="submit" variant="primary">
            {t("purchase.toPay", { total: formatTl(totals.total, locale) })}
          </Button>
        </form>
        )}
      </Card>
    </Page>
  );
}
