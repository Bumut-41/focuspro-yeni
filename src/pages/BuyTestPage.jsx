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
import { normalizePromoCodeInput, validatePromoCode } from "../services/promoCodes.js";
import { Alert, Button, Card, Field, Input, Page, Stack } from "../components/ui.jsx";
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

function promoError(dataOrErr, t) {
  const code = dataOrErr?.error || dataOrErr?.message || "";
  if (code.includes("promo_not_found") || code === "promo_not_found") return t("purchase.promoInvalid");
  if (code.includes("invalid_promo") || code === "invalid_promo_code") return t("purchase.promoInvalid");
  if (code.includes("Could not find the function") || code.includes("schema cache")) return t("purchase.promoSetup");
  return dataOrErr?.message || t("purchase.promoInvalid");
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
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);

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
  const unitPriceAfter = promo?.ok ? Number(promo.unit_price_after_tl) : unitPrice;
  const totalBefore = quantity * unitPrice;
  const total = promo?.ok ? Number(promo.total_after_tl) : totalBefore;
  const discountTotal = promo?.ok ? Number(promo.discount_total_tl) : 0;
  const atCap = ready && quota && remaining < 1;

  function setQty(next) {
    const value = Math.min(Math.max(1, next), Math.max(remaining, 1));
    setQuantity(value);
    if (promo?.ok && promo.code) {
      void applyPromo(promo.code, value);
    }
  }

  async function applyPromo(codeOverride, qtyOverride) {
    const code = normalizePromoCodeInput(codeOverride ?? promoInput);
    const qty = qtyOverride ?? quantity;
    setPromoMsg("");
    if (!code) {
      setPromo(null);
      setPromoMsg(t("purchase.promoInvalid"));
      return;
    }
    setPromoBusy(true);
    try {
      const data = await validatePromoCode(code, qty);
      if (!data?.ok) {
        setPromo(null);
        setPromoMsg(promoError(data, t));
        return;
      }
      setPromo(data);
      setPromoInput(data.code || code);
      setPromoMsg(
        t("purchase.promoApplied", {
          code: data.code,
          discount: formatTl(data.discount_total_tl, locale)
        })
      );
    } catch (err) {
      setPromo(null);
      setPromoMsg(promoError(err, t));
    } finally {
      setPromoBusy(false);
    }
  }

  function clearPromo() {
    setPromo(null);
    setPromoInput("");
    setPromoMsg("");
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
      unitPrice: unitPriceAfter,
      unitPriceBefore: unitPrice,
      total,
      totalBefore,
      discountTotal,
      promoCode: promo?.ok ? promo.code : null,
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
              {
                label: t("purchase.unit"),
                value:
                  checkout.promoCode && checkout.unitPriceBefore !== checkout.unitPrice
                    ? `${formatTl(checkout.unitPriceBefore, locale)} → ${formatTl(checkout.unitPrice, locale)}`
                    : formatTl(checkout.unitPrice, locale)
              },
              ...(checkout.promoCode
                ? [
                    { label: t("purchase.promoCode"), value: checkout.promoCode },
                    {
                      label: t("purchase.promoDiscount"),
                      value: `−${formatTl(checkout.discountTotal, locale)}`
                    }
                  ]
                : []),
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
              <strong>
                {promo?.ok && unitPriceAfter !== unitPrice
                  ? `${formatTl(unitPrice, locale)} → ${formatTl(unitPriceAfter, locale)}`
                  : formatTl(unitPrice, locale)}
              </strong>
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

            <Field label={t("purchase.promoCode")} hint={t("purchase.promoHint")}>
              <Stack gap={8} wrap style={{ alignItems: "center" }}>
                <Input
                  value={promoInput}
                  onChange={(event) => {
                    setPromoInput(event.target.value);
                    setPromoMsg("");
                  }}
                  placeholder={t("purchase.promoPlaceholder")}
                  autoComplete="off"
                  style={{ minWidth: 220, flex: 1 }}
                />
                <Button type="button" variant="secondary" disabled={promoBusy} onClick={() => applyPromo()}>
                  {promoBusy ? t("common.wait") : t("purchase.promoApply")}
                </Button>
                {promo?.ok ? (
                  <Button type="button" variant="ghost" onClick={clearPromo}>
                    {t("purchase.promoClear")}
                  </Button>
                ) : null}
              </Stack>
            </Field>
            {promoMsg ? (
              <Alert variant={promo?.ok ? "success" : "error"}>{promoMsg}</Alert>
            ) : null}

            {promo?.ok && discountTotal > 0 ? (
              <div className="fp-buy-total" style={{ opacity: 0.85 }}>
                <span>{t("purchase.promoDiscount")}</span>
                <span>−{formatTl(discountTotal, locale)}</span>
              </div>
            ) : null}

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
