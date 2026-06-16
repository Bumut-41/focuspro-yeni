import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  fetchMyPsychologistLinks,
  fetchMySessionShares,
  mapShareError,
  shareTestSession
} from "../services/psychologistShare.js";
import { Alert, Button, Field, Input, Select, Stack } from "./ui.jsx";

export function ShareSessionPanel({ sessionId, compact = false, onShared }) {
  const { t } = useLocale();
  const [links, setLinks] = useState([]);
  const [shares, setShares] = useState([]);
  const [psychologistId, setPsychologistId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!sessionId) return;
    try {
      const [linkRows, shareRows] = await Promise.all([
        fetchMyPsychologistLinks(),
        fetchMySessionShares(sessionId)
      ]);
      setLinks(linkRows);
      setShares(shareRows);
      if (linkRows.length === 1 && !psychologistId) {
        setPsychologistId(linkRows[0].psychologist_id);
      }
    } catch (e) {
      setErr(mapShareError(e.message, t));
    }
  }, [sessionId, psychologistId, t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleShare(e) {
    e.preventDefault();
    if (!consent) {
      setErr(t("share.consentRequired"));
      return;
    }
    if (!psychologistId && !email.trim() && !code.trim()) {
      setErr(t("share.shareNeedTarget"));
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await shareTestSession(sessionId, {
        psychologistId: psychologistId || null,
        email,
        code
      });
      setMsg(t("share.shareSuccess", { name: res.full_name }));
      setEmail("");
      setCode("");
      await load();
      onShared?.(res);
    } catch (e) {
      setErr(mapShareError(e.message, t));
    } finally {
      setBusy(false);
    }
  }

  if (!sessionId) return null;

  return (
    <div
      className="fp-share-panel"
      style={{
        marginTop: compact ? 0 : 24,
        padding: compact ? 12 : 16,
        border: "1px solid var(--fp-border)",
        borderRadius: "var(--fp-radius-lg)",
        background: "var(--fp-bg-subtle, var(--fp-bg))"
      }}
    >
      {!compact && <h3 className="fp-card-title" style={{ marginBottom: 8 }}>{t("share.panelTitle")}</h3>}
      {!compact && (
        <p style={{ fontSize: "0.9375rem", color: "var(--fp-text-secondary)", marginBottom: 16 }}>
          {t("share.panelDesc")}
        </p>
      )}
      {shares.length > 0 && (
        <Alert variant="success" style={{ marginBottom: 12 }}>
          {t("share.alreadyShared", {
            names: shares.map((s) => s.psychologist_name).join(", ")
          })}
        </Alert>
      )}
      {msg && (
        <Alert variant="success" style={{ marginBottom: 12 }}>
          {msg}
        </Alert>
      )}
      {err && (
        <Alert variant="error" style={{ marginBottom: 12 }}>
          {err}
        </Alert>
      )}
      <form onSubmit={handleShare}>
        <Stack gap={12}>
          {links.length > 0 && (
            <Field label={t("share.selectLinked")}>
              <Select
                value={psychologistId}
                onChange={(e) => setPsychologistId(e.target.value)}
                disabled={busy}
              >
                <option value="">{t("share.selectPlaceholder")}</option>
                {links.map((l) => (
                  <option key={l.psychologist_id} value={l.psychologist_id}>
                    {l.full_name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label={t("share.orEmail")}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="psikolog@ornek.com"
              disabled={busy}
            />
          </Field>
          <Field label={t("share.orCode")}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AB12CD34"
              maxLength={12}
              disabled={busy}
            />
          </Field>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: "0.875rem" }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
              style={{ marginTop: 3 }}
            />
            <span>{t("share.consentLabel")}</span>
          </label>
          <Button type="submit" variant="secondary" disabled={busy}>
            {busy ? "…" : t("share.shareButton")}
          </Button>
        </Stack>
      </form>
    </div>
  );
}
