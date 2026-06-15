/**
 * Katılımcı raporu — 8 grafik noktası (çeldirici blokları bölmeden).
 * Temel 3 dk parça + 3 çeldirici blok + kapanış 2 parça.
 */

function norm(s) {
  return (s || "").toLowerCase();
}

function isTemelMinute(name) {
  const s = norm(name);
  return /0–1|1–2|2–3|0-1|1-2|2-3/.test(s) && !s.includes("gif") && !s.includes("ses");
}

function isClosingMinute(name) {
  const s = norm(name);
  return /11–12|12–13|13–14|14–15|11-12|12-13|13-14|14-15/.test(s);
}

function isGorselBlock(name) {
  const s = norm(name);
  return s.includes("sessiz gif") && !s.includes("sesli");
}

function isIsitselBlock(name) {
  return norm(name).includes("sadece ses");
}

function isKombineBlock(name) {
  const s = norm(name);
  return s.includes("sessiz + sesli") || s.includes("sesli gif");
}

export function shortBucketLabel(name) {
  const s = (name || "").replace(/^[^—]+—\s*/, "").trim();
  return s.length > 26 ? `${s.slice(0, 24)}…` : s;
}

function bucketPhaseKey(kind, index = 0) {
  if (kind === "temel") return "temel1";
  if (kind === "gorsel") return "gorsel2";
  if (kind === "isitsel") return "isitsel2";
  if (kind === "kombine") return "kombine2";
  if (kind === "kapanis") return "temel2";
  return "temel1";
}

function moxoAxisLabel(kind, index) {
  if (kind === "temel" && index === 0) return "Temel-1";
  if (kind === "gorsel") return "Görsel";
  if (kind === "isitsel") return "İşitsel";
  if (kind === "kombine") return "Kombine";
  if (kind === "kapanis" && index === 0) return "Temel-2";
  return "";
}

/**
 * @returns {Array<{ id: string, label: string, axisLabel: string, phaseKey: string, phaseNames: string[] }>}
 */
export function buildReportPhaseBuckets(profile) {
  const phases = profile?.phases ?? [];
  const temel = phases.filter((p) => isTemelMinute(p.name));
  const gorsel = phases.filter((p) => isGorselBlock(p.name));
  const isitsel = phases.filter((p) => isIsitselBlock(p.name));
  const kombine = phases.filter((p) => isKombineBlock(p.name));
  const closing = phases.filter((p) => isClosingMinute(p.name));

  const buckets = [];

  temel.slice(0, 3).forEach((phase, i) => {
    buckets.push({
      id: `temel-${i}`,
      label: shortBucketLabel(phase.name),
      axisLabel: moxoAxisLabel("temel", i),
      phaseKey: bucketPhaseKey("temel"),
      phaseNames: [phase.name],
      kind: "temel"
    });
  });

  if (gorsel.length) {
    buckets.push({
      id: "gorsel",
      label: shortBucketLabel(gorsel[0].name),
      axisLabel: moxoAxisLabel("gorsel"),
      phaseKey: bucketPhaseKey("gorsel"),
      phaseNames: gorsel.map((p) => p.name),
      kind: "gorsel"
    });
  }

  if (isitsel.length) {
    buckets.push({
      id: "isitsel",
      label: shortBucketLabel(isitsel[0].name),
      axisLabel: moxoAxisLabel("isitsel"),
      phaseKey: bucketPhaseKey("isitsel"),
      phaseNames: isitsel.map((p) => p.name),
      kind: "isitsel"
    });
  }

  if (kombine.length) {
    buckets.push({
      id: "kombine",
      label: shortBucketLabel(kombine[0].name),
      axisLabel: moxoAxisLabel("kombine"),
      phaseKey: bucketPhaseKey("kombine"),
      phaseNames: kombine.map((p) => p.name),
      kind: "kombine"
    });
  }

  if (closing.length >= 2) {
    buckets.push({
      id: "kapanis-1",
      label: shortBucketLabel(closing[0].name),
      axisLabel: moxoAxisLabel("kapanis", 0),
      phaseKey: bucketPhaseKey("kapanis"),
      phaseNames: [closing[0].name],
      kind: "kapanis"
    });
    buckets.push({
      id: "kapanis-2",
      label:
        closing.length > 2
          ? `${shortBucketLabel(closing[1].name)} + ${shortBucketLabel(closing[closing.length - 1].name)}`
          : shortBucketLabel(closing[1].name),
      axisLabel: "",
      phaseKey: bucketPhaseKey("kapanis"),
      phaseNames: closing.slice(1).map((p) => p.name),
      kind: "kapanis"
    });
  } else if (closing.length === 1) {
    buckets.push({
      id: "kapanis-1",
      label: shortBucketLabel(closing[0].name),
      axisLabel: moxoAxisLabel("kapanis", 0),
      phaseKey: bucketPhaseKey("kapanis"),
      phaseNames: [closing[0].name],
      kind: "kapanis"
    });
  }

  return buckets;
}

export function logsForBucket(logs, bucket) {
  const names = new Set(bucket.phaseNames);
  return logs.filter((t) => names.has(t.section));
}
