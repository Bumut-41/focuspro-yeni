import { useCallback, useMemo, useState } from "react";
import {
  loadAndAuditSessions,
  pickSessionsForAudit
} from "../lib/algorithmAudit.js";
import { fetchAdminPressTimeline, fetchSessionDetail } from "../services/sessions.js";
import { Alert, Badge, Button, Card, CardHeader, Stack } from "./ui.jsx";

function cell(v) {
  if (v == null || (typeof v === "number" && Number.isNaN(v))) return "—";
  return String(v);
}

function statusBadge(status) {
  if (status === "PASS") return <Badge variant="primary">PASS</Badge>;
  if (status === "NOT_VERIFIED") return <Badge variant="neutral">NOT VERIFIED</Badge>;
  return <Badge variant="neutral">FAIL</Badge>;
}

function severityColor(severity) {
  if (severity === "fail") return "var(--fp-danger)";
  if (severity === "unverified") return "#b45309";
  if (severity === "pass") return "#15803d";
  return "var(--fp-text-secondary)";
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
            <th>Dışlanan (IQR)</th>
            <th>Ort</th>
            <th>Medyan</th>
            <th>SD</th>
            <th>CV</th>
            <th>Geç n</th>
            <th>Geç % (payda)</th>
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
            <td>
              {late.ratePct != null ? `${late.ratePct}%` : "—"}
              <div className="fp-hint" style={{ margin: 0 }}>
                {late.formula || "geç / hedef"}
              </div>
            </td>
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
        {late.denominatorLabel ? ` · Payda: ${late.denominatorLabel}` : ""}
        {late.respondedOnlyPct != null
          ? ` · Bilgi: yanıtlanan hedefe göre %${late.respondedOnlyPct}`
          : ""}
      </p>
    </div>
  );
}

function SessionAuditCard({ row, dateLocale }) {
  const [open, setOpen] = useState(false);
  if (row.checks && !row.overall && (row.passFail === "FAIL" || row.passFail === "NOT_VERIFIED")) {
    return (
      <Card style={{ marginTop: 12, padding: 12 }}>
        <Stack gap={8} wrap>
          {statusBadge(row.passFail)}
          <strong>{row.name || row.sessionId}</strong>
        </Stack>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: "0.85rem" }}>
          {(row.checks || []).map((c, i) => (
            <li key={i} style={{ color: severityColor(c.severity) }}>
              [{c.code}] {c.message}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  const mismatches = row.rtCompare?.mismatches || [];
  const onlyOverall = row.rtCompare?.onlyInOverall || [];

  return (
    <Card style={{ marginTop: 12, padding: 12 }}>
      <Stack gap={10} wrap style={{ justifyContent: "space-between" }}>
        <Stack gap={8} wrap>
          {statusBadge(row.passFail)}
          <strong>{row.name}</strong>
          <span style={{ color: "var(--fp-text-secondary)", fontSize: "0.85rem" }}>
            {row.profileKey} · yaş {row.age ?? "—"} ·{" "}
            {row.createdAt ? new Date(row.createdAt).toLocaleString(dateLocale) : "—"}
          </span>
          <Badge variant="primary">algo {row.algorithmVersion}</Badge>
          <span style={{ fontSize: "0.8rem" }}>
            fail {row.failCount ?? 0} · not verified {row.unverifiedCount ?? 0} · pass {row.passCount ?? 0}
          </span>
        </Stack>
        <Button type="button" variant="secondary" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "Gizle" : "Detay"}
        </Button>
      </Stack>

      {!open ? null : (
        <div style={{ marginTop: 14 }}>
          <h3 style={{ fontSize: "0.95rem", margin: "0 0 6px" }}>Kontrol özeti (ayrı PASS/FAIL/NOT VERIFIED)</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="fp-table" style={{ fontSize: "0.78rem", width: "100%" }}>
              <thead>
                <tr>
                  <th>Kontrol</th>
                  <th>Sonuç</th>
                  <th>fail</th>
                  <th>not verified</th>
                  <th>pass</th>
                </tr>
              </thead>
              <tbody>
                {(row.checkGroups || []).map((g) => (
                  <tr key={g.id}>
                    <td>{g.label}</td>
                    <td>{statusBadge(g.passFail)}</td>
                    <td>{g.failCount}</td>
                    <td>{g.unverifiedCount}</td>
                    <td>{g.passCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>1) Genel T (tüm oturum)</h3>
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

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>
            RT genel ↔ faz ({row.rtCompare?.overallIncludedN ?? "—"} / {row.rtCompare?.phaseIncludedSum ?? "—"})
          </h3>
          <p className="fp-hint">{row.rtCompare?.note}</p>
          {mismatches.length || onlyOverall.length ? (
            <div style={{ overflowX: "auto", maxHeight: 220, overflowY: "auto" }}>
              <table className="fp-table" style={{ fontSize: "0.75rem", width: "100%" }}>
                <thead>
                  <tr>
                    <th>eventId</th>
                    <th>Faz</th>
                    <th>RT</th>
                    <th>Genel</th>
                    <th>Faz</th>
                    <th>Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {mismatches.map((m) => (
                    <tr key={`m-${m.eventId}-${m.phase}`}>
                      <td>{m.eventId}</td>
                      <td>{m.phase}</td>
                      <td>{cell(m.rtMs)}</td>
                      <td>{m.overallReason}</td>
                      <td>{m.phaseReason}</td>
                      <td>{m.detail}</td>
                    </tr>
                  ))}
                  {onlyOverall.map((m) => (
                    <tr key={`o-${m.eventId}`}>
                      <td>{m.eventId}</td>
                      <td>—</td>
                      <td>{cell(m.rtMs)}</td>
                      <td>{m.overallReason}</td>
                      <td>—</td>
                      <td>{m.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="fp-hint">Event düzeyinde genel/faz dahil farkı yok.</p>
          )}

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>Faz dilimleri (rapor yolu = V4)</h3>
          {(row.phases || []).map((p) =>
            p.empty ? (
              <p key={p.label} className="fp-hint">
                {p.label}: boş
              </p>
            ) : (
              <div key={p.label} style={{ marginBottom: 12, borderTop: "1px solid var(--fp-border)", paddingTop: 8 }}>
                <Stack gap={6} wrap>
                  <strong>{p.label}</strong>
                  <Badge variant="primary">V4</Badge>
                  <span className="fp-hint">{p.trialCount} deneme</span>
                  <span className="fp-hint">{p.lateFormula}</span>
                </Stack>
                <RtTable slice={p.v4} />
              </div>
            )
          )}

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>2) Çeldirici Δ (V4 faz − temel)</h3>
          <p className="fp-hint">
            Eşikler: etki yok ≤{row.constants?.distractorDrop?.none}, hafif ≤{row.constants?.distractorDrop?.mild}, orta ≤
            {row.constants?.distractorDrop?.moderate}. Beklenen etiket yalnız maxDrop eşiğinden; rapor etiketinden bağımsız
            yeniden hesaplanır.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table className="fp-table" style={{ fontSize: "0.78rem", width: "100%" }}>
              <thead>
                <tr>
                  <th>Faz</th>
                  <th>Rapor</th>
                  <th>Eşik beklenen</th>
                  <th>ΔA</th>
                  <th>ΔT</th>
                  <th>ΔI</th>
                  <th>ΔH</th>
                  <th>maxDrop</th>
                  <th>Tetikleyen</th>
                  <th>Hedef dışı / FA / idle / multi</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {(row.distractor?.items || []).map((it) => (
                  <tr key={it.key || it.title}>
                    <td>{it.title}</td>
                    <td>
                      {it.reportLabel} ({it.reportLevel})
                    </td>
                    <td>{it.expectedLevelKey || "—"}</td>
                    <td>{cell(it.deltasV4?.attention)}</td>
                    <td>{cell(it.deltasV4?.timing)}</td>
                    <td>{cell(it.deltasV4?.impulsivity)}</td>
                    <td>{cell(it.deltasV4?.hyperactivity)}</td>
                    <td>{cell(it.dropFromBaselineV4 != null ? Math.round(it.dropFromBaselineV4) : null)}</td>
                    <td>
                      {it.triggerIndex
                        ? `${it.triggerIndex.label} (−${cell(it.triggerIndex.drop)})`
                        : it.dataStatus === "unverified"
                          ? "NOT VERIFIED"
                          : "—"}
                    </td>
                    <td>
                      {it.rawPhase
                        ? `${cell(it.rawPhase.nonTargets)} / ${cell(it.rawPhase.falseAlarms)} / ${cell(it.rawPhase.idlePresses)} / ${cell(it.rawPhase.multiPresses)}`
                        : "—"}
                    </td>
                    <td style={{ color: it.issues?.length ? "var(--fp-danger)" : undefined }}>
                      {it.issues?.length ? it.issues.map((x) => x.code).join(", ") : "OK"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>2b) Çeldirici faz ham olay + puan</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="fp-table" style={{ fontSize: "0.78rem", width: "100%" }}>
              <thead>
                <tr>
                  <th>Faz</th>
                  <th>Hedef dışı</th>
                  <th>FA</th>
                  <th>idle</th>
                  <th>multi</th>
                  <th>A</th>
                  <th>T</th>
                  <th>I</th>
                  <th>H</th>
                </tr>
              </thead>
              <tbody>
                {(row.distractor?.items || []).map((it) => (
                  <tr key={`raw-${it.key || it.title}`}>
                    <td>{it.title}</td>
                    <td>{cell(it.rawPhase?.nonTargets)}</td>
                    <td>{cell(it.rawPhase?.falseAlarms)}</td>
                    <td>{cell(it.rawPhase?.idlePresses)}</td>
                    <td>{cell(it.rawPhase?.multiPresses)}</td>
                    <td>{cell(it.phaseV4?.attention)}</td>
                    <td>{cell(it.phaseV4?.timing)}</td>
                    <td>{cell(it.phaseV4?.impulsivity)}</td>
                    <td>{cell(it.phaseV4?.hyperactivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>3) A/I/H bağımsız ham kontrol</h3>
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
            Bağımsız A/T/I/H/G: {cell(row.classification?.independent?.scores?.A)} /{" "}
            {cell(row.classification?.independent?.scores?.T)} / {cell(row.classification?.independent?.scores?.I)} /{" "}
            {cell(row.classification?.independent?.scores?.H)} / {cell(row.classification?.independent?.scores?.overall)}
            {" · PDF: "}
            {cell(row.classification?.pdfScores?.A)} / {cell(row.classification?.pdfScores?.T)} /{" "}
            {cell(row.classification?.pdfScores?.I)} / {cell(row.classification?.pdfScores?.H)} /{" "}
            {cell(row.classification?.pdfScores?.overall)}
          </p>
          <p className="fp-hint">
            {row.classification?.independent?.formulas?.A}
            {" · "}
            {row.classification?.independent?.formulas?.I}
            {" · "}
            {row.classification?.independent?.formulas?.H}
          </p>
          <p className="fp-hint">{row.classification?.independent?.timelineNote}</p>

          <h3 style={{ fontSize: "0.95rem", margin: "16px 0 6px" }}>Bulgular</h3>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem" }}>
            {(row.checks || []).map((c, i) => (
              <li key={`${c.code}-${i}`} style={{ color: severityColor(c.severity), marginBottom: 4 }}>
                <strong>[{c.severity}]</strong> {c.group ? `${c.group} · ` : ""}
                {c.code}: {c.message}
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
      const unver = out.filter((r) => r.passFail === "NOT_VERIFIED").length;
      const passes = out.filter((r) => r.passFail === "PASS").length;
      setMsg(`${out.length} oturum · ${passes} PASS · ${unver} NOT VERIFIED · ${fails} FAIL`);
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
        description="Salt okunur. V4 ağırlıkları değişmez. RT event farkları, geç % paydası, çeldirici Δ, ayrı kontrol sonuçları ve bağımsız A/I/H burada."
      />
      <Stack gap={12} wrap>
        <label className="fp-field" style={{ minWidth: 140 }}>
          <span className="fp-label">Profil</span>
          <select className="fp-select" value={profileKey} onChange={(e) => setProfileKey(e.target.value)}>
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
      <Alert variant="info" style={{ marginTop: 12 }}>
        PASS yalnızca tüm alt kontroller geçince. Veri/timeline yoksa NOT VERIFIED (PASS sayılmaz). V4 skor formülü
        değiştirilmez.
      </Alert>
      {rows.map((row) => (
        <SessionAuditCard key={row.sessionId || row.name} row={row} dateLocale={dateLocale} />
      ))}
    </Card>
  );
}
