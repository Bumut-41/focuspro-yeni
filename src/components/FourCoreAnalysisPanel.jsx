import { useMemo, useState } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import { profileLabel } from "../i18n/index.js";
import { includesText, inDateRange } from "../lib/listFilters.js";
import { downloadTableCsv } from "../lib/csvDownload.js";
import { RecordFilters } from "./RecordFilters.jsx";
import { Button, Card, CardHeader, DataTable, EmptyState } from "./ui.jsx";

function scoreOf(metrics, key) {
  const v = metrics?.[key];
  if (v == null || Number.isNaN(Number(v))) return null;
  return Math.round(Number(v));
}

function cell(n) {
  return n == null ? "—" : String(n);
}

/**
 * Yönetim: tüm test oturumlarının A / T / I / H / genel skorları.
 */
export function FourCoreAnalysisPanel({ sessions = [] }) {
  const { t, locale, dateLocale } = useLocale();
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const profileOptions = useMemo(
    () => ["child", "teen", "adult"].map((key) => ({ value: key, label: profileLabel(key, locale) })),
    [locale]
  );

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (!includesText(query, s.participant_name, s.owner?.full_name, s.owner?.email)) return false;
      if (profile && s.profile_key !== profile) return false;
      if (!inDateRange(s.created_at, from, to)) return false;
      return true;
    });
  }, [sessions, query, profile, from, to]);

  const active = Boolean(query.trim() || profile || from || to);

  function exportCsv() {
    downloadTableCsv(
      "focusprolab-4-temel-analiz",
      [
        t("clients.name"),
        t("admin.age"),
        t("admin.fourCore.attention"),
        t("admin.fourCore.timing"),
        t("admin.fourCore.impulse"),
        t("admin.fourCore.motor"),
        t("admin.fourCore.overall"),
        t("admin.date"),
        t("dashboard.profile")
      ],
      filtered.map((s) => {
        const m = s.metrics || {};
        return [
          s.participant_name || "",
          cell(s.participant_age),
          cell(scoreOf(m, "attentionScore")),
          cell(scoreOf(m, "speedScore")),
          cell(scoreOf(m, "impulseScore")),
          cell(scoreOf(m, "consistencyScore")),
          cell(scoreOf(m, "overallScore")),
          s.created_at ? new Date(s.created_at).toLocaleString(dateLocale) : "",
          s.profile_key ? profileLabel(s.profile_key, locale) : ""
        ];
      })
    );
  }

  return (
    <Card>
      <CardHeader
        title={t("admin.fourCore.title", { count: filtered.length })}
        description={t("admin.fourCore.desc")}
        action={
          <Button type="button" variant="secondary" size="sm" disabled={!filtered.length} onClick={exportCsv}>
            {t("admin.exportPurchases")}
          </Button>
        }
      />
      <RecordFilters
        t={t}
        query={query}
        onQuery={setQuery}
        queryPlaceholder={t("filters.participantPlaceholder")}
        profile={profile}
        onProfile={setProfile}
        profileOptions={profileOptions}
        from={from}
        onFrom={setFrom}
        to={to}
        onTo={setTo}
        active={active}
        onClear={() => {
          setQuery("");
          setProfile("");
          setFrom("");
          setTo("");
        }}
        statusText={
          active
            ? filtered.length
              ? t("filters.shown", { shown: filtered.length, total: sessions.length })
              : t("filters.noMatch")
            : t("filters.shown", { shown: sessions.length, total: sessions.length })
        }
      />
      {!sessions.length ? (
        <EmptyState title={t("admin.fourCore.empty")} />
      ) : !filtered.length ? (
        <EmptyState title={t("filters.noMatch")} />
      ) : (
        <DataTable
          columns={[
            {
              key: "participant_name",
              label: t("clients.name"),
              render: (s) => s.participant_name || "—"
            },
            {
              key: "participant_age",
              label: t("admin.age"),
              render: (s) => cell(s.participant_age)
            },
            {
              key: "attention",
              label: t("admin.fourCore.attention"),
              render: (s) => cell(scoreOf(s.metrics, "attentionScore"))
            },
            {
              key: "timing",
              label: t("admin.fourCore.timing"),
              render: (s) => cell(scoreOf(s.metrics, "speedScore"))
            },
            {
              key: "impulse",
              label: t("admin.fourCore.impulse"),
              render: (s) => cell(scoreOf(s.metrics, "impulseScore"))
            },
            {
              key: "motor",
              label: t("admin.fourCore.motor"),
              render: (s) => cell(scoreOf(s.metrics, "consistencyScore"))
            },
            {
              key: "overall",
              label: t("admin.fourCore.overall"),
              render: (s) => cell(scoreOf(s.metrics, "overallScore"))
            },
            {
              key: "created_at",
              label: t("admin.date"),
              render: (s) =>
                s.created_at ? new Date(s.created_at).toLocaleString(dateLocale) : "—"
            }
          ]}
          rows={filtered}
          rowKey={(s) => s.id}
        />
      )}
    </Card>
  );
}
