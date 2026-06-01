import { formatTestMs } from "../lib/testTime.js";
import { shapeLabel } from "../lib/symbolLabels.js";
import { getProfile } from "../profiles.js";
import { ShapeView } from "../shapeUtils.jsx";
import { card } from "./ui.js";

const ERROR_LABELS = {
  none: "Doğru basış",
  late: "Geç basış (hedef)",
  false_alarm: "Hatalı — hedef değilken",
  multi: "Hatalı — çoklu basış",
  idle: "Hatalı — simge yokken"
};

function SymbolCell({ shape, color, caption }) {
  if (!shape || !color) {
    return <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <ShapeView shape={shape} color={color} size={44} />
      <span style={{ fontSize: 11, color: "#64748b" }}>{caption ?? shapeLabel(shape)}</span>
    </div>
  );
}

export function AdminPressTimeline({ session, timeline, target }) {
  const logs = session?.logs ?? [];
  const presses = timeline ?? [];
  const targetTrials = logs.filter((t) => t.isTarget);
  const lateMs = session?.profile_key ? getProfile(session.profile_key).lateResponseMs : 600;
  const errors = presses.filter((p) => ["false_alarm", "multi", "idle"].includes(p.errorType));

  if (!session) return null;

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ ...card, maxWidth: 1100 }}>
        <h3 style={{ marginTop: 0 }}>Basış zaman çizelgesi (yalnızca yönetici)</h3>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>
          Katılımcı: <strong>{session.participant_name}</strong> —{" "}
          {new Date(session.created_at).toLocaleString("tr-TR")}
        </p>
        {target && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, padding: 12, background: "#f8fafc", borderRadius: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>Aranacak hedef:</span>
            <SymbolCell shape={target.shape} color={target.color} caption="Üçgen (hedef)" />
          </div>
        )}

        <h4 style={{ marginBottom: 8 }}>Hedef simge ekranda — basış zamanları</h4>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 0 }}>
          “Ekranda” = o denemede gösterilen simge. Süreler test başlangıcından itibaren (dakika:saniye).
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: 8 }}>#</th>
                <th style={{ padding: 8 }}>Hedef ekranda (sn)</th>
                <th style={{ padding: 8 }}>Ekrandaki simge</th>
                <th style={{ padding: 8 }}>Basış (sn)</th>
                <th style={{ padding: 8 }}>Tepki (ms)</th>
                <th style={{ padding: 8 }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {targetTrials.map((t) => {
                const firstPress = (t.trialPresses ?? [])[0];
                const status = !t.responded
                  ? "Kaçırıldı (basılmadı)"
                  : t.reactionTime > lateMs
                    ? "Geç"
                    : "İsabet";
                return (
                  <tr key={t.trialNumber} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 8 }}>{t.trialNumber}</td>
                    <td style={{ padding: 8, fontFamily: "monospace" }}>{formatTestMs(t.onsetMs)}</td>
                    <td style={{ padding: 8 }}>
                      <SymbolCell shape={t.shownShape} color={t.shownColor} />
                    </td>
                    <td style={{ padding: 8, fontFamily: "monospace" }}>
                      {firstPress ? formatTestMs(firstPress.atMs) : "—"}
                    </td>
                    <td style={{ padding: 8 }}>{t.responded ? Math.round(t.reactionTime) : "—"}</td>
                    <td style={{ padding: 8, color: status === "İsabet" ? "#166534" : "#b91c1c" }}>{status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h4 style={{ marginTop: 28, marginBottom: 8 }}>Hatalı veya gereksiz basışlar ({errors.length})</h4>
        {!errors.length && <p style={{ color: "#64748b" }}>Kayıtlı hatalı basış yok.</p>}
        {errors.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: 8 }}>Basış (sn)</th>
                  <th style={{ padding: 8 }}>Deneme #</th>
                  <th style={{ padding: 8 }}>Ekrandaki simge</th>
                  <th style={{ padding: 8 }}>Hedef mi?</th>
                  <th style={{ padding: 8 }}>Tür</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((p, i) => (
                  <tr key={`${p.atMs}-${i}`} style={{ borderBottom: "1px solid #f1f5f9", background: "#fff7ed" }}>
                    <td style={{ padding: 8, fontFamily: "monospace" }}>{formatTestMs(p.atMs)}</td>
                    <td style={{ padding: 8 }}>{p.trialNumber ?? "—"}</td>
                    <td style={{ padding: 8 }}>
                      {p.onScreen ? (
                        <SymbolCell shape={p.onScreen.shape} color={p.onScreen.color} />
                      ) : (
                        <span style={{ color: "#94a3b8" }}>Boş ekran</span>
                      )}
                    </td>
                    <td style={{ padding: 8 }}>{p.isTargetOnScreen ? "Evet" : "Hayır"}</td>
                    <td style={{ padding: 8, color: "#b45309" }}>{ERROR_LABELS[p.errorType] ?? p.errorType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h4 style={{ marginTop: 28, marginBottom: 8 }}>Tüm basışlar ({presses.length})</h4>
        <div style={{ overflowX: "auto", maxHeight: 360, overflowY: "auto" }}>
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left", position: "sticky", top: 0, background: "#fff" }}>
                <th style={{ padding: 6 }}>Sn</th>
                <th style={{ padding: 6 }}>#</th>
                <th style={{ padding: 6 }}>Ekran</th>
                <th style={{ padding: 6 }}>Tür</th>
              </tr>
            </thead>
            <tbody>
              {presses.map((p, i) => (
                <tr key={`all-${p.atMs}-${i}`} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: 6, fontFamily: "monospace" }}>{formatTestMs(p.atMs)}</td>
                  <td style={{ padding: 6 }}>{p.trialNumber ?? "—"}</td>
                  <td style={{ padding: 6 }}>
                    {p.onScreen ? (
                      <ShapeView shape={p.onScreen.shape} color={p.onScreen.color} size={28} />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: 6 }}>{ERROR_LABELS[p.errorType] ?? p.errorType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
