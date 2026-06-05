import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { roleLabel } from "../lib/userRoles.js";
import { fetchMySessions, getReportPdfSignedUrl } from "../services/sessions.js";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  DataTable,
  EmptyState,
  Page,
  Stack
} from "../components/ui.jsx";

export default function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [msg, setMsg] = useState("");
  const [pdfBusy, setPdfBusy] = useState(null);

  async function openPdf(session) {
    if (!session.pdf_path) return;
    setPdfBusy(session.id);
    setMsg("");
    try {
      const url = await getReportPdfSignedUrl(session.pdf_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setMsg(e.message || "PDF açılamadı.");
    } finally {
      setPdfBusy(null);
    }
  }

  const load = useCallback(async () => {
    try {
      setSessions(await fetchMySessions());
    } catch (e) {
      setMsg(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Page wide>
      <Card>
        <CardHeader
          title={`Hoş geldiniz, ${profile?.full_name}`}
          description="Dikkat ve sürekli performans değerlendirmelerinizi buradan yönetin."
          action={<Badge variant="primary">{roleLabel(profile?.role)}</Badge>}
        />
        <Alert variant="success">
          Test bittiğinde <strong>rapor PDF otomatik kaydedilir</strong> ve aşağıdaki listeden açılabilir.
        </Alert>
        <Stack gap={12} style={{ marginTop: 20 }}>
          <Button asLink to="/test" variant="primary">
            Yeni test başlat
          </Button>
          {isAdmin && (
            <Button asLink to="/admin" variant="secondary">
              Yönetim paneli
            </Button>
          )}
        </Stack>
        {msg && (
          <Alert variant="error" style={{ marginTop: 16 }}>
            {msg}
          </Alert>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Geçmiş testleriniz"
          description="Katılımcı test raporu PDF — dashboard üzerinden görüntülenir."
        />
        {!sessions.length && <EmptyState title="Henüz kayıtlı test yok." description="İlk değerlendirmenizi başlatın." />}
        {sessions.length > 0 && (
          <DataTable
            columns={[
              {
                label: "Tarih",
                render: (s) => new Date(s.created_at).toLocaleString("tr-TR")
              },
              { key: "participant_name", label: "Katılımcı" },
              { key: "profile_key", label: "Profil" },
              {
                label: "Genel skor",
                render: (s) => (s.metrics?.overallScore != null ? Math.round(s.metrics.overallScore) : "—")
              },
              {
                label: "Test raporu",
                render: (s) =>
                  s.pdf_path ? (
                    <Button variant="primary" size="sm" disabled={pdfBusy === s.id} onClick={() => openPdf(s)}>
                      {pdfBusy === s.id ? "…" : "Raporu aç"}
                    </Button>
                  ) : (
                    <span style={{ color: "var(--fp-text-muted)", fontSize: "0.875rem" }}>
                      PDF hazırlanıyor…
                    </span>
                  )
              }
            ]}
            rows={sessions}
            rowKey={(s) => s.id}
          />
        )}
      </Card>
    </Page>
  );
}
