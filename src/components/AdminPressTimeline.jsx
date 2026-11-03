import { formatTestMs } from "../lib/testTime.js";
import { symbolCaption } from "../lib/symbolLabels.js";
import {
  enrichPressList,
  formatTempoCell,
  pressScoreImpact,
  pressStatusColor,
  pressStatusLabel,
  summarizePresses
} from "../lib/pressTimelineReport.js";
import { getProfile } from "../profiles.js";
import { ShapeView } from "../shapeUtils.jsx";
import { Badge, Button, Card, CardHeader } from "./ui.jsx";

function SymbolCell({ shape, color, caption }) {
  if (!shape || !color) {
    return <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <ShapeView shape={shape} color={color} size={44} />
      <span style={{ fontSize: 11, color: "#64748b", textAlign: "center" }}>{caption ?? symbolCaption(shape, color)}</span>
    </div>
  );
}

function scoreRound(metrics, key) {
  const v = metrics?.[key];
  if (v == null || Number.isNaN(Number(v))) return "—";
  return Math.round(Number(v));
}

function PressRow({ p, lateMs, highlight = false }) {
  const sym = p.onScreen ?? (p.shownShape ? { shape: p.shownShape, color: p.shownColor } : null);
  return (
    <tr
      style={{
        borderBottom: "1px solid #f1f5f9",
        background: highlight ? "#fef3c7" : p.errorType === "idle" ? "#f8fafc" : undefined
      }}
    >
      <td>{p.pressIndex}</td>
      <td style={{ fontFamily: "var(--fp-mono)" }}>{formatTestMs(p.atMs)}</td>
      <td>{p.trialNumber ?? "—"}</td>
      <td style={{ fontSize: 11, color: "#64748b" }}>
        {p.tempo?.shortSection || (p.section ? p.section.replace(/^[^—]+—\s*/, "") : "—")}
      </td>
      <td style={{ fontSize: 11, color: "#0f172a", maxWidth: 160 }}>{formatTempoCell(p.tempo)}</td>
      <td>
        {sym ? <SymbolCell shape={sym.shape} color={sym.color} /> : <span style={{ color: "#94a3b8" }}>Boş ekran</span>}
      </td>
      <td>{p.isTargetOnScreen ? "Evet" : "Hayır"}</td>
      <td>{p.pressInTrial ?? "—"}</td>
      <td>{p.reactionMs != null ? Math.round(p.reactionMs) : "—"}</td>
      <td style={{ color: pressStatusColor(p), fontWeight: 500 }}>{pressStatusLabel(p, lateMs)}</td>
      <td style={{ fontSize: 11, fontWeight: 600 }}>{pressScoreImpact(p, lateMs)}</td>
    </tr>
  );
}

export function AdminPressTimeline({
  session,
  timeline,
  target,
  onDownloadTestPdf,
  onDownloadPressPdf,
  pdfBusy = false
}) {
  const logs = session?.logs ?? [];
  const profile = session?.profile_key ? getProfile(session.profile_key) : null;
  const presses = enrichPressList(timeline, profile);
  const lateMs = profile?.lateResponseMs ?? 800;
  const stats = summarizePresses(presses);
  const wrongSymbolPresses = presses.filter((p) => p.isWrongSymbol || p.errorType === "false_alarm");
  const idlePresses = presses.filter((p) => p.errorType === "idle");
  const logsOk = logs.length > 0;
  const hasPresses = presses.length > 0;
  const metrics = session?.metrics || {};

  if (!session) return null;

  return (
    <Card style={{ maxWidth: 1400, marginTop: 20 }}>
      <CardHeader
        title="Basış zaman çizelgesi (detaylı)"
        description={`${session.participant_name} · ${new Date(session.created_at).toLocaleString("tr-TR")} · lateMs ${lateMs}`}
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {onDownloadTestPdf && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={pdfBusy || !logsOk}
                onClick={onDownloadTestPdf}
              >
                {pdfBusy ? "PDF…" : "Test raporu PDF"}
              </Button>
            )}
            {onDownloadPressPdf && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={pdfBusy || !hasPresses}
                onClick={onDownloadPressPdf}
              >
                {pdfBusy ? "PDF…" : "Basış raporu PDF"}
              </Button>
            )}
            <Badge variant="primary">Yalnızca yönetici</Badge>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 8,
          marginBottom: 12,
          fontSize: 12
        }}
      >
        <div className="fp-metric-pill">
          A: <strong>{scoreRound(metrics, "attentionScore")}</strong>
        </div>
        <div className="fp-metric-pill">
          T: <strong>{scoreRound(metrics, "speedScore")}</strong>
        </div>
        <div className="fp-metric-pill">
          I: <strong>{scoreRound(metrics, "impulseScore")}</strong>
        </div>
        <div className="fp-metric-pill">
          H: <strong>{scoreRound(metrics, "consistencyScore")}</strong>
        </div>
        <div className="fp-metric-pill">
          Genel: <strong>{scoreRound(metrics, "overallScore")}</strong>
        </div>
      </div>

      {target && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
            padding: 12,
            background: "var(--fp-bg)",
            borderRadius: "var(--fp-radius)",
            border: "1px solid var(--fp-border)"
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 13 }}>Aranacak hedef (Space yalnızca buna basılmalı):</span>
          <SymbolCell shape={target.shape} color={target.color} caption="Hedef" />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 8,
          marginBottom: 12,
          fontSize: 12
        }}
      >
        <div className="fp-metric-pill">
          Toplam Space: <strong>{stats.total}</strong>
        </div>
        <div className="fp-metric-pill">
          İsabet: <strong>{stats.correct}</strong>
        </div>
        <div className="fp-metric-pill">
          Geç: <strong>{stats.late}</strong>
        </div>
        <div className="fp-metric-pill">
          Yanlış simge: <strong>{stats.falseAlarm}</strong>
        </div>
        <div className="fp-metric-pill">
          Çoklu basış: <strong>{stats.multi}</strong>
        </div>
        <div className="fp-metric-pill">
          Boş ekran: <strong>{stats.idle}</strong>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#64748b", marginTop: 0 }}>
        <strong>Tempo:</strong> gösterge = simgenin ekranda kalma süresi (ms); SOA = gösterge + boşluk.{" "}
        <strong>Puan etkisi:</strong> A ok · T RT = zamanında isabet; T − = geç; I − = yanlış alarm; H − = boş/çoklu; A − =
        ihmal (hedefe basılmadı).
      </p>

      <h4 style={{ marginBottom: 8 }}>Tüm Space basışları (kronolojik)</h4>
      {!presses.length && <p style={{ color: "#64748b" }}>Basış kaydı yok.</p>}
      {presses.length > 0 && (
        <div className="fp-table-wrap" style={{ marginBottom: 24 }}>
          <table className="fp-table" style={{ minWidth: 1180 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Basış (sn)</th>
                <th>Deneme</th>
                <th>Bölüm</th>
                <th>Tempo (gösterge hızı)</th>
                <th>Ekrandaki simge</th>
                <th>Hedef?</th>
                <th>Sıra</th>
                <th>RT</th>
                <th>Durum</th>
                <th>Puan etkisi</th>
              </tr>
            </thead>
            <tbody>
              {presses.map((p) => (
                <PressRow
                  key={`${p.pressIndex}-${p.atMs}`}
                  p={p}
                  lateMs={lateMs}
                  highlight={(p.pressInTrial ?? 0) > 1 || p.errorType === "multi"}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h4 style={{ marginBottom: 8 }}>Boş ekran basışları ({idlePresses.length})</h4>
      {!idlePresses.length && <p style={{ color: "#64748b", marginBottom: 20 }}>Kayıt yok.</p>}
      {idlePresses.length > 0 && (
        <div className="fp-table-wrap" style={{ marginBottom: 24 }}>
          <table className="fp-table" style={{ minWidth: 640 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Basış</th>
                <th>Bölüm</th>
                <th>Tempo</th>
                <th>Puan etkisi</th>
              </tr>
            </thead>
            <tbody>
              {idlePresses.map((p) => (
                <tr key={`idle-${p.pressIndex}`} style={{ background: "#f8fafc" }}>
                  <td>{p.pressIndex}</td>
                  <td style={{ fontFamily: "var(--fp-mono)" }}>{formatTestMs(p.atMs)}</td>
                  <td style={{ fontSize: 11, color: "#64748b" }}>
                    {p.tempo?.shortSection || (p.section ? p.section.replace(/^[^—]+—\s*/, "") : "—")}
                  </td>
                  <td style={{ fontSize: 11 }}>{formatTempoCell(p.tempo)}</td>
                  <td style={{ fontWeight: 600 }}>{pressScoreImpact(p, lateMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h4 style={{ marginBottom: 8 }}>Yanlış simgede basışlar ({wrongSymbolPresses.length})</h4>
      {!wrongSymbolPresses.length && <p style={{ color: "#64748b", marginBottom: 20 }}>Kayıt yok.</p>}
      {wrongSymbolPresses.length > 0 && (
        <div className="fp-table-wrap" style={{ marginBottom: 24 }}>
          <table className="fp-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Basış</th>
                <th>Deneme</th>
                <th>Tempo</th>
                <th>Simge</th>
                <th>RT</th>
                <th>Durum</th>
                <th>Puan etkisi</th>
              </tr>
            </thead>
            <tbody>
              {wrongSymbolPresses.map((p) => (
                <tr key={`wrong-${p.pressIndex}`}>
                  <td>{p.pressIndex}</td>
                  <td style={{ fontFamily: "var(--fp-mono)" }}>{formatTestMs(p.atMs)}</td>
                  <td>{p.trialNumber ?? "—"}</td>
                  <td style={{ fontSize: 11 }}>{formatTempoCell(p.tempo)}</td>
                  <td>
                    <SymbolCell
                      shape={p.shownShape ?? p.onScreen?.shape}
                      color={p.shownColor ?? p.onScreen?.color}
                    />
                  </td>
                  <td>{p.reactionMs != null ? Math.round(p.reactionMs) : "—"}</td>
                  <td style={{ color: pressStatusColor(p) }}>{pressStatusLabel(p, lateMs)}</td>
                  <td style={{ fontWeight: 600 }}>{pressScoreImpact(p, lateMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
