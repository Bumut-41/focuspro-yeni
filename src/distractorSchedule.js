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
  GIF_START_INTERVAL_MS,
  SILENT_GIF_ON_SCREEN_MS,
  SILENT_TRACK_INTERVAL_MS,
  SILENT_TRACK_STAGGER_MS
} from "./distractorTiming.js";
const MOVER_KEYS = ["top", "kosan", "kedi"];

const GIF_KEYS = DISTRACTOR_GIF_KEYS;
const STATIC_GIF_KEYS = GIF_KEYS.filter((k) => !MOVER_KEYS.includes(k));
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

function keyPickOrder(keys, offset) {
  const movers = MOVER_KEYS.filter((k) => keys.includes(k));
  const rest = keys.filter((k) => !movers.includes(k));
  const ordered = [...movers, ...rest];
  const i = offset % ordered.length;
  return [...ordered.slice(i), ...ordered.slice(0, i)];
}

function pickItem(keys, keyIndexRef, at, duration, eventIndex, silent, events, extraActive = []) {
  const active = [...activeItemsOverlapping(events, at, duration), ...extraActive];
  const usedLaneIds = new Set(active.map((x) => x.laneId).filter(Boolean));
  const usedKeys = new Set(active.map((x) => x.key));
  const order = keyPickOrder(keys, keyIndexRef.current);
  let attempts = 0;
  while (attempts < order.length) {
    const key = order[attempts];
    if (usedKeys.has(key)) {
      attempts += 1;
      continue;
    }
    const it = buildGifItem(key, eventIndex + attempts, silent, active);
    if (!it || usedLaneIds.has(it.laneId)) {
      attempts += 1;
      continue;
    }
    if (active.some((peer) => pairViolatesPlacement(it, peer))) {
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

function silentGifDuration(endMs, at) {
  return Math.min(SILENT_GIF_ON_SCREEN_MS, endMs - at);
}

/** İki bağımsız iz: genelde 2 sessiz gif, max 0,8 sn ekranda, max 0,7 sn tamamen boş. */
function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  const tracks = [
    { t: startMs, keyRef: { current: 0 }, keys: MOVER_KEYS },
    { t: startMs + SILENT_TRACK_STAGGER_MS, keyRef: { current: 0 }, keys: STATIC_GIF_KEYS }
  ];
  let guard = 0;

  while (guard++ < 8000) {
    tracks.sort((a, b) => a.t - b.t);
    const tr = tracks[0];
    if (tr.t >= endMs) break;

    const at = tr.t;
    const duration = silentGifDuration(endMs, at);
    if (duration >= 400) {
      const active = activeItemsOverlapping(events, at, duration);
      let it = null;
      if (tr.keys === MOVER_KEYS) {
        const forced = MOVER_KEYS[guard % MOVER_KEYS.length];
        it = pickItem([forced], { current: 0 }, at, duration, guard, true, events, active);
        if (!it) it = pickItem(MOVER_KEYS, tr.keyRef, at, duration, guard, true, events, active);
      } else {
        it = pickItem(tr.keys, tr.keyRef, at, duration, guard, true, events, active);
      }
      if (it) events.push({ at, duration, items: [it] });
    }
    tr.t += SILENT_TRACK_INTERVAL_MS;
  }

  return events.sort((a, b) => a.at - b.at);
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
