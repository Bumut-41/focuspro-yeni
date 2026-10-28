import { useCallback, useMemo, useState } from "react";
import {
  loadAndAuditSessions,
  pickSessionsForAudit
} from "../lib/algorithmAudit.js";
import { fetchAdminPressTimeline, fetchSessionDetail } from "../services/sessions.js";
import { Alert, Badge, Button, Card, CardHeader, Stack } from "./ui.jsx";

function cell(v) {
  if (v == null || Number.isNaN(Number(v))) return "—";
  return String(v);
}

function passBadge(passFail) {
  if (passFail === "PASS") return <Badge variant="primary">PASS</Badge>;
  return <Badge variant="neutral">FAIL</Badge>;
}

function RtTable({ slice }) {
  if (!slice) return null;
  const rt = slice.rt || {};
  const t = slice.timing || {};
  const late = slice.late || {};
  return (
    <div style={{ overflowX: "auto", marginTop: 8 }}>
      <table className="fp-table" style={{ fontSize: "0.78rem", width: "100%" }}>
        <thead>
          <tr>
            <th>Sürüm</th>
            <th>RT ham</th>
            <th>Dahil</th>
            <th>Dışlanan</th>
            <th>Ort</th>
            <th>Medyan</th>
            <th>SD</th>
            <th>CV</th>
            <th>Geç n</th>
            <th>Geç %</th>
            <th>Stab</th>
            <th>Geç alt</th>
            <th>T</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{slice.version}</td>
            <td>{cell(rt.rawOnTimeN)}</td>
            <td>{cell(rt.includedN)}</td>
            <td>{cell(rt.excludedN)}</td>
            <td>{cell(rt.mean)}</td>
            <td>{cell(rt.median)}</td>
            <td>{cell(rt.sd)}</td>
            <td>{rt.cv != null ? Number(rt.cv).toFixed(3) : "—"}</td>
            <td>{cell(late.count)}</td>
            <td>{late.ratePct != null ? `${late.ratePct}%` : "—"}</td>
            <td>{cell(t.stability)}</td>
            <td>{cell(t.lateSubscore)}</td>
            <td>
              <strong>{t.unavailable ? `yok (${t.reason || "—"})` : cell(t.T)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <p className="fp-hint" style={{ margin: "6px 0 0" }}>
        {t.formula}
      </p>
    </div>
  );
}

function SessionAuditCard({ row, dateLocale }) {
  const [open, setOpen] = useState(false);
  if (row.checks && !row.overall && row.passFail === "FAIL") {
    return (
      <Card style={{ marginTop: 12, padding: 12 }}>
        <Stack gap={8} wrap>
          {passBadge(row.passFail)}
          <strong>{row.name || row.sessionId}</strong>
        </Stack>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: "0.85rem" }}>
          {(row.checks || []).map((c, i) => (
            <li key={i} style={{ color: c.severity === "fail" ? "var(--fp-danger)" : undefined }}>
              [{c.code}] {c.message}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return (
    <Card style={{ marginTop: 12, padding: 12 }}>
      <Stack gap={10} wrap style={{ justifyContent: "space-between" }}>
        <Stack gap={8} wrap>
          {passBadge(row.passFail)}
          <strong>{row.name}</strong>
          <span style={{ color: "var(--fp-text-secondary)", fontSize: "0.85rem" }}>
            {row.profileKey} · yaş {row.age ?? "—"} ·{" "}
            {row.createdAt ? new Date(row.createdAt).toLocaleString(dateLocale) : "—"}
          </span>
          <Badge variant="primary">algo {row.algorithmVersion}</Badge>
          <span style={{ fontSize: "0.8rem" }}>
            fail {row.failCount ?? 0} · info {row.infoCount ?? 0}
          </span>
        </Stack>
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Gizle" : "Detay"}
        </Button>
      </Stack>

      {!open ? null : (
        <div style={{ marginTop: 14 }}>
          <h3 style={{ fontSize: "0.95rem", margin: "0 0 6px" }}>1) Genel T (tüm oturum ham veri)</h3>
          <RtTable slice={row.overall?.v4} />
          <p className="fp-hint" style={{ marginTop: 8 }}>
            PDF A/T/I/H/G: {cell(row.overall?.pdfScores?.attention)} / {cell(row.overall?.pdfScores?.timing)} /{" "}
            {cell(row.overall?.pdfScores?.impulsivity)} / {cell(row.overall?.pdfScores?.hyperactivity)} /{" "}
            {cell(row.overall?.pdfScores?.overall)}
            {" · "}
            Kayıtlı: {cell(row.overall?.storedScores?.A)} / {cell(row.overall?.storedScores?.T)} /{" "}
            {cell(row.overall?.storedScores?.I)} / {cell(row.overall?.storedScores?.H)} /{" "}
            {cell(row.overall?.storedScores?.overall)}
          </p>

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>Faz T (V1 = PDF faz yolu · V4 = genel ile aynı formül dilimde)</h3>
          {(row.phases || []).map((p) =>
            p.empty ? (
              <p key={p.label} className="fp-hint">
                {p.label}: boş
              </p>
            ) : (
              <div key={p.label} style={{ marginBottom: 12, borderTop: "1px solid var(--fp-border)", paddingTop: 8 }}>
                <Stack gap={6} wrap>
                  <strong>{p.label}</strong>
                  {p.tMismatch ? <Badge variant="neutral">T V1≠V4</Badge> : <Badge variant="primary">T uyumlu</Badge>}
                  <span className="fp-hint">{p.trialCount} deneme</span>
                </Stack>
                <p style={{ fontSize: "0.8rem", margin: "4px 0" }}>PDF faz yolu (V1)</p>
                <RtTable slice={p.v1} />
                <p style={{ fontSize: "0.8rem", margin: "8px 0 0" }}>Aynı dilim V4 formülü</p>
                <RtTable slice={p.v4} />
              </div>
            )
          )}

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>2) Çeldirici yorumları</h3>
          <p className="fp-hint">
            Eşikler: etki yok ≤{row.constants?.distractorDrop?.none}, hafif ≤{row.constants?.distractorDrop?.mild}, orta ≤
            {row.constants?.distractorDrop?.moderate} (puan düşüşü)
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="fp-table" style={{ fontSize: "0.78rem", width: "100%" }}>
              <thead>
                <tr>
                  <th>Faz</th>
                  <th>Rapor etiket</th>
                  <th>ΔA</th>
                  <th>ΔT</th>
                  <th>ΔI</th>
                  <th>ΔH</th>
                  <th>maxDrop V4</th>
                  <th>Sorun</th>
                </tr>
              </thead>
              <tbody>
                {(row.distractor?.items || []).map((it) => (
                  <tr key={it.key}>
                    <td>{it.title}</td>
                    <td>
                      {it.reportLabel} ({it.reportLevel})
                    </td>
                    <td>{cell(it.deltasV4?.attention)}</td>
                    <td>{cell(it.deltasV4?.timing)}</td>
                    <td>{cell(it.deltasV4?.impulsivity)}</td>
                    <td>{cell(it.deltasV4?.hyperactivity)}</td>
                    <td>{cell(it.dropFromBaselineV4 != null ? Math.round(it.dropFromBaselineV4) : null)}</td>
                    <td style={{ color: it.issues?.length ? "var(--fp-danger)" : undefined }}>
                      {it.issues?.length ? it.issues.map((x) => x.code).join(", ") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>3) A/I/H basış sınıflandırması</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="fp-table" style={{ fontSize: "0.78rem", width: "100%" }}>
              <thead>
                <tr>
                  <th>Olay</th>
                  <th>Endeks</th>
                  <th>Ham sayı</th>
                </tr>
              </thead>
              <tbody>
                {(row.classification?.rules || []).map((r) => (
                  <tr key={r.event}>
                    <td>{r.event}</td>
                    <td>{r.mapsTo}</td>
                    <td>{r.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.8rem", marginTop: 8 }}>
            Hesaplanan A/T/I/H: {cell(row.classification?.computedScores?.A)} /{" "}
            {cell(row.classification?.computedScores?.T)} / {cell(row.classification?.computedScores?.I)} /{" "}
            {cell(row.classification?.computedScores?.H)}
            {" · PDF: "}
            {cell(row.classification?.pdfScores?.A)} / {cell(row.classification?.pdfScores?.T)} /{" "}
            {cell(row.classification?.pdfScores?.I)} / {cell(row.classification?.pdfScores?.H)}
            {" · Δ kayıt: "}
            {cell(row.classification?.diffs?.A)} / {cell(row.classification?.diffs?.T)} /{" "}
            {cell(row.classification?.diffs?.I)} / {cell(row.classification?.diffs?.H)}
          </p>

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>Bulgular</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem" }}>
            {(row.checks || []).map((c, i) => (
              <li
                key={`${c.code}-${i}`}
                style={{
                  color: c.severity === "fail" ? "var(--fp-danger)" : "var(--fp-text-secondary)",
                  marginBottom: 4
                }}
              >
                <strong>[{c.severity}]</strong> {c.code}: {c.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/**
 * Yalnızca admin — V4 algoritma doğrulama (skor değiştirmez).
 */
export function AlgorithmAuditPanel({ sessions = [], dateLocale = "tr-TR", locale = "tr" }) {
  const [profileKey, setProfileKey] = useState("adult");
  const [limit, setLimit] = useState(6);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const candidates = useMemo(
    () => pickSessionsForAudit(sessions, profileKey, limit),
    [sessions, profileKey, limit]
  );

  const run = useCallback(async () => {
    if (!candidates.length) {
      setMsg("Bu profilde oturum yok.");
      setRows([]);
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const out = await loadAndAuditSessions(candidates, {
        fetchDetail: fetchSessionDetail,
        fetchTimeline: fetchAdminPressTimeline,
        locale
      });
      setRows(out);
      const fails = out.filter((r) => r.passFail === "FAIL").length;
      setMsg(`${out.length} oturum denetlendi · ${fails} FAIL · ${out.length - fails} PASS`);
    } catch (e) {
      setMsg(e.message || String(e));
      setRows([]);
    } finally {
      setBusy(false);
    }
  }, [candidates, locale]);

  return (
    <Card>
      <CardHeader
        title="Algoritma Doğrulama (V4)"
        description="Salt okunur denetim. Skor ağırlıkları ve kullanıcı raporları değiştirilmez. Genel T tüm oturum ham verisinden; faz T ayrıca V1 (PDF yolu) ve V4 (aynı formül dilimde) olarak gösterilir."
      />
      <Stack gap={12} wrap>
        <label className="fp-field" style={{ minWidth: 140 }}>
          <span className="fp-label">Profil</span>
          <select
            className="fp-select"
            value={profileKey}
            onChange={(e) => setProfileKey(e.target.value)}
          >
            <option value="adult">Yetişkin</option>
            <option value="teen">Ergen</option>
            <option value="child">Çocuk</option>
          </select>
        </label>
        <label className="fp-field" style={{ minWidth: 100 }}>
          <span className="fp-label">Adet</span>
          <select className="fp-select" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
        <Button type="button" variant="primary" disabled={busy || !candidates.length} onClick={run}>
          {busy ? "Denetleniyor…" : `Son ${limit} ${profileKey} oturumu denetle (${candidates.length} aday)`}
        </Button>
      </Stack>
      {msg ? (
        <Alert variant="info" style={{ marginTop: 12 }}>
          {msg}
        </Alert>
      ) : null}
      <Alert variant="warning" style={{ marginTop: 12 }}>
        Beklenen yapısal FAIL: PDF faz/çeldirici skorları hâlâ V1 motorundan; genel skorlar V4. Bu bilinçli bulgudur —
        düzeltme ayrı karar.
      </Alert>
      {rows.map((row) => (
        <SessionAuditCard key={row.sessionId || row.name} row={row} dateLocale={dateLocale} />
      ))}
    </Card>
  );
}
