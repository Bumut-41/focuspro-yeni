import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button, Field, Input, Select } from "../components/ui.jsx";
import { supabase } from "../lib/supabase.js";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  profession: "",
  organization: "",
  location: "",
  subject: "",
  message: ""
};

export default function ContactPage() {
  const { strings, t } = useLocale();
  const page = strings.home.marketing.contactPage;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || !form.subject || !form.message.trim()) {
      setError(page.required);
      return;
    }
    if (!supabase) {
      setError(page.saveError);
      return;
    }

    setSending(true);
    const { error: insertError } = await supabase.from("contact_messages").insert({
      full_name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      profession: form.profession.trim() || null,
      organization: form.organization.trim() || null,
      location: form.location.trim() || null,
      subject: form.subject,
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
        <p className="fp-detail-kicker">{page.kicker}</p>
        <h1>{page.title}</h1>
        {page.intro.map((paragraph) => (
          <p key={paragraph} className="fp-detail-copy">
            {paragraph}
          </p>
        ))}

        <section className="fp-detail-block fp-corp-form-card">
          <h2>{page.formTitle}</h2>
          {done ? (
            <div className="fp-corp-success">
              <p style={{ margin: "0 0 8px", fontSize: "1.15rem" }}>{page.thanksTitle}</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{page.thanksBody}</p>
            </div>
          ) : (
            <form className="fp-corp-form" onSubmit={onSubmit} noValidate>
              <Field label={page.fields.name}>
                <Input
                  value={form.name}
                  placeholder={page.fields.namePlaceholder}
                  onChange={(event) => setField("name", event.target.value)}
                  required
                />
              </Field>
              <Field label={page.fields.email}>
                <Input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  placeholder={page.fields.emailPlaceholder}
                  onChange={(event) => setField("email", event.target.value)}
                  required
                />
              </Field>
              <Field label={page.fields.phone}>
                <Input
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  placeholder={page.fields.phonePlaceholder}
                  onChange={(event) => setField("phone", event.target.value)}
                />
              </Field>
              <Field label={page.fields.profession}>
                <Input
                  value={form.profession}
                  placeholder={page.fields.professionPlaceholder}
                  onChange={(event) => setField("profession", event.target.value)}
                />
              </Field>
              <Field label={page.fields.organization}>
                <Input
                  value={form.organization}
                  placeholder={page.fields.organizationPlaceholder}
                  onChange={(event) => setField("organization", event.target.value)}
                />
              </Field>
              <Field label={page.fields.location}>
                <Input
                  value={form.location}
                  placeholder={page.fields.locationPlaceholder}
                  onChange={(event) => setField("location", event.target.value)}
                />
              </Field>
              <Field label={page.fields.subject} className="fp-corp-span">
                <Select value={form.subject} onChange={(event) => setField("subject", event.target.value)} required>
                  <option value="">{page.fields.subjectPlaceholder}</option>
                  {page.subjects.map((subject) => (
                    <option key={subject.key} value={subject.key}>
                      {subject.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={page.fields.message} className="fp-corp-span">
                <textarea
                  className="fp-input fp-corp-message"
                  rows={5}
                  value={form.message}
                  placeholder={page.fields.messagePlaceholder}
                  onChange={(event) => setField("message", event.target.value)}
                  required
                />
              </Field>
              {error && <p className="fp-corp-error">{error}</p>}
              <Button type="submit" size="lg" className="fp-mkt-btn-teal fp-detail-cta" disabled={sending}>
                {sending ? t("common.wait") : page.submit}
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
