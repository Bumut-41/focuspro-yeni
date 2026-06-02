/**
 * Çeldirici zaman çizelgesi:
 * - GIF ekranda max 8 sn, boşluk max 1,5 sn
 * - Sessiz: en fazla 2 aynı anda
 * - Kombine: %70 sesli gif, en fazla 1 sesli + 1 sessiz
 */

import {
  DISTRACTOR_GIF_KEYS,
  DISTRACTOR_SOUND_GIF_KEYS,
  DISTRACTOR_SOUND_KEYS
} from "./constants.js";
import { activeItemsAt, buildGifItem } from "./gifPlacement.js";
import {
  GIF_ON_SCREEN_MS,
  GIF_START_INTERVAL_MS,
  MAX_EMPTY_MS,
  isSoundGifSlot
} from "./distractorTiming.js";

const GIF_KEYS = DISTRACTOR_GIF_KEYS;
const SOUND_KEYS = DISTRACTOR_SOUND_KEYS;
const SOUND_GIF_KEYS = DISTRACTOR_SOUND_GIF_KEYS;

function gifDuration(endMs, at) {
  return Math.min(GIF_ON_SCREEN_MS, endMs - at);
}

function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  let t = startMs;
  let i = 0;

  while (t < endMs) {
    const duration = gifDuration(endMs, t);
    if (duration < 400) break;

    const active = activeItemsAt(events, t);
    const key = GIF_KEYS[i % GIF_KEYS.length];
    events.push({
      at: t,
      duration,
      items: [buildGifItem(key, i, true, active)]
    });

    t += GIF_START_INTERVAL_MS;
    i += 1;
  }

  return events;
}

function buildSoloSoundWindow(startMs, endMs) {
  const events = [];
  let t = startMs;
  let i = 0;

  while (t < endMs) {
    const duration = Math.min(GIF_ON_SCREEN_MS, endMs - t);
    if (duration < 400) break;

    events.push({ at: t, duration, key: SOUND_KEYS[i % SOUND_KEYS.length] });

    t += duration;
    if (t >= endMs) break;
    i += 1;
  }

  return events;
}

function buildSoundGifWindow(startMs, endMs) {
  const events = [];
  let t = startMs;
  let i = 0;
  let soundKeyIndex = 0;
  let silentKeyIndex = 0;
  let nextSoundAllowedAt = startMs;

  while (t < endMs) {
    const duration = gifDuration(endMs, t);
    if (duration < 400) break;

    const active = activeItemsAt(events, t);
    const hasSound = active.some((it) => !it.silent);
    const hasSilent = active.some((it) => it.silent);
    const canPlaceSound = isSoundGifSlot(i) && t >= nextSoundAllowedAt && !hasSound;
    const items = [];

    if (canPlaceSound) {
      const sKey = SOUND_GIF_KEYS[soundKeyIndex % SOUND_GIF_KEYS.length];
      soundKeyIndex += 1;
      const soundItem = buildGifItem(sKey, i, false, active);
      items.push(soundItem);
      nextSoundAllowedAt = t + duration;

      if (!hasSilent) {
        const zKey = GIF_KEYS[silentKeyIndex % GIF_KEYS.length];
        silentKeyIndex += 1;
        const silentItem = buildGifItem(zKey, i + 100, true, [...active, soundItem]);
        if (silentItem.laneId !== soundItem.laneId) {
          items.push(silentItem);
        }
      }
    } else if (!hasSound) {
      const zKey = GIF_KEYS[silentKeyIndex % GIF_KEYS.length];
      silentKeyIndex += 1;
      items.push(buildGifItem(zKey, i, true, active));
    } else if (hasSound && !hasSilent) {
      const zKey = GIF_KEYS[silentKeyIndex % GIF_KEYS.length];
      silentKeyIndex += 1;
      items.push(buildGifItem(zKey, i, true, active));
    }

    if (items.length) {
      events.push({ at: t, duration, items });
    }

    t += GIF_START_INTERVAL_MS;
    i += 1;
  }

  return events;
}

export function mergeGifEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export function mergeSoundEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export { buildSilentGifWindow, buildSoloSoundWindow, buildSoundGifWindow };
