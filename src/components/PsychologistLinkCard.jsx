import { useCallback, useEffect, useState } from "react";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  fetchMyPsychologistLinks,
  linkPsychologist,
  mapShareError,
  unlinkPsychologist
} from "../services/psychologistShare.js";
import { Alert, Button, Card, CardHeader, Field, Input, Stack } from "./ui.jsx";

export function PsychologistLinkCard() {
  const { t } = useLocale();
  const [links, setLinks] = useState([]);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setLinks(await fetchMyPsychologistLinks());
    } catch (e) {
      setErr(mapShareError(e.message, t));
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleLink(e) {
    e.preventDefault();
    if (!email.trim() && !code.trim()) {
      setErr(t("share.linkNeedInput"));
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await linkPsychologist({ email, code });
      setMsg(t("share.linkSuccess", { name: res.full_name }));
      setEmail("");
      setCode("");
      await load();
    } catch (e) {
      setErr(mapShareError(e.message, t));
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink(psychologistId, name) {
    if (!window.confirm(t("share.unlinkConfirm", { name }))) return;
    setBusy(true);
    setErr("");
    try {
      await unlinkPsychologist(psychologistId);
      setMsg(t("share.unlinkSuccess"));
      await load();
    } catch (e) {
      setErr(mapShareError(e.message, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title={t("share.linkCardTitle")}
        description={t("share.linkCardDesc")}
      />
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
      <form onSubmit={handleLink}>
        <Stack gap={12}>
          <Field label={t("share.psychEmail")} hint={t("share.psychEmailHint")}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="psikolog@ornek.com"
              disabled={busy}
            />
          </Field>
          <Field label={t("share.psychCode")} hint={t("share.psychCodeHint")}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="AB12CD34"
              maxLength={12}
              disabled={busy}
            />
          </Field>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "…" : t("share.linkButton")}
          </Button>
        </Stack>
      </form>
      {links.length > 0 && (
        <ul className="fp-share-links" style={{ marginTop: 20, padding: 0, listStyle: "none" }}>
          {links.map((l) => (
            <li
              key={l.psychologist_id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 0",
                borderTop: "1px solid var(--fp-border)"
              }}
            >
              <div>
                <strong>{l.full_name}</strong>
                {l.email && (
                  <div style={{ fontSize: "0.875rem", color: "var(--fp-text-muted)" }}>{l.email}</div>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => handleUnlink(l.psychologist_id, l.full_name)}
              >
                {t("share.unlink")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
