/**
 * Çeldirici zaman çizelgesi
 */

import {
  DISTRACTOR_GIF_KEYS,
  DISTRACTOR_SOUND_GIF_KEYS,
  DISTRACTOR_SOUND_KEYS
} from "./constants.js";
import {
  activeItemsAt,
  activeItemsOverlapping,
  buildGifItem,
  pairViolatesPlacement
} from "./gifPlacement.js";
import {
  COMBINED_SOUND_STAGGER_MS,
  GIF_ON_SCREEN_MS,
  GIF_START_INTERVAL_MS
} from "./distractorTiming.js";

const GIF_KEYS = DISTRACTOR_GIF_KEYS;
const SOUND_KEYS = DISTRACTOR_SOUND_KEYS;
const SOUND_GIF_KEYS = DISTRACTOR_SOUND_GIF_KEYS;

function gifDuration(endMs, at) {
  return Math.min(GIF_ON_SCREEN_MS, endMs - at);
}

function hasSilentActive(events, at) {
  return activeItemsAt(events, at).some((x) => x.silent);
}

function hasSoundGifActive(events, at) {
  return activeItemsAt(events, at).some((x) => !x.silent);
}

function pickItem(keys, keyIndexRef, at, duration, eventIndex, silent, events, extraActive = []) {
  const active = [...activeItemsOverlapping(events, at, duration), ...extraActive];
  const usedLaneIds = new Set(active.map((x) => x.laneId).filter(Boolean));
  const usedKeys = new Set(active.map((x) => x.key));
  let attempts = 0;
  while (attempts < keys.length) {
    const key = keys[(keyIndexRef.current + attempts) % keys.length];
    if (usedKeys.has(key)) {
      attempts += 1;
      continue;
    }
    const it = buildGifItem(key, eventIndex + attempts, silent, active);
    if (!it || usedLaneIds.has(it.laneId)) {
      attempts += 1;
      continue;
    }
    if (extraActive.some((peer) => pairViolatesPlacement(it, peer))) {
      attempts += 1;
      continue;
    }
    keyIndexRef.current += attempts + 1;
    return it;
  }
  keyIndexRef.current += attempts;
  return null;
}

/** Aynı dalgada sessiz + sesli birlikte planlanır (örtüşen süre). */
function pickWavePair(events, tSilent, tSound, dur, durS, n, silentKeyRef, soundKeyRef, endMs) {
  let silentIt = null;
  let soundIt = null;

  if (tSound < endMs && durS >= 400 && !hasSoundGifActive(events, tSound)) {
    soundIt = pickItem(
      SOUND_GIF_KEYS,
      soundKeyRef,
      tSound,
      durS,
      n * 10 + 5000,
      false,
      events
    );
  }

  if (tSilent < endMs && dur >= 400 && !hasSilentActive(events, tSilent)) {
    const peer = soundIt ? [soundIt] : [];
    silentIt = pickItem(GIF_KEYS, silentKeyRef, tSilent, dur, n * 10, true, events, peer);
    if (soundIt && silentIt && pairViolatesPlacement(silentIt, soundIt)) {
      silentIt = pickItem(GIF_KEYS, silentKeyRef, tSilent, dur, n * 10 + 1, true, events, [soundIt]);
    }
  }

  if (soundIt && silentIt && pairViolatesPlacement(silentIt, soundIt)) {
    soundIt = pickItem(
      SOUND_GIF_KEYS,
      soundKeyRef,
      tSound,
      durS,
      n * 10 + 5001,
      false,
      events,
      [silentIt]
    );
  }

  return { silentIt, soundIt };
}

function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  let silentKeyIndex = 0;
  const keyIndexRef = { current: silentKeyIndex };
  const OFFSET_MS = Math.min(2400, Math.floor(GIF_START_INTERVAL_MS / 3));

  function pickSingleSilentItem(at, dur, eventIndex) {
    keyIndexRef.current = silentKeyIndex;
    const it = pickItem(GIF_KEYS, keyIndexRef, at, dur, eventIndex, true, events);
    silentKeyIndex = keyIndexRef.current;
    return it;
  }

  let t1 = startMs;
  let t2 = startMs + OFFSET_MS;
  let i = 0;

  while (t1 < endMs || t2 < endMs) {
    const nextAt = t2 < endMs && t2 <= t1 ? t2 : t1;
    if (nextAt >= endMs) break;
    const duration = gifDuration(endMs, nextAt);
    if (duration < 400) break;

    const it = pickSingleSilentItem(nextAt, duration, i * 10);
    if (it) events.push({ at: nextAt, duration, items: [it] });

    if (nextAt === t1) t1 += GIF_START_INTERVAL_MS;
    else t2 += GIF_START_INTERVAL_MS;
    i += 1;
  }

  return events;
}

function buildSoloSoundWindow(startMs, endMs) {
  const events = [];
  let t = startMs;
  let i = 0;
  const SOUND_ON_MS = 5_500;
  const GAP_MS = 450;

  while (t < endMs) {
    const duration = Math.min(SOUND_ON_MS, endMs - t);
    if (duration < 400) break;

    events.push({ at: t, duration, key: SOUND_KEYS[i % SOUND_KEYS.length] });

    t += duration + GAP_MS;
    if (t >= endMs) break;
    i += 1;
  }

  return events;
}

/**
 * Kombine pencere: sürekli 1 sessiz + 1 sesli (farklı gif), max 8 sn ekranda,
 * el değişiminde en fazla 0,8 sn tamamen boş ekran.
 */
function buildSoundGifWindow(startMs, endMs) {
  const events = [];
  const silentKeyRef = { current: 0 };
  const soundKeyRef = { current: 0 };
  let n = 0;

  while (startMs + n * GIF_ON_SCREEN_MS < endMs) {
    const tSilent = startMs + n * GIF_ON_SCREEN_MS;
    const tSound = startMs + COMBINED_SOUND_STAGGER_MS + n * GIF_ON_SCREEN_MS;

    const dur = gifDuration(endMs, tSilent);
    const durS = gifDuration(endMs, tSound);
    const { silentIt, soundIt } = pickWavePair(
      events,
      tSilent,
      tSound,
      dur,
      durS,
      n,
      silentKeyRef,
      soundKeyRef,
      endMs
    );
    if (soundIt) events.push({ at: tSound, duration: durS, items: [soundIt] });
    if (silentIt) events.push({ at: tSilent, duration: dur, items: [silentIt] });

    n += 1;
    if (n > 5000) break;
  }

  return events.sort((a, b) => a.at - b.at);
}

export function mergeGifEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export function mergeSoundEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export { buildSilentGifWindow, buildSoloSoundWindow, buildSoundGifWindow };
