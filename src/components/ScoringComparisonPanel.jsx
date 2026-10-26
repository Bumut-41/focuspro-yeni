import { useCallback, useMemo, useState } from "react";
import { getProfile } from "../profiles.js";
import { buildScoreComparison, formatScoreCell, timingUnavailableLabel } from "../scoreComparison.js";
import { downloadV1ComparisonV2Reports } from "../lib/downloadPilotReports.js";
import { fetchAdminPressTimeline, fetchSessionDetail } from "../services/sessions.js";
import { Alert, Button, Card, CardHeader, Stack } from "./ui.jsx";

/** V1 genel skoru bu değerlere yakın oturumlar öncelikli vurgulanır. */
const HIGHLIGHT_OVERALLS = [77, 85, 94, 99];

function nearHighlight(score) {
  if (score == null || Number.isNaN(Number(score))) return false;
  const n = Math.round(Number(score));
  return HIGHLIGHT_OVERALLS.some((h) => Math.abs(n - h) <= 1);
}

function cell(v) {
  return formatScoreCell(v);
}

function deltaCell(d) {
  if (d == null || Number.isNaN(d)) return "—";
  const r = Math.round(d);
  return r > 0 ? `+${r}` : String(r);
}

function timingCell(pack) {
  if (!pack) return "—";
  if (pack.timingUnavailable) return timingUnavailableLabel(pack.timingReason);
  return cell(pack.timing);
}

/**
 * V1/V2/V3/V4 skor karşılaştırma paneli — mevcut V1 sonuçlarını değiştirmez.
 * V4 skor = V3; V4 farkı rapor dili / faz sırası / veri kalitesi.
 */
export function ScoringComparisonPanel({ sessions = [], dateLocale = "tr-TR" }) {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [filterHighlight, setFilterHighlight] = useState(true);

  const candidates = useMemo(() => {
    const list = Array.isArray(sessions) ? sessions : [];
    if (!filterHighlight) return list.slice(0, 40);
    const hit = list.filter((s) => nearHighlight(s.metrics?.overallScore));
    return hit.length ? hit : list.slice(0, 20);
  }, [sessions, filterHighlight]);

  const loadComparisons = useCallback(async () => {
    if (!candidates.length) {
      setMsg("Karşılaştırılacak oturum yok.");
      return;
    }
    setBusy(true);
    setMsg("");
    setRows([]);
    const out = [];
    try {
      for (const s of candidates) {
        try {
          const [detail, timeline] = await Promise.all([
            fetchSessionDetail(s.id),
            fetchAdminPressTimeline(s.id).catch(() => [])
          ]);
          if (!detail?.logs?.length) {
            out.push({
              id: s.id,
              name: s.participant_name || "—",
              error: "logs yok"
            });
            continue;
          }
          const profile = getProfile(detail.profile_key ?? s.profile_key ?? "adult");
          const lateMs = profile.lateResponseMs;
          const age = detail.participant_age ?? s.participant_age ?? null;
          const cmp = buildScoreComparison(detail.logs, lateMs, age, timeline ?? []);
          out.push({
            id: s.id,
            name: detail.participant_name || s.participant_name || "—",
            createdAt: detail.created_at || s.created_at,
            profileKey: detail.profile_key || s.profile_key,
            age,
            highlight: nearHighlight(cmp.v1.overall),
            detail,
            timeline: timeline ?? [],
            profile,
            ...cmp
          });
        } catch (e) {
          out.push({
            id: s.id,
            name: s.participant_name || "—",
            error: e?.message || "hesaplama hatası"
          });
        }
      }
      setRows(out);
      setMsg(`${out.filter((r) => !r.error).length} oturum karşılaştırıldı (V1/V2/V3/V4).`);
    } finally {
      setBusy(false);
    }
  }, [candidates]);

  const downloadOne = useCallback(async (row) => {
    if (!row?.detail?.logs) return;
    setBusy(true);
    setMsg("");
    try {
      await downloadV1ComparisonV2Reports({
        participant: {
          name: row.detail.participant_name,
          age: row.detail.participant_age,
          birthDate: row.detail.participant_birth_date,
          gender: row.detail.participant_gender
        },
        profile: row.profile,
        logs: row.detail.logs,
        target: row.detail.target,
        pressTimeline: row.timeline,
        locale: "tr"
      });
      setMsg(`${row.name}: V1 → karşılaştırma → V2 → V3 → V4 indirildi.`);
    } catch (e) {
      setMsg(e?.message || "PDF indirme başarısız");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <Card>
      <CardHeader
        title="V1 / V2 / V3 / V4 skor karşılaştırma (pilot)"
        description="V1 resmi. V2: 450 ms hız (pilot). V3/V4 skor aynı (hız yok; CV K=100 exploratory). V4 farkı: rapor dili, faz sırası, oturum veri kalitesi. I/H aynı. 77/85/94/99 civarı vurgulanır."
        action={
          <Stack gap={8} wrap>
            <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={filterHighlight}
                onChange={(e) => setFilterHighlight(e.target.checked)}
              />
              Önce 77/85/94/99
            </label>
            <Button type="button" variant="primary" size="sm" disabled={busy || !candidates.length} onClick={loadComparisons}>
              {busy ? "Hesaplanıyor…" : `Karşılaştır (${candidates.length})`}
            </Button>
          </Stack>
        }
      />
      {msg && <Alert variant="info">{msg}</Alert>}
      {rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="fp-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
            <thead>
              <tr>
                <th align="left">Katılımcı / yaş</th>
                <th>A</th>
                <th>I</th>
                <th>H</th>
                <th>T V1</th>
                <th>T V2</th>
                <th>T V3</th>
                <th>T V4</th>
                <th>Gen V1</th>
                <th>Gen V2</th>
                <th>Gen V3</th>
                <th>Gen V4</th>
                <th>ΔT V3−V2</th>
                <th>Med RT</th>
                <th>CV</th>
                <th>İhmal</th>
                <th>Geç</th>
                <th>FA</th>
                <th>Multi</th>
                <th>Idle</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                if (r.error) {
                  return (
                    <tr key={r.id}>
                      <td colSpan={21} style={{ color: "var(--fp-danger, #dc2626)" }}>
                        {r.name}: {r.error}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr
                    key={r.id}
                    style={r.highlight ? { background: "rgba(245, 158, 11, 0.12)" } : undefined}
                  >
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ color: "var(--fp-text-muted)", fontSize: "0.7rem" }}>
                        {r.age != null ? `yaş ${r.age}` : "—"}
                        {(r.v4?.ageBandLabel || r.v3?.ageBandLabel)
                          ? ` · ${r.v4?.ageBandLabel || r.v3.ageBandLabel}`
                          : ""}
                        {r.highlight ? " · hedef" : ""}
                      </div>
                    </td>
                    <td align="center">{cell(r.v1.attention)}</td>
                    <td align="center">{cell(r.v1.impulsivity)}</td>
                    <td align="center">{cell(r.v1.hyperactivity)}</td>
                    <td align="center">{cell(r.v1.timing)}</td>
                    <td align="center" title={r.v2.timingReason || ""}>
                      {timingCell(r.v2)}
                    </td>
                    <td align="center" title={r.v3?.timingReason || ""}>
                      {timingCell(r.v3)}
                    </td>
                    <td align="center" title={r.v4?.timingReason || "V4 skor = V3"}>
                      {timingCell(r.v4)}
                    </td>
                    <td align="center" style={{ fontWeight: 700 }}>
                      {cell(r.v1.overall)}
                    </td>
                    <td align="center" style={{ fontWeight: 700 }}>
                      {cell(r.v2.overall)}
                    </td>
                    <td align="center" style={{ fontWeight: 700 }}>
                      {cell(r.v3?.overall)}
                    </td>
                    <td align="center" style={{ fontWeight: 700 }}>
                      {cell(r.v4?.overall)}
                    </td>
                    <td align="center">{deltaCell(r.delta?.v3v2?.timing)}</td>
                    <td align="center">
                      {r.v4?.medianRt ?? r.v3?.medianRt ?? r.v2.medianRt ?? cell(r.v1.medianRt)}
                    </td>
                    <td align="center">{r.v4?.cv ?? r.v3?.cv ?? r.v2.cv ?? "—"}</td>
                    <td align="center">{r.counts.omissions}</td>
                    <td align="center">{r.counts.late}</td>
                    <td align="center">{r.counts.falseAlarms}</td>
                    <td align="center">
                      {r.counts.multiTrials}/{r.counts.multiPresses}
                    </td>
                    <td align="center">{r.counts.idlePresses}</td>
                    <td>
                      <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => downloadOne(r)}>
                        5 PDF
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
