import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { Button, Field, Input } from "../components/ui.jsx";
import { supabase } from "../lib/supabase.js";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  city: "",
  birth: "",
  professions: [],
  professionOther: "",
  university: "",
  department: "",
  graduationYear: "",
  postgraduate: "",
  workplace: "",
  experience: "",
  practiceAreas: "",
  purposes: [],
  purposeOther: "",
  heard: "",
  heardOther: "",
  motivation: "",
  consents: []
};

const FILE_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const MAX_FILE = 8 * 1024 * 1024;

function digitsOnly(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

function toggleKey(list, key) {
  return list.includes(key) ? list.filter((item) => item !== key) : [...list, key];
}

function fileOk(file) {
  if (!file) return true;
  return FILE_TYPES.has(file.type) && file.size <= MAX_FILE;
}

async function uploadDocument(file, folder, name) {
  if (!file) return null;
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `applications/${folder}/${name}.${ext}`;
  const { error } = await supabase.storage.from("specialist-documents").upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  if (error) throw error;
  return path;
}

function CheckGroup({ options, selected, onToggle }) {
  return (
    <div className="fp-spec-checks">
      {options.map((option) => (
        <label key={option.key} className="fp-spec-check">
          <input type="checkbox" checked={selected.includes(option.key)} onChange={() => onToggle(option.key)} />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function SpecialistApplyPage() {
  const { strings, t } = useLocale();
  const page = strings.home.marketing.specialist;
  const [form, setForm] = useState(EMPTY);
  const [diploma, setDiploma] = useState(null);
  const [certificate, setCertificate] = useState(null);
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
    const phone = digitsOnly(form.phone);
    const year = form.graduationYear.trim();
    const yearNumber = year ? Number(year) : null;
    const yearInvalid = year !== "" && (!Number.isInteger(yearNumber) || yearNumber < 1950 || yearNumber > new Date().getFullYear() + 1);
    const missing =
      !form.name.trim() ||
      !form.email.includes("@") ||
      phone.length < 10 ||
      !form.city.trim() ||
      !form.professions.length ||
      (form.professions.includes("other") && !form.professionOther.trim()) ||
      !form.university.trim() ||
      !form.department.trim() ||
      !form.purposes.length ||
      (form.purposes.includes("other") && !form.purposeOther.trim()) ||
      !form.heard ||
      (form.heard === "other" && !form.heardOther.trim()) ||
      !form.motivation.trim() ||
      page.consents.some((item) => !form.consents.includes(item.key)) ||
      yearInvalid;

    if (missing) {
      setError(page.required);
      return;
    }
    if (!fileOk(diploma) || !fileOk(certificate)) {
      setError(page.fileInvalid);
      return;
    }
    if (!supabase) {
      setError(page.saveError);
      return;
    }

    setSending(true);
    try {
      const folder = crypto.randomUUID();
      const diplomaPath = await uploadDocument(diploma, folder, "diploma");
      const certificatePath = await uploadDocument(certificate, folder, "certificate");
      const { error: insertError } = await supabase.from("specialist_applications").insert({
        full_name: form.name.trim(),
        email: form.email.trim(),
        phone: `+90${phone.replace(/^0/, "")}`,
        city: form.city.trim(),
        birth_date: form.birth || null,
        professions: form.professions,
        profession_other: form.professionOther.trim() || null,
        university: form.university.trim(),
        department: form.department.trim(),
        graduation_year: yearNumber,
        postgraduate: form.postgraduate.trim() || null,
        workplace: form.workplace.trim() || null,
        experience: form.experience.trim() || null,
        practice_areas: form.practiceAreas.trim() || null,
        diploma_path: diplomaPath,
        certificate_path: certificatePath,
        purposes: form.purposes,
        purpose_other: form.purposeOther.trim() || null,
        heard_from: form.heard,
        heard_other: form.heardOther.trim() || null,
        motivation: form.motivation.trim()
      });
      if (insertError) throw insertError;
      setDone(true);
    } catch (submitError) {
      const message = String(submitError?.message || "");
      setError(/mime|size|payload|file/i.test(message) ? page.fileInvalid : page.saveError);
    } finally {
      setSending(false);
    }
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
          {done ? (
            <p className="fp-corp-success">{page.success}</p>
          ) : (
            <form className="fp-corp-form" onSubmit={onSubmit} noValidate>
              <h2 className="fp-spec-section">{page.sections.personal}</h2>
              <Field label={page.fields.name}>
                <Input value={form.name} onChange={(event) => setField("name", event.target.value)} required />
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
              <Field label={page.fields.city}>
                <Input value={form.city} onChange={(event) => setField("city", event.target.value)} required />
              </Field>
              <Field label={page.fields.birth} hint={page.fields.birthHint}>
                <Input type="date" value={form.birth} onChange={(event) => setField("birth", event.target.value)} />
              </Field>

              <h2 className="fp-spec-section">{page.sections.professional}</h2>
              <div className="fp-corp-span">
                <p className="fp-spec-label">{page.fields.profession}</p>
                <p className="fp-spec-hint">{page.fields.professionHint}</p>
                <CheckGroup
                  options={page.professions}
                  selected={form.professions}
                  onToggle={(key) => setField("professions", toggleKey(form.professions, key))}
                />
                {form.professions.includes("other") && (
                  <Field label={page.fields.otherExplain}>
                    <Input
                      value={form.professionOther}
                      onChange={(event) => setField("professionOther", event.target.value)}
                      required
                    />
                  </Field>
                )}
              </div>
              <Field label={page.fields.university}>
                <Input value={form.university} onChange={(event) => setField("university", event.target.value)} required />
              </Field>
              <Field label={page.fields.department}>
                <Input value={form.department} onChange={(event) => setField("department", event.target.value)} required />
              </Field>
              <Field label={page.fields.graduationYear}>
                <Input
                  inputMode="numeric"
                  value={form.graduationYear}
                  onChange={(event) => setField("graduationYear", event.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </Field>
              <Field label={page.fields.postgraduate}>
                <Input value={form.postgraduate} onChange={(event) => setField("postgraduate", event.target.value)} />
              </Field>
              <Field label={page.fields.workplace}>
                <Input value={form.workplace} onChange={(event) => setField("workplace", event.target.value)} />
              </Field>
              <Field label={page.fields.experience}>
                <Input value={form.experience} onChange={(event) => setField("experience", event.target.value)} />
              </Field>
              <Field label={page.fields.practiceAreas} className="fp-corp-span">
                <Input value={form.practiceAreas} onChange={(event) => setField("practiceAreas", event.target.value)} />
              </Field>

              <h2 className="fp-spec-section">{page.sections.documents}</h2>
              <Field label={page.fields.diploma}>
                <input
                  className="fp-spec-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setDiploma(event.target.files?.[0] || null);
                    setError("");
                  }}
                />
                <p className="fp-spec-hint">{page.fields.fileHint}</p>
              </Field>
              <Field label={page.fields.certificate}>
                <input
                  className="fp-spec-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    setCertificate(event.target.files?.[0] || null);
                    setError("");
                  }}
                />
                <p className="fp-spec-hint">{page.fields.fileHint}</p>
              </Field>

              <h2 className="fp-spec-section">{page.sections.purpose}</h2>
              <div className="fp-corp-span">
                <p className="fp-spec-label">{page.fields.purpose}</p>
                <p className="fp-spec-hint">{page.fields.purposeHint}</p>
                <CheckGroup
                  options={page.purposes}
                  selected={form.purposes}
                  onToggle={(key) => setField("purposes", toggleKey(form.purposes, key))}
                />
                {form.purposes.includes("other") && (
                  <Field label={page.fields.otherExplain}>
                    <Input value={form.purposeOther} onChange={(event) => setField("purposeOther", event.target.value)} required />
                  </Field>
                )}
              </div>
              <div className="fp-corp-span">
                <p className="fp-spec-label">{page.fields.heard}</p>
                <div className="fp-spec-checks">
                  {page.sources.map((option) => (
                    <label key={option.key} className="fp-spec-check">
                      <input
                        type="radio"
                        name="heard"
                        checked={form.heard === option.key}
                        onChange={() => setField("heard", option.key)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                {form.heard === "other" && (
                  <Field label={page.fields.otherExplain}>
                    <Input value={form.heardOther} onChange={(event) => setField("heardOther", event.target.value)} required />
                  </Field>
                )}
              </div>
              <Field label={page.fields.motivation} className="fp-corp-span">
                <textarea
                  className="fp-input fp-corp-message"
                  rows={4}
                  value={form.motivation}
                  onChange={(event) => setField("motivation", event.target.value)}
                  required
                />
              </Field>

              <h2 className="fp-spec-section">{page.sections.consents}</h2>
              <div className="fp-corp-span">
                <CheckGroup
                  options={page.consents}
                  selected={form.consents}
                  onToggle={(key) => setField("consents", toggleKey(form.consents, key))}
                />
              </div>

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
