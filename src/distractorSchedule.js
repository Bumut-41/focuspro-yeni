/**
 * Çeldirici zaman çizelgesi
 */

import {
  DISTRACTOR_GIF_KEYS,
  DISTRACTOR_SOUND_GIF_KEYS,
  DISTRACTOR_SOUND_KEYS
} from "./constants.js";
import { activeItemsAt, buildGifItem, MOVING_HORIZONTAL_KEYS } from "./gifPlacement.js";
import {
  COMBINED_START_INTERVAL_MS,
  GIF_ON_SCREEN_MS,
  GIF_START_INTERVAL_MS,
  isSoundGifSlot
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

function pickItem(keys, keyIndexRef, at, eventIndex, silent, events) {
  const active = activeItemsAt(events, at);
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
    if (!usedLaneIds.has(it.laneId)) {
      keyIndexRef.current += attempts + 1;
      return it;
    }
    attempts += 1;
  }
  keyIndexRef.current += attempts;
  return null;
}

function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  let silentKeyIndex = 0;
  const keyIndexRef = { current: silentKeyIndex };
  const OFFSET_MS = Math.min(2400, Math.floor(GIF_START_INTERVAL_MS / 3));

  function pickSingleSilentItem(at, eventIndex) {
    keyIndexRef.current = silentKeyIndex;
    const it = pickItem(GIF_KEYS, keyIndexRef, at, eventIndex, true, events);
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

    const it = pickSingleSilentItem(nextAt, i * 10);
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
 * Kombine pencere (sesli + sessiz gif) — yeniden kurulum:
 * - Aynı anda max 1 sessiz + max 1 sesli; farklı başlangıç zamanı; max 8 sn ekranda
 * - Her event tek gif (görsel+ses birlikte); ses tek başına yok
 * - İki kaydırılmış akış; boşluk max 1 sn; ekrandaki iki gif farklı anahtar
 */
function buildSoundGifWindow(startMs, endMs) {
  const events = [];
  const silentKeyRef = { current: 0 };
  const soundKeyRef = { current: 0 };
  // Sesli akışı kaydır: sessiz bittiğinde ekranda en fazla 1,8 sn boş kalmasın.
  const SOUND_STAGGER_MS = Math.floor(COMBINED_START_INTERVAL_MS / 2);
  let n = 0;

  while (startMs + n * GIF_ON_SCREEN_MS < endMs) {
    const tSilent = startMs + n * GIF_ON_SCREEN_MS;
    const tSound = startMs + SOUND_STAGGER_MS + n * GIF_ON_SCREEN_MS;

    if (tSilent < endMs) {
      const dur = gifDuration(endMs, tSilent);
      if (dur >= 400 && !hasSilentActive(events, tSilent)) {
        const it = pickItem(GIF_KEYS, silentKeyRef, tSilent, n * 10, true, events);
        if (it) events.push({ at: tSilent, duration: dur, items: [it] });
      }
    }

    if (tSound < endMs && isSoundGifSlot(n)) {
      const durS = gifDuration(endMs, tSound);
      if (durS >= 400 && !hasSoundGifActive(events, tSound)) {
        const it = pickItem(SOUND_GIF_KEYS, soundKeyRef, tSound, n * 10 + 5000, false, events);
        if (it) events.push({ at: tSound, duration: durS, items: [it] });
      }
    }

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
