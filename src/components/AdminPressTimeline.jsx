import { formatTestMs } from "../lib/testTime.js";
import { symbolCaption } from "../lib/symbolLabels.js";
import {
  enrichPressList,
  PRESS_ERROR_LABELS,
  pressesForTrial,
  pressStatusColor,
  pressStatusLabel,
  summarizePresses
} from "../lib/pressTimelineReport.js";
import { getProfile } from "../profiles.js";
import { ShapeView } from "../shapeUtils.jsx";
import { Badge, Card, CardHeader } from "./ui.jsx";

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

function PressRow({ p, lateMs }) {
  const sym = p.onScreen ?? (p.shownShape ? { shape: p.shownShape, color: p.shownColor } : null);
  return (
    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
      <td>{p.pressIndex}</td>
      <td style={{ fontFamily: "var(--fp-mono)" }}>{formatTestMs(p.atMs)}</td>
      <td>{p.trialNumber ?? "—"}</td>
      <td style={{ fontSize: 11, color: "#64748b" }}>{p.section ? p.section.replace(/^[^—]+—\s*/, "") : "—"}</td>
      <td>
        {sym ? <SymbolCell shape={sym.shape} color={sym.color} /> : <span style={{ color: "#94a3b8" }}>Boş ekran</span>}
      </td>
      <td>{p.isTargetOnScreen ? "Evet" : "Hayır"}</td>
      <td style={{ color: p.isWrongSymbol ? "var(--fp-danger)" : "#64748b" }}>{p.isWrongSymbol ? "Evet" : "Hayır"}</td>
      <td>{p.pressInTrial ?? "—"}</td>
      <td>{p.reactionMs != null ? Math.round(p.reactionMs) : "—"}</td>
      <td style={{ color: pressStatusColor(p), fontWeight: 500 }}>{pressStatusLabel(p, lateMs)}</td>
    </tr>
  );
}

export function AdminPressTimeline({ session, timeline, target }) {
  const logs = session?.logs ?? [];
  const presses = enrichPressList(timeline);
  const targetTrials = logs.filter((t) => t.isTarget);
  const lateMs = session?.profile_key ? getProfile(session.profile_key).lateResponseMs : 600;
  const stats = summarizePresses(presses);
  const wrongSymbolPresses = presses.filter((p) => p.isWrongSymbol || p.errorType === "false_alarm");

  if (!session) return null;

  return (
    <Card style={{ maxWidth: 1200, marginTop: 20 }}>
      <CardHeader
        title="Basış zaman çizelgesi"
        description={`${session.participant_name} · ${new Date(session.created_at).toLocaleString("tr-TR")}`}
        action={<Badge variant="primary">Yalnızca yönetici</Badge>}
      />
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
          <SymbolCell shape={target.shape} color={target.color} caption="Üçgen · Mavi (hedef)" />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
          gap: 8,
          marginBottom: 20,
          fontSize: 12
        }}
      >
        <div className="fp-metric-pill">Toplam Space: <strong>{stats.total}</strong></div>
        <div className="fp-metric-pill">İsabet: <strong>{stats.correct}</strong></div>
        <div className="fp-metric-pill">Geç: <strong>{stats.late}</strong></div>
        <div className="fp-metric-pill">Yanlış simge: <strong>{stats.falseAlarm}</strong></div>
        <div className="fp-metric-pill">Çoklu basış: <strong>{stats.multi}</strong></div>
        <div className="fp-metric-pill">Boş ekran: <strong>{stats.idle}</strong></div>
      </div>

      <h4 style={{ marginBottom: 8 }}>Tüm Space basışları (kronolojik)</h4>
      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 0 }}>
        Her Space tuşu kaydedilir; aynı denemede birden fazla basış ayrı satırdır. Yanlış simgede basıldıysa ekrandaki
        şekil ve renk gösterilir.
      </p>
      {!presses.length && <p style={{ color: "#64748b" }}>Basış kaydı yok.</p>}
      {presses.length > 0 && (
        <div className="fp-table-wrap" style={{ marginBottom: 24 }}>
          <table className="fp-table" style={{ minWidth: 960 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Basış (sn)</th>
                <th>Deneme</th>
                <th>Bölüm</th>
                <th>Ekrandaki simge</th>
                <th>Hedef mi?</th>
                <th>Yanlış simge?</th>
                <th>Basış sırası</th>
                <th>Tepki (ms)</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {presses.map((p) => (
                <PressRow key={`${p.pressIndex}-${p.atMs}`} p={p} lateMs={lateMs} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h4 style={{ marginBottom: 8 }}>Yanlış simgede basışlar ({wrongSymbolPresses.length})</h4>
      {!wrongSymbolPresses.length && <p style={{ color: "#64748b", marginBottom: 20 }}>Kayıt yok.</p>}
      {wrongSymbolPresses.length > 0 && (
        <div className="fp-table-wrap" style={{ marginBottom: 24 }}>
          <table className="fp-table" style={{ minWidth: 720 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Basış (sn)</th>
                <th>Deneme</th>
                <th>Gösterilen simge (hedef değil)</th>
                <th>Tepki (ms)</th>
                <th>Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {wrongSymbolPresses.map((p) => (
                <tr key={`wrong-${p.pressIndex}`} style={{ background: "#fff7ed" }}>
                  <td>{p.pressIndex}</td>
                  <td style={{ fontFamily: "var(--fp-mono)" }}>{formatTestMs(p.atMs)}</td>
                  <td>{p.trialNumber ?? "—"}</td>
                  <td>
                    <SymbolCell shape={p.shownShape ?? p.onScreen?.shape} color={p.shownColor ?? p.onScreen?.color} />
                  </td>
                  <td>{p.reactionMs != null ? Math.round(p.reactionMs) : "—"}</td>
                  <td style={{ color: "#b45309" }}>{PRESS_ERROR_LABELS.false_alarm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h4 style={{ marginBottom: 8 }}>Hedef simge denemeleri — tüm basışlar</h4>
      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 0 }}>
        Hedef üçgen ekrandayken yapılan her basış (çoklu basışlar ayrı satır). Basılmayan denemeler tek satırda
        “Kaçırıldı”.
      </p>
      <div className="fp-table-wrap">
        <table className="fp-table" style={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th>Deneme</th>
              <th>Hedef onset (sn)</th>
              <th>Ekrandaki simge</th>
              <th>Basış (sn)</th>
              <th>Basış #</th>
              <th>Tepki (ms)</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {targetTrials.flatMap((t) => {
              const trialPresses = pressesForTrial(presses, t.trialNumber);
              if (!trialPresses.length) {
                return [
                  <tr key={`miss-${t.trialNumber}`}>
                    <td>{t.trialNumber}</td>
                    <td style={{ fontFamily: "var(--fp-mono)" }}>{formatTestMs(t.onsetMs)}</td>
                    <td>
                      <SymbolCell shape={t.shownShape} color={t.shownColor} />
                    </td>
                    <td colSpan={3}>—</td>
                    <td style={{ color: "var(--fp-danger)" }}>Kaçırıldı (basılmadı)</td>
                  </tr>
                ];
              }
              return trialPresses.map((p, idx) => (
                <tr key={`tgt-${t.trialNumber}-${idx}`}>
                  <td>{idx === 0 ? t.trialNumber : ""}</td>
                  <td style={{ fontFamily: "var(--fp-mono)" }}>{idx === 0 ? formatTestMs(t.onsetMs) : ""}</td>
                  <td>{idx === 0 ? <SymbolCell shape={t.shownShape} color={t.shownColor} /> : ""}</td>
                  <td style={{ fontFamily: "var(--fp-mono)" }}>{formatTestMs(p.atMs)}</td>
                  <td>{p.pressInTrial}</td>
                  <td>{p.reactionMs != null ? Math.round(p.reactionMs) : "—"}</td>
                  <td style={{ color: pressStatusColor(p) }}>{pressStatusLabel(p, lateMs)}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
