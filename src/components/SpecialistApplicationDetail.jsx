import { Button } from "./ui.jsx";

function optionText(options, keys, otherText) {
  const labels = (keys || []).map((key) => {
    const label = options.find((item) => item.key === key)?.label || key;
    return key === "other" && otherText ? `${label}: ${otherText}` : label;
  });
  return labels.filter(Boolean).join(", ") || "—";
}

function Row({ label, value }) {
  return (
    <div className="fp-spec-detail-row">
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

export function SpecialistApplicationDetail({ row, page, dateLocale, onOpenDoc }) {
  if (!row) return null;
  const birth = row.birth_date ? new Date(`${row.birth_date}T00:00:00`).toLocaleDateString(dateLocale) : "—";
  const heard = optionText(page.sources, row.heard_from ? [row.heard_from] : [], row.heard_other);

  return (
    <div className="fp-spec-detail">
      <h3>{row.full_name}</h3>
      <dl>
        <Row label={page.fields.name} value={row.full_name} />
        <Row label={page.fields.email} value={row.email} />
        <Row label={page.fields.phone} value={row.phone} />
        <Row label={page.fields.city} value={row.city} />
        <Row label={page.fields.birth} value={birth} />
        <Row
          label={page.fields.profession}
          value={optionText(page.professions, row.professions, row.profession_other)}
        />
        <Row label={page.fields.university} value={row.university} />
        <Row label={page.fields.department} value={row.department} />
        <Row label={page.fields.graduationYear} value={row.graduation_year} />
        <Row label={page.fields.postgraduate} value={row.postgraduate} />
        <Row label={page.fields.workplace} value={row.workplace} />
        <Row label={page.fields.experience} value={row.experience} />
        <Row label={page.fields.practiceAreas} value={row.practice_areas} />
        <Row
          label={page.fields.purpose}
          value={optionText(page.purposes, row.purposes, row.purpose_other)}
        />
        <Row label={page.fields.heard} value={heard} />
        <Row label={page.fields.motivation} value={row.motivation} />
        <div className="fp-spec-detail-row">
          <dt>{page.fields.diploma}</dt>
          <dd>
            {row.diploma_path ? (
              <Button type="button" size="sm" variant="secondary" onClick={() => onOpenDoc(row.diploma_path)}>
                {page.openFile}
              </Button>
            ) : (
              page.noFile
            )}
          </dd>
        </div>
        <div className="fp-spec-detail-row">
          <dt>{page.fields.certificate}</dt>
          <dd>
            {row.certificate_path ? (
              <Button type="button" size="sm" variant="secondary" onClick={() => onOpenDoc(row.certificate_path)}>
                {page.openFile}
              </Button>
            ) : (
              page.noFile
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
