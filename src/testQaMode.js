/**
 * Geçici QA modları.
 * Normal teste dönmek için DISTRACTOR_ONLY_QA = false yapın.
 *
 * true iken yalnızca:
 * - Sadece ses
 * - Sessiz + sesli gif (kombine)
 * pencereleri arka arkaya oynatılır (temel, sessiz gif, kapanış yok).
 */
export const DISTRACTOR_ONLY_QA = true;

const MIN = 60_000;

/** Sadece ses + kombine pencereler (ms). */
const SOUND_AND_COMBINED_SEGMENTS = {
  child: [
    { start: 6 * MIN, end: 8 * MIN, label: "6–8 dk (sadece ses)", stimulus: 1600, kind: "sound" },
    { start: 8 * MIN, end: 11 * MIN, label: "8–11 dk (sessiz + sesli gif)", stimulus: 1600, kind: "combined" }
  ],
  adult: [
    { start: 6 * MIN, end: 9 * MIN, label: "6–9 dk (sadece ses)", stimulus: 900, kind: "sound" },
    { start: 9 * MIN, end: 12 * MIN, label: "9–12 dk (sessiz + sesli gif)", stimulus: 1200, kind: "combined" }
  ],
  teen: [
    { start: 6 * MIN, end: 9 * MIN, label: "6–9 dk (sadece ses)", stimulus: 1000, kind: "sound" },
    { start: 9 * MIN, end: 12 * MIN, label: "9–12 dk (sessiz + sesli gif)", stimulus: 900, kind: "combined" }
  ]
};

function shiftEvents(events, start, end, offset) {
  return events
    .filter((e) => e.at >= start && e.at < end)
    .map((e) => ({ ...e, at: e.at - start + offset }));
}

export function applyDistractorOnlyQa(profile) {
  const segments = SOUND_AND_COMBINED_SEGMENTS[profile.key] ?? SOUND_AND_COMBINED_SEGMENTS.adult;
  let offset = 0;
  const gifEvents = [];
  const soundEvents = [];
  const phases = [];

  for (const seg of segments) {
    const len = seg.end - seg.start;

    if (seg.kind === "sound") {
      soundEvents.push(...shiftEvents(profile.soundEvents, seg.start, seg.end, offset));
    } else if (seg.kind === "combined") {
      gifEvents.push(...shiftEvents(profile.gifEvents, seg.start, seg.end, offset));
    }

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
    label: `${profile.label} (QA — sadece ses + kombine)`
  };
}
