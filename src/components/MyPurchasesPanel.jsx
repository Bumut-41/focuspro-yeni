import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { fetchIndividualPurchases, fetchSpecialistPurchases, formatTl } from "../services/purchases.js";
import { Alert, Card, CardHeader, DataTable } from "./ui.jsx";

export function MyPurchasesPanel() {
  const { profile } = useAuth();
  const { t, locale, dateLocale } = useLocale();
  const role = profile?.role;
  const isBuyer = role === "individual" || role === "psychologist";
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!isBuyer) return;
    let cancelled = false;
    const load = role === "psychologist" ? fetchSpecialistPurchases(200) : fetchIndividualPurchases(200);
    load
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch(() => {
        if (!cancelled) setError(t("dashboard.myPurchasesFailed"));
      });
    return () => {
      cancelled = true;
    };
  }, [isBuyer, role, t]);

  if (!isBuyer) return null;

  const selected = rows.find((row) => row.id === selectedId) || null;
  const detail = selected
    ? [
        [t("admin.date"), new Date(selected.created_at).toLocaleString(dateLocale)],
        [t("admin.name"), selected.invoice_name],
        [
          t("admin.invoiceType"),
          selected.invoice_type === "company" ? t("purchase.typeCompany") : t("purchase.typeIndividual")
        ],
        [t("admin.taxId"), selected.tax_id],
        [t("purchase.taxOffice"), selected.tax_office],
        [t("admin.email"), selected.email],
        [t("admin.phone"), selected.phone],
        [t("admin.city"), selected.city],
        [t("purchase.district"), selected.district],
        [t("purchase.address"), selected.address],
        [t("purchase.quantity"), selected.quantity],
        [t("purchase.unit"), formatTl(selected.unit_price_tl, locale)],
        ...(role === "psychologist"
          ? [
              [t("purchase.net"), formatTl(selected.net_tl, locale)],
              [t("admin.vatRate"), `%${selected.vat_rate}`],
              [t("admin.vatAmount"), formatTl(selected.vat_tl, locale)],
              [t("purchase.gross"), formatTl(selected.total_tl, locale)]
            ]
          : [[t("purchase.total"), formatTl(selected.total_tl, locale)]])
      ]
    : [];

  return (
    <Card style={{ marginTop: 20 }}>
      <CardHeader
        title={t("dashboard.myPurchasesTitle", { count: rows.length })}
        description={t("dashboard.myPurchasesDesc")}
      />
      {error ? <Alert variant="error">{error}</Alert> : null}
      {!error && !rows.length ? (
        <p style={{ margin: 0, color: "var(--fp-text-secondary)" }}>{t("dashboard.myPurchasesEmpty")}</p>
      ) : null}
      {rows.length > 0 ? (
        <DataTable
          columns={[
            {
              label: t("admin.date"),
              render: (row) => new Date(row.created_at).toLocaleString(dateLocale)
            },
            { key: "invoice_name", label: t("admin.name") },
            { key: "quantity", label: t("purchase.quantity") },
            {
              label: role === "psychologist" ? t("purchase.gross") : t("purchase.total"),
              render: (row) => formatTl(row.total_tl, locale)
            }
          ]}
          rows={rows}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelectedId(row.id === selectedId ? null : row.id)}
          activeKey={selectedId}
        />
      ) : null}
      {selected ? (
        <div className="fp-spec-detail">
          <dl>
            {detail.map(([label, value]) => (
              <div key={label} className="fp-spec-detail-row">
                <dt>{label}</dt>
                <dd>{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </Card>
  );
}
