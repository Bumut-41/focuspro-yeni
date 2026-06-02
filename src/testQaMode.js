/**
 * Geçici QA: çeldiricisiz fazlar (0–3 dk, kapanış vb.) testten çıkarılır;
 * yalnızca sessiz gif / sadece ses / kombine pencereler arka arkaya oynatılır.
 * Normal teste dönmek için DISTRACTOR_ONLY_QA = false yapın.
 */
export const DISTRACTOR_ONLY_QA = true;

const MIN = 60_000;

/** Orijinal profildeki çeldirici pencereleri (ms). */
const SEGMENTS = {
  child: [
    { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1600 },
    { start: 6 * MIN, end: 8 * MIN, label: "6–8 dk (sadece ses)", stimulus: 1600 },
    { start: 8 * MIN, end: 11 * MIN, label: "8–11 dk (sessiz + sesli gif)", stimulus: 1600 }
  ],
  adult: [
    { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1100 },
    { start: 6 * MIN, end: 9 * MIN, label: "6–9 dk (sadece ses)", stimulus: 900 },
    { start: 9 * MIN, end: 12 * MIN, label: "9–12 dk (sessiz + sesli gif)", stimulus: 1200 }
  ],
  teen: [
    { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1100 },
    { start: 6 * MIN, end: 9 * MIN, label: "6–9 dk (sadece ses)", stimulus: 1000 },
    { start: 9 * MIN, end: 12 * MIN, label: "9–12 dk (sessiz + sesli gif)", stimulus: 900 }
  ]
};

function shiftEvents(events, start, end, offset) {
  return events
    .filter((e) => e.at >= start && e.at < end)
    .map((e) => ({ ...e, at: e.at - start + offset }));
}

export function applyDistractorOnlyQa(profile) {
  const segments = SEGMENTS[profile.key] ?? SEGMENTS.adult;
  let offset = 0;
  const gifEvents = [];
  const soundEvents = [];
  const phases = [];

  for (const seg of segments) {
    const len = seg.end - seg.start;
    gifEvents.push(...shiftEvents(profile.gifEvents, seg.start, seg.end, offset));
    soundEvents.push(...shiftEvents(profile.soundEvents, seg.start, seg.end, offset));
    offset += len;
    phases.push({
      end: offset,
      name: `QA — ${seg.label}`,
      stimulus: seg.stimulus,
      gap: Math.round(seg.stimulus * 0.45)
    });
  }

  gifEvents.sort((a, b) => a.at - b.at);
  soundEvents.sort((a, b) => a.at - b.at);

  return {
    ...profile,
    durationMs: offset,
    phases,
    gifEvents,
    soundEvents,
    label: `${profile.label} (QA — sadece çeldirici)`
  };
}
