import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { includesText } from "../lib/listFilters.js";
import { deleteClient, fetchAllClientsForAdmin } from "../services/clients.js";
import { Alert, Button, Card, CardHeader, DataTable, EmptyState, Field, Input, Stack } from "./ui.jsx";

export function AdminClientsPanel() {
  const { t, dateLocale } = useLocale();
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchAllClientsForAdmin());
      setMsg("");
    } catch (e) {
      setMsg(e?.message || t("clients.errSave"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return rows;
    return rows.filter((c) =>
      includesText(
        q,
        c.full_name,
        c.email,
        c.phone,
        c.specialist?.full_name,
        c.specialist?.email
      )
    );
  }, [rows, query]);

  async function onDelete(client) {
    if (!window.confirm(t("clients.deleteConfirm", { name: client.full_name }))) return;
    setBusyId(client.id);
    setMsg("");
    try {
      await deleteClient(client.id);
      setRows((prev) => prev.filter((r) => r.id !== client.id));
      setMsg(t("clients.deleted"));
    } catch (e) {
      setMsg(e?.message || t("clients.errDelete"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader title={t("clients.adminTitle")} description={t("clients.adminDesc")} />
      <Field label={t("clients.search")}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("clients.searchPlaceholder")}
          autoComplete="off"
        />
      </Field>
      {msg ? (
        <Alert variant="info" style={{ marginTop: 12 }}>
          {msg}
        </Alert>
      ) : null}
      {loading ? (
        <p style={{ marginTop: 12 }}>{t("common.wait")}</p>
      ) : !filtered.length ? (
        <EmptyState title={t("clients.listEmpty")} description={query ? t("clients.searchNoMatch") : t("clients.listEmptyDesc")} />
      ) : (
        <div style={{ marginTop: 16 }}>
          <DataTable
            columns={[
              { key: "full_name", label: t("clients.name") },
              {
                key: "email",
                label: t("clients.email"),
                render: (c) => c.email || "—"
              },
              {
                key: "phone",
                label: t("clients.phone"),
                render: (c) => c.phone || "—"
              },
              {
                key: "specialist",
                label: t("clients.specialist"),
                render: (c) => c.specialist?.full_name || c.specialist?.email || "—"
              },
              {
                key: "created_at",
                label: t("admin.date"),
                render: (c) =>
                  c.created_at
                    ? new Date(c.created_at).toLocaleDateString(dateLocale)
                    : "—"
              },
              {
                label: "",
                render: (c) => (
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={busyId === c.id}
                    onClick={() => onDelete(c)}
                  >
                    {busyId === c.id ? t("common.wait") : t("common.delete")}
                  </Button>
                )
              }
            ]}
            rows={filtered}
            rowKey={(c) => c.id}
          />
        </div>
      )}
      {!loading && rows.length ? (
        <Stack style={{ marginTop: 8 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--fp-text-muted)" }}>
            {t("clients.adminCount", { shown: filtered.length, total: rows.length })}
          </span>
        </Stack>
      ) : null}
    </Card>
  );
}
