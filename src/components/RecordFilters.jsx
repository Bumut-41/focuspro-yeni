import { Button, Field, Input, Select, Stack } from "./ui.jsx";

export function RecordFilters({
  t,
  query,
  onQuery,
  queryPlaceholder,
  role,
  onRole,
  roleOptions,
  profile,
  onProfile,
  profileOptions,
  from,
  onFrom,
  to,
  onTo,
  active,
  onClear,
  statusText
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Stack wrap gap={12} style={{ alignItems: "flex-end" }}>
        <Field label={t("filters.search")} className="fp-field--grow">
          <Input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder={queryPlaceholder}
          />
        </Field>
        {roleOptions && (
          <Field label={t("filters.role")}>
            <Select value={role} onChange={(event) => onRole(event.target.value)} style={{ minWidth: 140 }}>
              <option value="">{t("filters.all")}</option>
              {roleOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {profileOptions && (
          <Field label={t("filters.profile")}>
            <Select value={profile} onChange={(event) => onProfile(event.target.value)} style={{ minWidth: 160 }}>
              <option value="">{t("filters.all")}</option>
              {profileOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {onFrom && (
          <Field label={t("filters.from")}>
            <Input type="date" value={from} onChange={(event) => onFrom(event.target.value)} />
          </Field>
        )}
        {onTo && (
          <Field label={t("filters.to")}>
            <Input type="date" value={to} onChange={(event) => onTo(event.target.value)} />
          </Field>
        )}
        {active && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t("filters.clear")}
          </Button>
        )}
      </Stack>
      {statusText && (
        <p style={{ margin: "8px 0 0", fontSize: "0.8125rem", color: "var(--fp-text-secondary)" }}>{statusText}</p>
      )}
    </div>
  );
}
