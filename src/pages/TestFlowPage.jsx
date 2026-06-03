import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  ageFromBirthDate,
  getPracticeProfile,
  getProfile,
  PRACTICE_DURATION_MS,
  profileKeyFromAge,
  DISTRACTOR_ONLY_QA
} from "../profiles.js";
import { computeMetrics } from "../metrics.js";
import { ShapeView } from "../shapeUtils.jsx";
import { useAttentionTest } from "../useAttentionTest.js";
import { DistractorGif } from "../components/DistractorGif.jsx";
import { TestDevTimer } from "../components/TestDevTimer.jsx";
import { ReportPanel } from "../components/ReportPanel.jsx";
import { createAdminTimelinePdfBlob } from "../pdfAdminTimeline.js";
import { createPdfBlob } from "../pdfReport.js";
import { persistAdminReportPdf, persistSessionReportPdf, saveTestSession } from "../services/sessions.js";
import { Alert, Button, Card, Field, Input, Page, Select } from "../components/ui.jsx";
import { useTestChrome } from "../test/TestChromeContext.jsx";
import {
  AUDIO_CHECK_SOUND,
  TEST_INSTRUCTION_PARAGRAPHS,
  TEST_INSTRUCTION_TITLE,
  GUIDE_PRACTICE_BUTTON
} from "../copy/testInstructions.js";

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
  const [pressTimeline, setPressTimeline] = useState([]);
  const [spaceVerified, setSpaceVerified] = useState(false);
  const [spaceCelebrating, setSpaceCelebrating] = useState(false);
  const [audioVerified, setAudioVerified] = useState(false);
  const [audioCelebrating, setAudioCelebrating] = useState(false);
  const [audioPlayError, setAudioPlayError] = useState("");
  const [savedHint, setSavedHint] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const [activeTestProfile, setActiveTestProfile] = useState(() => getProfile(pkey));

  const spaceDoneLock = useRef(false);
  const pendingPracticeStart = useRef(false);
  const pendingMainStart = useRef(false);
  const audioDoneLock = useRef(false);
  const audioRef = useRef(null);
  const chartRef = useRef(null);
  const pdfSavedRef = useRef(false);
  const profile = getProfile(pkey);
  const { setImmersive } = useTestChrome();

  useEffect(() => {
    if (["form", "spaceCheck", "audioCheck", "guide"].includes(step)) {
      setActiveTestProfile(getProfile(pkey));
    }
  }, [pkey, step]);

  const isImmersiveStep =
    step === "guide" ||
    step === "spaceCheck" ||
    step === "audioCheck" ||
    step === "brief" ||
    step === "practiceRun" ||
    step === "run";

  useEffect(() => {
    setImmersive(isImmersiveStep);
    return () => setImmersive(false);
  }, [isImmersiveStep, setImmersive]);

  const onDone = useCallback(
    async (snapshot, targetSnap, timeline) => {
      setLogs(snapshot);
      setPressTimeline(timeline ?? []);
      setStep("report");
      setSavedHint("");
      try {
        const metrics = {
          ...computeMetrics(snapshot, profile.lateResponseMs),
          lateResponseMs: profile.lateResponseMs
        };
        const id = await saveTestSession({
          participant: { name, age, birthDate: birth, gender },
          profileKey: pkey,
          logs: snapshot,
          metrics,
          target: targetSnap,
          pressTimeline: timeline ?? []
        });
        setSessionId(id);
        pdfSavedRef.current = false;
        setSavedHint("Test kaydedildi. PDF raporu hazırlanıyor…");
        await refreshProfile();
      } catch (e) {
        const m = e?.message || "";
        if (m.includes("no_credits")) setSavedHint("Kayıt yapılamadı: test hakkınız kalmadı.");
        else setSavedHint(`Kayıt hatası: ${m}`);
      }
    },
    [profile.lateResponseMs, name, age, birth, gender, pkey, refreshProfile]
  );

  const handleTestFinished = useCallback(
    (snapshot, targetSnap, timeline) => {
      if (activeTestProfile.isPractice) {
        setPracticeCompleted(true);
        setActiveTestProfile(getProfile(pkey));
        setStep("brief");
        return;
      }
      onDone(snapshot, targetSnap, timeline);
    },
    [activeTestProfile.isPractice, pkey, onDone]
  );

  const { target, scene, gifs, running, testElapsedMs, testDurationMs, start, register, resetAfterReport } =
    useAttentionTest(activeTestProfile, {
      onFinished: handleTestFinished
    });

  const participant = { name, age, birthDate: birth, gender };

  const playAudioSample = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(AUDIO_CHECK_SOUND);
      audioRef.current.volume = 0.65;
    }
    audioRef.current.currentTime = 0;
    return audioRef.current.play().catch(() => {
      setAudioPlayError(
        "Ses otomatik çalınamadı. «Sesi duymadım» ile tekrar deneyin; ses seviyesini ve kulaklığı kontrol edin."
      );
      return Promise.reject();
    });
  }, []);

  const completeSpaceCheck = useCallback(() => {
    if (spaceCelebrating || spaceDoneLock.current) return;
    spaceDoneLock.current = true;
    setAudioPlayError("");
    playAudioSample().catch(() => {});
    setSpaceCelebrating(true);
    window.setTimeout(() => {
      setSpaceVerified(true);
      setStep("audioCheck");
      setSpaceCelebrating(false);
      spaceDoneLock.current = false;
    }, 950);
  }, [spaceCelebrating, playAudioSample]);

  const handleAudioNotHeard = useCallback(() => {
    setAudioPlayError("Ses duyulamadıysa sesi açın veya kulaklığı kontrol edin. Test sesi tekrar çalınıyor…");
    playAudioSample().then(() => setAudioPlayError(""));
  }, [playAudioSample]);

  const completeAudioCheck = useCallback(() => {
    if (audioCelebrating || audioDoneLock.current) return;
    audioDoneLock.current = true;
    setAudioCelebrating(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.setTimeout(() => {
      setAudioVerified(true);
      setStep("guide");
      setAudioCelebrating(false);
      audioDoneLock.current = false;
    }, 950);
  }, [audioCelebrating]);

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
    setAudioVerified(false);
    setPracticeCompleted(false);
    spaceDoneLock.current = false;
    audioDoneLock.current = false;
    setSpaceCelebrating(false);
    setAudioCelebrating(false);
    setAudioPlayError("");
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setStep("spaceCheck");
  }

  function startPractice() {
    if (!spaceVerified || !audioVerified) return;
    setActiveTestProfile(getPracticeProfile(getProfile(pkey)));
    pendingPracticeStart.current = true;
    setStep("practiceRun");
  }

  function beginTest() {
    if (!spaceVerified || !audioVerified || !practiceCompleted) return;
    setLogs([]);
    setSessionId(null);
    pdfSavedRef.current = false;
    setActiveTestProfile(getProfile(pkey));
    pendingMainStart.current = true;
    setStep("run");
  }

  useEffect(() => {
    if (step === "practiceRun" && pendingPracticeStart.current) {
      pendingPracticeStart.current = false;
      start();
    }
  }, [step, start, activeTestProfile]);

  useEffect(() => {
    if (step === "run" && pendingMainStart.current && !activeTestProfile.isPractice) {
      pendingMainStart.current = false;
      start();
    }
  }, [step, start, activeTestProfile]);

  // Test bitince rapor ekranında PDF'i otomatik üret ve sisteme kaydet.
  useEffect(() => {
    if (step !== "report" || !sessionId || !user?.id || !logs.length || !target || pdfSavedRef.current) {
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const chartImage = chartRef?.current?.canvas?.toDataURL("image/png", 0.92);
        const blob = await createPdfBlob({
          participant,
          profile,
          logs,
          target,
          chartImage
        });
        await persistSessionReportPdf(user.id, sessionId, blob);
        if (pressTimeline.length) {
          const adminBlob = await createAdminTimelinePdfBlob({
            session: {
              id: sessionId,
              participant_name: name,
              participant_age: Number(age) || null,
              profile_key: pkey,
              created_at: new Date().toISOString(),
              logs
            },
            timeline: pressTimeline,
            target
          });
          await persistAdminReportPdf(user.id, sessionId, adminBlob);
        }
        if (!cancelled) {
          pdfSavedRef.current = true;
          setSavedHint("Test ve PDF raporları hesabınıza kaydedildi.");
        }
      } catch (e) {
        console.warn(e);
        if (!cancelled) {
          setSavedHint((prev) =>
            prev.includes("PDF")
              ? prev
              : `${prev} PDF kaydı başarısız; «PDF indir» ile tekrar deneyebilirsiniz.`
          );
        }
      }
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [step, sessionId, user?.id, logs, target, profile, participant, pressTimeline, name, age, pkey]);

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
    if (step !== "brief") return undefined;
    const kd = (e) => {
      if (e.code !== "Space") return;
      const el = document.activeElement;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      beginTest();
    };
    window.addEventListener("keydown", kd);
    return () => window.removeEventListener("keydown", kd);
  }, [step, beginTest]);

  useEffect(() => {
    if (step === "spaceCheck") {
      spaceDoneLock.current = false;
      setSpaceCelebrating(false);
    }
    if (step === "audioCheck") {
      audioDoneLock.current = false;
      setAudioCelebrating(false);
      setAudioPlayError("");
      const t = window.setTimeout(() => {
        playAudioSample().catch(() => {});
      }, 350);
      return () => window.clearTimeout(t);
    }
    if (step !== "audioCheck" && audioRef.current) {
      audioRef.current.pause();
    }
    return undefined;
  }, [step, playAudioSample]);

  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div
      className={isImmersiveStep ? "test-flow test-flow--immersive" : "test-flow"}
      style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {isImmersiveStep && (
        <TestDevTimer
          elapsedMs={(step === "run" || step === "practiceRun") && running ? testElapsedMs : 0}
          durationMs={step === "practiceRun" ? PRACTICE_DURATION_MS : profile.durationMs}
        />
      )}

      {!isImmersiveStep && (
        <Page narrow>
          <Link to="/" className="fp-back-link">
            ← Panele dön
          </Link>
        </Page>
      )}

      {step === "form" && (
        <Page narrow>
          <Card as="form" onSubmit={submitForm}>
            <h2 className="fp-card-title">Katılımcı bilgileri</h2>
            <p className="fp-card-desc">Değerlendirme oturumu için katılımcı kaydı.</p>
            <Field label="Ad soyad">
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Doğum tarihi">
              <Input
                type="date"
                value={birth}
                onChange={(e) => {
                  setBirth(e.target.value);
                  const a = ageFromBirthDate(e.target.value);
                  setPkey(a == null ? "adult" : profileKeyFromAge(a));
                  if (profileKeyFromAge(a) === "adult") setConsent(false);
                }}
                required
              />
            </Field>
            <Field label="Cinsiyet">
              <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Seçin</option>
                <option value="Kadın">Kadın</option>
                <option value="Erkek">Erkek</option>
              </Select>
            </Field>
            {(pkey === "child" || pkey === "teen") && (
              <label className="fp-checkbox-row">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>Veli / yasal temsilci onamı alındı.</span>
              </label>
            )}
            {err && <Alert variant="error">{err}</Alert>}
            <Button type="submit" variant="primary" className="fp-btn--block" style={{ marginTop: 20 }}>
              Devam
            </Button>
          </Card>
        </Page>
      )}

      {step === "guide" && (
        <div className="test-guide-card">
          <p className="test-guide-kicker">Adım 3 / 5 · Yönerge</p>
          <h2 className="test-guide-title">{TEST_INSTRUCTION_TITLE}</h2>
          <div className="test-guide-body">
            {TEST_INSTRUCTION_PARAGRAPHS.map((text) => (
              <p key={text} className="test-guide-p">
                {text}
              </p>
            ))}
          </div>
          <button type="button" onClick={startPractice} className="test-guide-continue">
            {GUIDE_PRACTICE_BUTTON}
          </button>
        </div>
      )}

      {step === "spaceCheck" && (
        <div className="space-screen">
          <div className="space-screen-bg" aria-hidden />
          <div className="space-screen-bg space-screen-bg--2" aria-hidden />
          <div className="space-screen-inner">
            <p className="space-screen-kicker">Adım 1 / 5 · Tuş kontrolü</p>
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

      {step === "audioCheck" && (
        <div className="space-screen">
          <div className="space-screen-bg" aria-hidden />
          <div className="space-screen-bg space-screen-bg--2" aria-hidden />
          <div className="space-screen-inner">
            <p className="space-screen-kicker">Adım 2 / 5 · Ses kontrolü</p>
            {!audioCelebrating ? (
              <>
                <h2 className="space-screen-head">Şimdi sesi kontrol edelim</h2>
                <p className="space-screen-sub">
                  Kısa bir test sesi otomatik çalınır. Sesi net duyduysanız yeşil, duymadıysanız kırmızı butona
                  basın.
                </p>
                <div className="space-screen-actions">
                  <button type="button" className="space-screen-confirm" onClick={() => completeAudioCheck()}>
                    Sesi duydum
                  </button>
                  <button type="button" className="space-screen-deny" onClick={handleAudioNotHeard}>
                    Sesi duymadım
                  </button>
                </div>
                {audioPlayError && (
                  <p className="space-screen-error" role="alert">
                    {audioPlayError}
                  </p>
                )}
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

      {step === "practiceRun" && running && (
        <div
          className="test-run-stage"
          role="presentation"
          onClick={register}
          onTouchStart={register}
        >
          {scene && <ShapeView shape={scene.shape} color={scene.color} size={140} />}
          <p className="test-practice-banner">Deneme — 30 sn (çeldirici yok, kayıt yok)</p>
        </div>
      )}

      {step === "brief" && target && practiceCompleted && (
        <div className="test-brief-card">
          <p className="test-brief-kicker">Adım 5 / 5 · Asıl test</p>
          <h2 className="test-brief-title">Deneme tamamlandı</h2>
          <p className="test-brief-meta">
            {getProfile(pkey).label} — Süre: {Math.round(getProfile(pkey).durationMs / 60000)} dk
          </p>
          {DISTRACTOR_ONLY_QA && (
            <p className="test-brief-qa-hint" role="status">
              Geçici mod: yalnızca «sessiz + sesli gif» (kombine) bölümü test ediliyor.
            </p>
          )}
          <div className="test-brief-shape">
            <ShapeView shape={target.shape} color={target.color} size={90} />
          </div>
          <button type="button" onClick={beginTest} className="test-brief-start">
            Teste başla
          </button>
        </div>
      )}

      {step === "run" && running && (
        <div
          className="test-run-stage"
          role="presentation"
          onClick={register}
          onTouchStart={register}
        >
          {gifs.map((g) => (
            <DistractorGif
              key={g.id}
              item={g}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}
          {scene && <ShapeView shape={scene.shape} color={scene.color} size={140} />}
        </div>
      )}

      {step === "report" && target && logs.length > 0 && (
        <Page wide>
          <Card style={{ maxWidth: 900 }}>
          <ReportPanel
            logs={logs}
            profile={profile}
            participant={participant}
            target={target}
            chartRef={chartRef}
            savedHint={savedHint}
            persistPdf={
              sessionId && user?.id
                ? async (blob) => {
                    await persistSessionReportPdf(user.id, sessionId, blob);
                    pdfSavedRef.current = true;
                  }
                : undefined
            }
            extraActions={
              <>
                <Button asLink to="/" variant="secondary">
                  Panele dön
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    resetAfterReport();
                    setLogs([]);
                    setPressTimeline([]);
                    setStep("form");
                  }}
                >
                  Yeni test
                </Button>
              </>
            }
          />
          </Card>
        </Page>
      )}
    </div>
  );
}
