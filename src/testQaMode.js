/**
 * Geçici QA: yalnızca «sessiz + sesli gif» (kombine) penceresi.
 * Normal teste dönmek için DISTRACTOR_ONLY_QA = false yapın.
 */
export const DISTRACTOR_ONLY_QA = false;

const MIN = 60_000;

const COMBINED_ONLY = {
  child: { start: 8 * MIN, end: 11 * MIN, label: "8–11 dk (sessiz + sesli gif)", stimulus: 1600 },
  adult: { start: 9 * MIN, end: 12 * MIN, label: "9–12 dk (sessiz + sesli gif)", stimulus: 1200 },
  teen: { start: 9 * MIN, end: 12 * MIN, label: "9–12 dk (sessiz + sesli gif)", stimulus: 900 }
};

function shiftEvents(events, start, end) {
  return events
    .filter((e) => e.at >= start && e.at < end)
    .map((e) => ({ ...e, at: e.at - start }));
}

export function applyDistractorOnlyQa(profile) {
  const seg = COMBINED_ONLY[profile.key] ?? COMBINED_ONLY.adult;
  const gifEvents = shiftEvents(profile.gifEvents, seg.start, seg.end);
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
    label: `${profile.label} (QA — kombine gif)`
  };
}
