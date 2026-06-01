/** Çeldirici pencereleri: max 2 sessiz gif, max 1 sesli gif; ana simgeye binmez */

import {
  DISTRACTOR_GIF_KEYS,
  DISTRACTOR_SOUND_GIF_KEYS,
  DISTRACTOR_SOUND_KEYS
} from "./constants.js";
import { buildGifItem } from "./gifPlacement.js";

const GIF_MS = 10_000;
const MAX_GAP_MS = 2_000;
const GIF_STEP_MS = GIF_MS - MAX_GAP_MS;

const GIF_KEYS = DISTRACTOR_GIF_KEYS;
const SOUND_KEYS = DISTRACTOR_SOUND_KEYS;
const SOUND_GIF_KEYS = DISTRACTOR_SOUND_GIF_KEYS;

function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  let t = startMs;
  let i = 0;
  while (t < endMs) {
    const duration = Math.min(GIF_MS, endMs - t);
    if (duration < 800) break;
    const key = GIF_KEYS[i % GIF_KEYS.length];
    events.push({
      at: t,
      duration,
      items: [buildGifItem(key, i, true)]
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

/** Sesli gif (aynı anda 1) + yan şeritlerde sessiz gifler */
function buildSoundGifWindow(startMs, endMs) {
  const silent = buildSilentGifWindow(startMs, endMs);
  const soundGifs = [];
  let t = startMs;
  let i = 0;
  while (t < endMs) {
    const duration = Math.min(GIF_MS, endMs - t);
    if (duration < 800) break;
    const key = SOUND_GIF_KEYS[i % SOUND_GIF_KEYS.length];
    soundGifs.push({
      at: t,
      duration,
      items: [buildGifItem(key, i + 1000, false)]
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
