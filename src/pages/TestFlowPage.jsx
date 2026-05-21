import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { ageFromBirthDate, getProfile, profileKeyFromAge } from "../profiles.js";
import { computeMetrics } from "../metrics.js";
import { ShapeView } from "../shapeUtils.jsx";
import { useAttentionTest } from "../useAttentionTest.js";
import { ReportPanel } from "../components/ReportPanel.jsx";
import { saveTestSession, uploadReportPdf } from "../services/sessions.js";
import { btnGhost, btnPrimary, card, input } from "../components/ui.js";

export default function TestFlowPage() {
  const { refreshProfile, user } = useAuth();
  const [step, setStep] = useState("form");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [gender, setGender] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState("");
  const [age, setAge] = useState("");
  const [pkey, setPkey] = useState("adult");
  const [logs, setLogs] = useState([]);
  const [spaceVerified, setSpaceVerified] = useState(false);
  const [spaceCelebrating, setSpaceCelebrating] = useState(false);
  const [savedHint, setSavedHint] = useState("");
  const [sessionId, setSessionId] = useState(null);

  const spaceDoneLock = useRef(false);
  const chartRef = useRef(null);
  const profile = getProfile(pkey);

  const onDone = useCallback(
    async (snapshot, targetSnap) => {
      setLogs(snapshot);
      setStep("report");
      setSavedHint("");
      try {
        const metrics = computeMetrics(snapshot, profile.lateResponseMs);
        const id = await saveTestSession({
          participant: { name, age, birthDate: birth, gender },
          profileKey: pkey,
          logs: snapshot,
          metrics,
          target: targetSnap
        });
        setSessionId(id);
        setSavedHint("Test kaydedildi ve hesabınıza yazıldı.");
        await refreshProfile();
      } catch (e) {
        const m = e?.message || "";
        if (m.includes("no_credits")) setSavedHint("Kayıt yapılamadı: test hakkınız kalmadı.");
        else setSavedHint(`Kayıt hatası: ${m}`);
      }
    },
    [profile.lateResponseMs, name, age, birth, gender, pkey, refreshProfile]
  );

  const { target, scene, gifs, running, start, register, resetAfterReport } = useAttentionTest(profile, {
    onFinished: onDone
  });

  const participant = { name, age, birthDate: birth, gender };

  const completeSpaceCheck = useCallback(() => {
    if (spaceCelebrating || spaceDoneLock.current) return;
    spaceDoneLock.current = true;
    setSpaceCelebrating(true);
    window.setTimeout(() => {
      setSpaceVerified(true);
      setStep("brief");
      setSpaceCelebrating(false);
      spaceDoneLock.current = false;
    }, 950);
  }, [spaceCelebrating]);

  function submitForm(e) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) {
      setErr("Ad soyad girin.");
      return;
    }
    const a = ageFromBirthDate(birth);
    if (a === null || a < 6 || a > 99) {
      setErr("Geçerli doğum tarihi (6–99 yaş).");
      return;
    }
    if (!gender) {
      setErr("Cinsiyet seçin.");
      return;
    }
    const k = profileKeyFromAge(a);
    if ((k === "child" || k === "teen") && !consent) {
      setErr("Çocuk/ergen için onam kutusunu işaretleyin.");
      return;
    }
    setAge(String(a));
    setPkey(k);
    setSpaceVerified(false);
    spaceDoneLock.current = false;
    setSpaceCelebrating(false);
    setStep("spaceCheck");
  }

  function beginTest() {
    if (!spaceVerified) return;
    setLogs([]);
    setSessionId(null);
    start();
    setStep("run");
  }

  useEffect(() => {
    if (step !== "spaceCheck" || spaceCelebrating) return undefined;
    const kd = (e) => {
      if (e.code !== "Space") return;
      const el = document.activeElement;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      completeSpaceCheck();
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [step, spaceCelebrating, completeSpaceCheck]);

  useEffect(() => {
    if (step === "spaceCheck") {
      spaceDoneLock.current = false;
      setSpaceCelebrating(false);
    }
  }, [step]);

  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <p style={{ marginBottom: 12, color: "#64748b" }}>
        <Link to="/">← Panele dön</Link>
      </p>

      {step === "form" && (
        <form onSubmit={submitForm} style={card}>
          <h2 style={{ marginTop: 0 }}>Katılımcı</h2>
          <label style={{ fontWeight: 600 }}>Ad soyad</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={input} />
          <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Doğum tarihi</label>
          <input
            type="date"
            value={birth}
            onChange={(e) => {
              setBirth(e.target.value);
              const a = ageFromBirthDate(e.target.value);
              setPkey(a == null ? "adult" : profileKeyFromAge(a));
              if (profileKeyFromAge(a) === "adult") setConsent(false);
            }}
            style={input}
          />
          <label style={{ fontWeight: 600, display: "block", marginTop: 12 }}>Cinsiyet</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={input}>
            <option value="">Seçin</option>
            <option value="Kadın">Kadın</option>
            <option value="Erkek">Erkek</option>
          </select>
          {(pkey === "child" || pkey === "teen") && (
            <label style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "flex-start" }}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>Veli / yasal temsilci onamı alındı.</span>
            </label>
          )}
          {err && <p style={{ color: "#b91c1c", padding: 12, background: "#fef2f2", borderRadius: 12 }}>{err}</p>}
          <button type="submit" style={{ ...btnPrimary, width: "100%", marginTop: 20 }}>
            Devam
          </button>
        </form>
      )}

      {step === "spaceCheck" && (
        <div className="space-screen">
          <div className="space-screen-bg" aria-hidden />
          <div className="space-screen-bg space-screen-bg--2" aria-hidden />
          <div className="space-screen-inner">
            <p className="space-screen-kicker">Adım 1 / 2 · Tuş kontrolü</p>
            {!spaceCelebrating ? (
              <>
                <h2 className="space-screen-head">Önce SPACE tuşunu deneyelim</h2>
                <p className="space-screen-sub">
                  SPACE tuşuna <strong>bir kez</strong> basın veya dokunun.
                </p>
                <button type="button" className="space-screen-touch" onClick={() => completeSpaceCheck()}>
                  Dokunarak geç
                </button>
              </>
            ) : (
              <div className="space-screen-win">
                <span className="space-screen-win-check">✓</span>
                <p className="space-screen-win-title">Tamam</p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "brief" && target && (
        <div style={{ ...card, maxWidth: 720, textAlign: "center" }}>
          <h2>Test hazır</h2>
          <p>
            {getProfile(pkey).label} — Süre: {Math.round(getProfile(pkey).durationMs / 60000)} dk
          </p>
          <ShapeView shape={target.shape} color={target.color} size={90} />
          <button type="button" onClick={beginTest} style={{ ...btnPrimary, marginTop: 20 }}>
            Teste başla
          </button>
        </div>
      )}

      {step === "run" && running && (
        <div
          role="presentation"
          onClick={register}
          onTouchStart={register}
          style={{
            width: "min(96vw, 900px)",
            height: "min(72vh, 620px)",
            background: "#fff",
            borderRadius: 20,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
        >
          {gifs.map((g) => (
            <img
              key={g.id}
              src={g.gif}
              alt=""
              onError={(e) => {
                e.target.style.display = "none";
              }}
              style={{
                position: "absolute",
                left: `${g.left}%`,
                top: `${g.top}%`,
                width: g.size,
                maxWidth: "32%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none"
              }}
            />
          ))}
          {scene && <ShapeView shape={scene.shape} color={scene.color} size={140} />}
        </div>
      )}

      {step === "report" && target && logs.length > 0 && (
        <div style={{ ...card, maxWidth: 900 }}>
          <ReportPanel
            logs={logs}
            profile={profile}
            participant={participant}
            target={target}
            chartRef={chartRef}
            savedHint={savedHint}
            persistPdf={
              sessionId && user?.id
                ? async (blob) => uploadReportPdf(user.id, sessionId, blob)
                : undefined
            }
            extraActions={
              <>
                <Link to="/" style={{ ...btnGhost, textDecoration: "none" }}>
                  Panele dön
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    resetAfterReport();
                    setLogs([]);
                    setStep("form");
                  }}
                  style={btnGhost}
                >
                  Yeni test
                </button>
              </>
            }
          />
        </div>
      )}
    </div>
  );
}
