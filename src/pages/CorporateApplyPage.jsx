import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button, Field, Input, Select } from "../components/ui.jsx";
import { CORPORATE_COUNTRIES, citiesForCountry } from "../data/corporateLocations.js";
import { supabase } from "../lib/supabase.js";

const EMPTY = {
  organization: "",
  contact: "",
  role: "",
  phone: "",
  email: "",
  country: "TR",
  city: "",
  type: "",
  experts: "",
  clients: "",
  message: ""
};

function digitsOnly(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export default function CorporateApplyPage() {
  const { strings, locale } = useLocale();
  const regionNames = useMemo(() => {
    const tag = locale === "en" ? "en" : locale === "it" ? "it" : "tr";
    try {
      return new Intl.DisplayNames([tag], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  const page = strings.home.marketing.corporate;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cities = useMemo(() => citiesForCountry(form.country), [form.country]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function onCountry(code) {
    setForm((current) => ({ ...current, country: code, city: "" }));
    setError("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    const phone = digitsOnly(form.phone);
    const missing =
      !form.organization.trim() ||
      !form.contact.trim() ||
      !form.role.trim() ||
      phone.length < 10 ||
      !form.email.includes("@") ||
      !form.country ||
      !form.city ||
      !form.type ||
      form.experts === "" ||
      form.clients === "";

    if (missing) {
      setError(page.required);
      return;
    }

    if (!supabase) {
      setError(page.saveError);
      return;
    }

    setSending(true);
    const { error: insertError } = await supabase.from("corporate_applications").insert({
      organization_name: form.organization.trim(),
      contact_name: form.contact.trim(),
      role: form.role.trim(),
      phone: `+90${phone.replace(/^0/, "")}`,
      email: form.email.trim(),
      country_code: form.country,
      city: form.city,
      institution_type: form.type,
      expert_count: Number(form.experts),
      monthly_clients: Number(form.clients),
      message: form.message.trim()
    });
    setSending(false);

    if (insertError) {
      setError(page.saveError);
      return;
    }

    setDone(true);
  }

  return (
    <div className="fp-mkt fp-detail">
      <div className="fp-mkt-container fp-detail-wrap">
        <Link to="/" className="fp-detail-back">
          ← {page.back}
        </Link>
        <p className="fp-detail-kicker">{page.title}</p>
        <h1>{page.lead}</h1>
        {page.intro.map((paragraph) => (
          <p key={paragraph} className="fp-detail-copy">
            {paragraph}
          </p>
        ))}

        <section className="fp-detail-block">
          <h2>{page.whoTitle}</h2>
          <ul className="fp-detail-checks fp-corp-who">
            {page.who.map((item) => (
              <li key={item}>
                <span aria-hidden>✅</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="fp-detail-block">
          <h2>{page.processTitle}</h2>
          <ol className="fp-corp-steps">
            {page.process.map((step, index) => (
              <li key={step.title}>
                <span>{index + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="fp-detail-block">
          <h2>{page.benefitsTitle}</h2>
          <ul className="fp-detail-checks">
            {page.benefits.map((item) => (
              <li key={item}>
                <span aria-hidden>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="fp-detail-block fp-corp-form-card">
          <h2>{page.formTitle}</h2>
          {done ? (
            <p className="fp-corp-success">{page.success}</p>
          ) : (
            <form className="fp-corp-form" onSubmit={onSubmit} noValidate>
              <Field label={page.fields.org}>
                <Input
                  value={form.organization}
                  onChange={(event) => setField("organization", event.target.value)}
                  required
                />
              </Field>
              <Field label={page.fields.contact}>
                <Input value={form.contact} onChange={(event) => setField("contact", event.target.value)} required />
              </Field>
              <Field label={page.fields.role}>
                <Input value={form.role} onChange={(event) => setField("role", event.target.value)} required />
              </Field>
              <Field label={page.fields.phone}>
                <div className="fp-phone">
                  <span className="fp-phone-prefix">🇹🇷 +90</span>
                  <Input
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={form.phone}
                    onChange={(event) => setField("phone", digitsOnly(event.target.value))}
                    required
                  />
                </div>
              </Field>
              <Field label={page.fields.email}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setField("email", event.target.value)}
                  required
                />
              </Field>
              <Field label={page.fields.country}>
                <Select value={form.country} onChange={(event) => onCountry(event.target.value)}>
                  {CORPORATE_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {regionNames?.of(country.code) || country.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={page.fields.city}>
                <Select value={form.city} onChange={(event) => setField("city", event.target.value)} required>
                  <option value="">{page.fields.cityPlaceholder}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={page.fields.type}>
                <Select value={form.type} onChange={(event) => setField("type", event.target.value)} required>
                  <option value="">{page.fields.typePlaceholder}</option>
                  {page.types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={page.fields.experts}>
                <Input
                  type="number"
                  min="0"
                  value={form.experts}
                  onChange={(event) => setField("experts", event.target.value)}
                  required
                />
              </Field>
              <Field label={page.fields.clients}>
                <Input
                  type="number"
                  min="0"
                  value={form.clients}
                  onChange={(event) => setField("clients", event.target.value)}
                  required
                />
              </Field>
              <Field label={page.fields.message} className="fp-corp-span">
                <textarea
                  className="fp-input fp-corp-message"
                  rows={4}
                  value={form.message}
                  onChange={(event) => setField("message", event.target.value)}
                />
              </Field>
              {error && <p className="fp-corp-error">{error}</p>}
              <Button type="submit" size="lg" className="fp-mkt-btn-teal fp-detail-cta" disabled={sending}>
                {page.submit}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
