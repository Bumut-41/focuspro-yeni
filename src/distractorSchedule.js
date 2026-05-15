/** Çeldirici pencereleri: max 10 sn, aralar max 2 sn, sessiz gif max 2 ekranda */

const GIF_MS = 10_000;
const MAX_GAP_MS = 2_000;
const GIF_STEP_MS = GIF_MS - MAX_GAP_MS;

const GIF_KEYS = ["kedi", "top", "araba", "agac"];
const GIF_ZONES = [
  { area: "left", zone: "upper" },
  { area: "right", zone: "lower" },
  { area: "right", zone: "upper" },
  { area: "left", zone: "middle" }
];

const SOUND_KEYS = ["kussesi", "alarm", "tren", "insan"];
const SOUND_GIF_KEYS = ["top", "araba"];

function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  let t = startMs;
  let i = 0;
  while (t < endMs) {
    const duration = Math.min(GIF_MS, endMs - t);
    if (duration < 800) break;
    const z = GIF_ZONES[i % GIF_ZONES.length];
    events.push({
      at: t,
      duration,
      items: [{ key: GIF_KEYS[i % GIF_KEYS.length], area: z.area, zone: z.zone, silent: true }]
    });
    t += GIF_STEP_MS;
    i += 1;
  }
  return events;
}

function buildSoloSoundWindow(startMs, endMs) {
  const events = [];
  let t = startMs;
  let i = 0;
  while (t < endMs) {
    const duration = Math.min(GIF_MS, endMs - t);
    if (duration < 800) break;
    events.push({ at: t, duration, key: SOUND_KEYS[i % SOUND_KEYS.length] });
    t += duration + MAX_GAP_MS;
    i += 1;
  }
  return events;
}

/** Sesli gif + aynı pencerede sessiz gifler */
function buildSoundGifWindow(startMs, endMs) {
  const silent = buildSilentGifWindow(startMs, endMs);
  const soundGifs = [];
  let t = startMs;
  let i = 0;
  while (t < endMs) {
    const duration = Math.min(GIF_MS, endMs - t);
    if (duration < 800) break;
    soundGifs.push({
      at: t,
      duration,
      items: [
        {
          key: SOUND_GIF_KEYS[i % SOUND_GIF_KEYS.length],
          area: i % 2 ? "right" : "left",
          zone: "lower",
          silent: false
        }
      ]
    });
    t += GIF_MS + MAX_GAP_MS;
    i += 1;
  }
  return [...silent, ...soundGifs].sort((a, b) => a.at - b.at);
}

export function mergeGifEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export function mergeSoundEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export { buildSilentGifWindow, buildSoloSoundWindow, buildSoundGifWindow };
