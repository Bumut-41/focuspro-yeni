import { useCallback, useState } from "react";
import { fetchAllSessionIds } from "../services/sessions.js";
import { refreshStoredReports } from "../lib/refreshStoredReports.js";
import { Alert, Button, Card, CardHeader, Stack } from "./ui.jsx";

/**
 * Admin: mevcut oturumların V4 metrik + saklanan PDF’lerini toplu yeniler.
 * Önkoşul: supabase/admin-refresh-reports-storage.sql (admin storage yazma).
 */
export function ReportRefreshPanel({ locale = "tr" }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [log, setLog] = useState([]);

  const run = useCallback(async () => {
    if (
      !window.confirm(
        "Tüm kayıtlı test raporları V4 ile yeniden hesaplanıp Storage’a yazılacak. Devam?"
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg("Oturumlar yükleniyor…");
    setLog([]);
    try {
      const rows = await fetchAllSessionIds({ limit: 500 });
      if (!rows.length) {
        setMsg("Yenilenecek oturum yok.");
        return;
      }
      setMsg(`0 / ${rows.length}…`);
      const results = await refreshStoredReports(
        rows.map((r) => r.id),
        {
          locale,
          onProgress: (done, total, last) => {
            setMsg(
              `${done} / ${total} · son: ${last.name || last.sessionId} · ${
                last.ok ? "OK" : last.error || "hata"
              }`
            );
            setLog((prev) => [
              {
                id: last.sessionId,
                name: last.name,
                ok: last.ok,
                detail: last.ok
                  ? `V${last.version || "4"} overall=${last.overallScore}`
                  : last.error
              },
              ...prev
            ].slice(0, 40));
          }
        }
      );
      const ok = results.filter((r) => r.ok).length;
      const fail = results.length - ok;
      setMsg(`Bitti: ${ok} başarılı · ${fail} hata (toplam ${results.length}).`);
    } catch (e) {
      setMsg(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }, [locale]);

  return (
    <Card>
      <CardHeader
        title="Kayıtlı raporları V4 ile yenile"
        description="DB metriklerini aktif V4 ile günceller; katılımcı PDF’lerini (ve timeline varsa basış PDF’ini) Storage’a yeniden yazar. E-posta eki de bu dosyayı kullanır. Formül değişmez — metin / ek notlar / skor sürümü hizalanır."
      />
      <Stack gap={12}>
        <Button type="button" variant="primary" disabled={busy} onClick={run}>
          {busy ? "Yenileniyor…" : "Tüm oturumları yenile"}
        </Button>
        {msg ? <Alert variant="info">{msg}</Alert> : null}
        {log.length ? (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.85rem", maxHeight: 180, overflow: "auto" }}>
            {log.map((row) => (
              <li key={row.id} style={{ color: row.ok ? undefined : "#b42318" }}>
                {row.name || row.id}: {row.ok ? row.detail : row.detail}
              </li>
            ))}
          </ul>
        ) : null}
      </Stack>
    </Card>
  );
}
