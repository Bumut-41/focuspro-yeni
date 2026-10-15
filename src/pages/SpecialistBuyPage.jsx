import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  SPECIALIST_PACKS,
  formatTl,
  purchaseSpecialistTests,
  specialistPackTotals
} from "../services/purchases.js";
import { Alert, Button, Card, Field, Input, Page } from "../components/ui.jsx";

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

function purchaseError(err, t) {
  const code = err?.message ?? "";
  if (code.includes("specialist_only")) return t("purchase.errSpecialist");
  if (code.includes("invalid_pack")) return t("purchase.errPack");
  if (code.includes("invalid_tax_id")) return t("purchase.errTaxId");
  if (code.includes("invalid_invoice")) return t("purchase.errInvoice");
  if (code.includes("Could not find the function") || code.includes("schema cache")) return t("purchase.errSetup");
  return err?.message || t("common.error");
}

export default function SpecialistBuyPage() {
  const { profile, user, credits, refreshProfile } = useAuth();
  const { t, locale } = useLocale();
  const [pack, setPack] = useState(SPECIALIST_PACKS[0]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

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

  async function onSubmit(event) {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await purchaseSpecialistTests({
        quantity: pack.quantity,
        invoiceType: form.invoiceType,
        invoiceName: form.invoiceName.trim(),
        taxId: form.taxId,
        taxOffice: form.taxOffice.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        address: form.address.trim()
      });
      await refreshProfile();
      setDone(result);
    } catch (err) {
      setError(purchaseError(err, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page narrow>
      <Card>
        <h1 className="fp-card-title">{t("purchase.title")}</h1>
        <p className="fp-card-desc">{t("purchase.packLead")}</p>
        <p className="fp-hint">{t("purchase.credits", { count: credits })}</p>
        {error ? <Alert variant="error">{error}</Alert> : null}
        {done ? (
          <Alert variant="success">
            {t("purchase.successBody", {
              count: done.quantity,
              total: formatTl(done.total_tl, locale)
            })}
          </Alert>
        ) : null}

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

          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? t("purchase.saving") : t("purchase.submit", { total: formatTl(totals.total, locale) })}
          </Button>
        </form>

        {done ? (
          <p className="fp-buy-after">
            <Link to="/panel">{t("common.panelBack")}</Link>
          </p>
        ) : null}
      </Card>
    </Page>
  );
}
