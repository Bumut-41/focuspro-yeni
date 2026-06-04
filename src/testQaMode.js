/**
 * Geçici QA modları (canlıda test için).
 * - DISTRACTOR_ONLY_QA: yalnızca sessiz gif penceresi
 * - DISTRACTOR_SECTIONS_ONLY_QA: tüm çeldirici bölümler; çeldiricisiz (0–3 dk, kapanış) kapalı
 * Normal test: ikisi de false.
 */
export const DISTRACTOR_ONLY_QA = false;
export const DISTRACTOR_SECTIONS_ONLY_QA = true;

const MIN = 60_000;

const SILENT_GIF_ONLY = {
  child: { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1600 },
  adult: { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1100 },
  teen: { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1100 }
};

/** Çeldirici bölümler (çeldiricisiz temel + kapanış hariç) */
const DISTRACTOR_SECTIONS = {
  child: [
    { start: 3 * MIN, end: 6 * MIN, name: "3–6 dk (sessiz gif)", stimulus: 1600 },
    { start: 6 * MIN, end: 8 * MIN, name: "6–8 dk (sadece ses)", stimulus: 1600 },
    { start: 8 * MIN, end: 11 * MIN, name: "8–11 dk (sessiz + sesli gif)", stimulus: 1600 }
  ],
  adult: [
    { start: 3 * MIN, end: 6 * MIN, name: "3–6 dk (sessiz gif)", stimulus: 1100 },
    { start: 6 * MIN, end: 9 * MIN, name: "6–9 dk (sadece ses)", stimulus: 900 },
    { start: 9 * MIN, end: 12 * MIN, name: "9–12 dk (sessiz + sesli gif)", stimulus: 1200 }
  ],
  teen: [
    { start: 3 * MIN, end: 6 * MIN, name: "3–6 dk (sessiz gif)", stimulus: 1100 },
    { start: 6 * MIN, end: 9 * MIN, name: "6–9 dk (sadece ses)", stimulus: 1000 },
    { start: 9 * MIN, end: 12 * MIN, name: "9–12 dk (sessiz + sesli gif)", stimulus: 900 }
  ]
};

function shiftEventsInRange(events, start, end, offsetMs) {
  return events
    .filter((e) => e.at >= start && e.at < end)
    .map((e) => ({ ...e, at: e.at - start + offsetMs }));
}

export function applyDistractorOnlyQa(profile) {
  const seg = SILENT_GIF_ONLY[profile.key] ?? SILENT_GIF_ONLY.adult;
  const gifEvents = shiftEventsInRange(
    profile.gifEvents.filter((e) => {
      const items = e.items ?? [e];
      return items.some((it) => it.silent !== false);
    }),
    seg.start,
    seg.end,
    0
  );
  const soundEvents = [];

  return {
    ...profile,
    durationMs: seg.end - seg.start,
    phases: [
      {
        end: seg.end - seg.start,
        name: `QA — ${seg.label}`,
        stimulus: seg.stimulus,
        gap: Math.round(seg.stimulus * 0.45)
      }
    ],
    gifEvents,
    soundEvents,
    label: `${profile.label} (QA — sessiz gif)`
  };
}

export function applyDistractorSectionsOnlyQa(profile) {
  const segments = DISTRACTOR_SECTIONS[profile.key] ?? DISTRACTOR_SECTIONS.adult;
  let offset = 0;
  const gifEvents = [];
  const soundEvents = [];
  const phases = [];

  for (const seg of segments) {
    const len = seg.end - seg.start;
    gifEvents.push(...shiftEventsInRange(profile.gifEvents, seg.start, seg.end, offset));
    soundEvents.push(...shiftEventsInRange(profile.soundEvents, seg.start, seg.end, offset));
    phases.push({
      end: offset + len,
      name: `QA — ${seg.name}`,
      stimulus: seg.stimulus,
      gap: Math.round(seg.stimulus * 0.45)
    });
    offset += len;
  }

  gifEvents.sort((a, b) => a.at - b.at);
  soundEvents.sort((a, b) => a.at - b.at);

  return {
    ...profile,
    durationMs: offset,
    phases,
    gifEvents,
    soundEvents,
    label: `${profile.label} (QA — çeldirici bölümler)`
  };
}
