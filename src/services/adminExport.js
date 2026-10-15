import { downloadTableCsv, excelText } from "../lib/csvDownload.js";

function when(value, dateLocale) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(dateLocale);
}

function day(value, dateLocale) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(dateLocale);
}

function score(metrics, key) {
  const value = metrics?.[key];
  if (value == null || value === "") return "";
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : "";
}

function cleanLabel(text) {
  return String(text || "").replace(/\s*\*$/, "");
}

function optionText(options, keys, otherText) {
  const labels = (keys || []).map((key) => {
    const label = options?.find((item) => item.key === key)?.label || key;
    return key === "other" && otherText ? `${label}: ${otherText}` : label;
  });
  return labels.filter(Boolean).join(", ");
}

export function downloadProfilesCsv(rows, labels, { dateLocale, roleName }) {
  downloadTableCsv(
    "focusprolab-kullanicilar",
    [labels.date, labels.name, labels.email, labels.role, labels.credits, labels.birth, labels.id],
    rows.map((row) => [
      when(row.created_at, dateLocale),
      row.full_name || "",
      row.email || "",
      roleName(row.role),
      row.test_credits ?? "",
      day(row.birth_date, dateLocale),
      row.id || ""
    ])
  );
}

export function downloadCorporateCsv(rows, labels, { dateLocale, countryName }) {
  downloadTableCsv(
    "focusprolab-kurumsal-basvurular",
    [
      labels.date,
      labels.organization,
      labels.contact,
      labels.jobTitle,
      labels.phone,
      labels.email,
      labels.country,
      labels.city,
      labels.institutionType,
      labels.experts,
      labels.monthlyClients,
      labels.message,
      labels.id
    ],
    rows.map((row) => [
      when(row.created_at, dateLocale),
      row.organization_name || "",
      row.contact_name || "",
      row.role || "",
      excelText(row.phone),
      row.email || "",
      countryName(row.country_code),
      row.city || "",
      row.institution_type || "",
      row.expert_count ?? "",
      row.monthly_clients ?? "",
      row.message || "",
      row.id || ""
    ])
  );
}

export function downloadSpecialistApplicationsCsv(rows, labels, { dateLocale, page }) {
  downloadTableCsv(
    "focusprolab-uzman-basvurulari",
    [
      labels.date,
      cleanLabel(page.fields.name),
      cleanLabel(page.fields.email),
      cleanLabel(page.fields.phone),
      cleanLabel(page.fields.city),
      cleanLabel(page.fields.birth),
      cleanLabel(page.fields.profession),
      cleanLabel(page.fields.university),
      cleanLabel(page.fields.department),
      cleanLabel(page.fields.graduationYear),
      cleanLabel(page.fields.postgraduate),
      cleanLabel(page.fields.workplace),
      cleanLabel(page.fields.experience),
      cleanLabel(page.fields.practiceAreas),
      cleanLabel(page.fields.purpose),
      cleanLabel(page.fields.heard),
      cleanLabel(page.fields.motivation),
      cleanLabel(page.fields.diploma),
      cleanLabel(page.fields.certificate),
      labels.id
    ],
    rows.map((row) => [
      when(row.created_at, dateLocale),
      row.full_name || "",
      row.email || "",
      excelText(row.phone),
      row.city || "",
      day(row.birth_date, dateLocale),
      optionText(page.professions, row.professions, row.profession_other),
      row.university || "",
      row.department || "",
      row.graduation_year || "",
      row.postgraduate || "",
      row.workplace || "",
      row.experience || "",
      row.practice_areas || "",
      optionText(page.purposes, row.purposes, row.purpose_other),
      optionText(page.sources, row.heard_from ? [row.heard_from] : [], row.heard_other),
      row.motivation || "",
      row.diploma_path || "",
      row.certificate_path || "",
      row.id || ""
    ])
  );
}

export function downloadContactCsv(rows, labels, { dateLocale, subjectLabel }) {
  downloadTableCsv(
    "focusprolab-iletisim",
    [
      labels.date,
      labels.name,
      labels.email,
      labels.phone,
      labels.profession,
      labels.organization,
      labels.location,
      labels.subject,
      labels.message,
      labels.id
    ],
    rows.map((row) => [
      when(row.created_at, dateLocale),
      row.full_name || "",
      row.email || "",
      excelText(row.phone),
      row.profession || "",
      row.organization || "",
      row.location || "",
      subjectLabel(row.subject),
      row.message || "",
      row.id || ""
    ])
  );
}

export function downloadSessionsCsv(rows, labels, { dateLocale, profileName }) {
  downloadTableCsv(
    "focusprolab-testler",
    [
      labels.date,
      labels.operator,
      labels.participant,
      labels.age,
      labels.profile,
      labels.overall,
      labels.attention,
      labels.timing,
      labels.impulsivity,
      labels.hyperactivity,
      labels.record,
      labels.id
    ],
    rows.map((row) => {
      const metrics = row.metrics || {};
      const saved = [
        row.pdf_path ? labels.testSaved : labels.testPending,
        row.admin_pdf_path ? labels.pressSaved : ""
      ]
        .filter(Boolean)
        .join(" ");
      return [
        when(row.created_at, dateLocale),
        row.owner?.full_name || row.profiles?.full_name || row.owner_id || "",
        row.participant_name || "",
        row.participant_age ?? "",
        profileName(row.profile_key),
        score(metrics, "overallScore"),
        score(metrics, "attentionScore"),
        score(metrics, "speedScore"),
        score(metrics, "impulseScore"),
        score(metrics, "consistencyScore"),
        saved,
        row.id || ""
      ];
    })
  );
}
