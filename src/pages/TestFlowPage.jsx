import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocale } from "../i18n/LocaleContext.jsx";
import {
  ageFromBirthDate,
  getPracticeProfile,
  getProfile,
  PRACTICE_DURATION_MS,
  profileKeyFromAge,
  DISTRACTOR_GIF_SECTIONS_QA
} from "../profiles.js";
import { computeReportMetrics } from "../reportHelpers.js";
import { ShapeView } from "../shapeUtils.jsx";
import { useAttentionTest } from "../useAttentionTest.js";
import { DistractorGif } from "../components/DistractorGif.jsx";
import { TestDevTimer } from "../components/TestDevTimer.jsx";
import { ReportPanel } from "../components/ReportPanel.jsx";
import { formatPersistResult, persistAllSessionPdfs } from "../lib/persistSessionPdfs.js";
import { saveTestSession } from "../services/sessions.js";
import { Alert, Button, Card, Field, Input, Page, Select } from "../components/ui.jsx";
import { useTestChrome } from "../test/TestChromeContext.jsx";
import {
  AUDIO_CHECK_SOUND
} from "../copy/testInstructions.js";

export default function TestFlowPage() {
  const { refreshProfile, user } = useAuth();
  const { t, strings, locale } = useLocale();
  const instr = strings.test.instructions;
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
          ...computeReportMetrics(snapshot, profile.lateResponseMs, {
            pressTimeline: timeline ?? [],
            age: Number(age) || null,
            locale
          }),
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
        setSavedHint(t("test.saved"));
        await refreshProfile();
      } catch (e) {
        const m = e?.message || "";
        if (m.includes("no_credits")) setSavedHint(t("test.noCredits"));
        else setSavedHint(t("test.saveError", { msg: m }));
      }
    },
    [profile.lateResponseMs, name, age, birth, gender, pkey, refreshProfile, t, locale]
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
      setAudioPlayError(t("test.audioPlayError"));
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
    setAudioPlayError(t("test.audioRetry"));
    playAudioSample().then(() => setAudioPlayError(""));
  }, [playAudioSample, t]);

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
      setErr(t("test.errName"));
      return;
    }
    const a = ageFromBirthDate(birth);
    if (a === null || a < 6 || a > 99) {
      setErr(t("test.errBirth"));
      return;
    }
    if (!gender) {
      setErr(t("test.errGender"));
      return;
    }
    const k = profileKeyFromAge(a);
    if ((k === "child" || k === "teen") && !consent) {
      setErr(t("test.errConsent"));
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
        const result = await persistAllSessionPdfs({
          userId: user.id,
          sessionId,
          participant,
          profile,
          logs,
          target,
          pressTimeline,
          locale
        });
        if (!cancelled) {
          if (result.testSaved) pdfSavedRef.current = true;
          setSavedHint(formatPersistResult(result, pressTimeline.length > 0, locale));
        }
      } catch (e) {
        console.warn(e);
        if (!cancelled) {
          setSavedHint((prev) =>
            prev.includes("PDF")
              ? prev
              : `${prev} ${t("test.pdfSaveFailed")}`
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
          <Link to="/panel" className="fp-back-link">
            {t("common.backToPanel")}
          </Link>
        </Page>
      )}

      {step === "form" && (
        <Page narrow>
          <Card as="form" onSubmit={submitForm}>
            <h2 className="fp-card-title">{t("test.participantTitle")}</h2>
            <p className="fp-card-desc">{t("test.participantDesc")}</p>
            <Field label={t("auth.fullName")}>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label={t("auth.birthDate")}>
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
            <Field label={t("test.gender")}>
              <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">{t("common.select")}</option>
                <option value="Kadın">{t("test.genderFemale")}</option>
                <option value="Erkek">{t("test.genderMale")}</option>
              </Select>
            </Field>
            {(pkey === "child" || pkey === "teen") && (
              <label className="fp-checkbox-row">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{t("test.consent")}</span>
              </label>
            )}
            {err && <Alert variant="error">{err}</Alert>}
            <Button type="submit" variant="primary" className="fp-btn--block" style={{ marginTop: 20 }}>
              {t("common.continue")}
            </Button>
          </Card>
        </Page>
      )}

      {step === "guide" && (
        <div className="test-guide-card">
          <p className="test-guide-kicker">{t("test.stepGuide")}</p>
          <h2 className="test-guide-title">{instr.title}</h2>
          <div className="test-guide-body">
            {instr.paragraphs.map((text) => (
              <p key={text} className="test-guide-p">
                {text}
              </p>
            ))}
          </div>
          <button type="button" onClick={startPractice} className="test-guide-continue">
            {instr.practiceBtn}
          </button>
        </div>
      )}

      {step === "spaceCheck" && (
        <div className="space-screen">
          <div className="space-screen-bg" aria-hidden />
          <div className="space-screen-bg space-screen-bg--2" aria-hidden />
          <div className="space-screen-inner">
            <p className="space-screen-kicker">{t("test.stepSpace")}</p>
            {!spaceCelebrating ? (
              <>
                <h2 className="space-screen-head">{t("test.spaceTitle")}</h2>
                <p className="space-screen-sub">{t("test.spaceSub")}</p>
                <button type="button" className="space-screen-touch" onClick={() => completeSpaceCheck()}>
                  {t("test.spaceTouch")}
                </button>
              </>
            ) : (
              <div className="space-screen-win">
                <span className="space-screen-win-check">✓</span>
                <p className="space-screen-win-title">{t("common.ok")}</p>
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
            <p className="space-screen-kicker">{t("test.stepAudio")}</p>
            {!audioCelebrating ? (
              <>
                <h2 className="space-screen-head">{t("test.audioTitle")}</h2>
                <p className="space-screen-sub">{t("test.audioSub")}</p>
                <div className="space-screen-actions">
                  <button type="button" className="space-screen-confirm" onClick={() => completeAudioCheck()}>
                    {t("test.audioHeard")}
                  </button>
                  <button type="button" className="space-screen-deny" onClick={handleAudioNotHeard}>
                    {t("test.audioNotHeard")}
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
                <p className="space-screen-win-title">{t("common.ok")}</p>
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
          <p className="test-practice-banner">{t("test.practiceBanner")}</p>
        </div>
      )}

      {step === "brief" && target && practiceCompleted && (
        <div className="test-brief-card test-brief-card--instructions">
          <p className="test-brief-kicker">{t("test.stepMain")}</p>
          <h2 className="test-brief-title">{instr.title}</h2>
          <div className="test-brief-instructions">
            {instr.paragraphs.slice(0, 4).map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>{instr.briefExtra}</p>
            {DISTRACTOR_GIF_SECTIONS_QA && (
              <p className="test-brief-qa-hint" role="status">
                {t("test.qaHint")}
              </p>
            )}
            <p className="test-brief-instructions-emphasis">{instr.briefEmphasis}</p>
          </div>
          <div className="test-brief-shape">
            <ShapeView shape={target.shape} color={target.color} size={90} />
          </div>
          <button type="button" onClick={beginTest} className="test-brief-start">
            {t("test.startTest")}
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
            pressTimeline={pressTimeline}
            chartRef={chartRef}
            savedHint={savedHint}
            persistPdf={
              sessionId && user?.id
                ? async () => {
                    const result = await persistAllSessionPdfs({
                      userId: user.id,
                      sessionId,
                      participant,
                      profile,
                      logs,
                      target,
                      pressTimeline,
                      locale
                    });
                    if (result.testSaved) pdfSavedRef.current = true;
                    setSavedHint(formatPersistResult(result, pressTimeline.length > 0, locale));
                    return result.testBlob;
                  }
                : undefined
            }
            extraActions={
              <>
                <Button asLink to="/panel" variant="secondary">
                  {t("common.panelBack")}
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
                  {t("test.newTest")}
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
