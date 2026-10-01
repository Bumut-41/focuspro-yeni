import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button, Field, Input, Select } from "../components/ui.jsx";
import { CORPORATE_COUNTRIES, citiesForCountry } from "../data/corporateLocations.js";
import { supabase } from "../lib/supabase.js";

const EMPTY = {
  name: "",
  profession: "",
  phone: "",
  email: "",
  country: "TR",
  city: "",
  workplace: "",
  message: ""
};

function digitsOnly(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export default function SpecialistApplyPage() {
  const { strings, locale } = useLocale();
  const regionNames = useMemo(() => {
    const tag = locale === "en" ? "en" : locale === "it" ? "it" : "tr";
    try {
      return new Intl.DisplayNames([tag], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  const page = strings.home.marketing.specialist;
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
      !form.name.trim() ||
      !form.profession ||
      phone.length < 10 ||
      !form.email.includes("@") ||
      !form.country ||
      !form.city;

    if (missing) {
      setError(page.required);
      return;
    }

    if (!supabase) {
      setError(page.saveError);
      return;
    }

    setSending(true);
    const { error: insertError } = await supabase.from("specialist_applications").insert({
      full_name: form.name.trim(),
      profession: form.profession,
      phone: `+90${phone.replace(/^0/, "")}`,
      email: form.email.trim(),
      country_code: form.country,
      city: form.city,
      workplace: form.workplace.trim() || null,
      message: form.message.trim() || null
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
        <p className="fp-detail-copy">{page.intro}</p>
        <p className="fp-detail-copy">
          <Link to="/kurumsal-basvuru">{page.corporateLink}</Link>
        </p>

        <section className="fp-detail-block fp-corp-form-card">
          <h2>{page.formTitle}</h2>
          {done ? (
            <p className="fp-corp-success">{page.success}</p>
          ) : (
            <form className="fp-corp-form" onSubmit={onSubmit} noValidate>
              <Field label={page.fields.name}>
                <Input value={form.name} onChange={(event) => setField("name", event.target.value)} required />
              </Field>
              <Field label={page.fields.profession}>
                <Select
                  value={form.profession}
                  onChange={(event) => setField("profession", event.target.value)}
                  required
                >
                  <option value="">{page.fields.professionPlaceholder}</option>
                  {page.professions.map((profession) => (
                    <option key={profession} value={profession}>
                      {profession}
                    </option>
                  ))}
                </Select>
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
              <Field label={page.fields.workplace}>
                <Input value={form.workplace} onChange={(event) => setField("workplace", event.target.value)} />
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
