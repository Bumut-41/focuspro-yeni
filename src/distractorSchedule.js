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
  let silentKeyIndex = 0;

  function tryAddSecondSilent(items, active, baseIndex) {
    if (items.length >= 2) return;
    const usedLaneIds = new Set(items.map((x) => x.laneId).filter(Boolean));
    let attempts = 0;
    while (attempts < GIF_KEYS.length && items.length < 2) {
      const zKey = GIF_KEYS[(silentKeyIndex + attempts) % GIF_KEYS.length];
      const it = buildGifItem(zKey, baseIndex + 100 + attempts, true, [...active, ...items]);
      if (!usedLaneIds.has(it.laneId)) {
        items.push(it);
        usedLaneIds.add(it.laneId);
        silentKeyIndex += attempts + 1;
        return;
      }
      attempts += 1;
    }
    silentKeyIndex += attempts;
  }

  while (t < endMs) {
    const duration = gifDuration(endMs, t);
    if (duration < 400) break;

    const active = activeItemsAt(events, t);
    const key = GIF_KEYS[silentKeyIndex % GIF_KEYS.length];
    silentKeyIndex += 1;
    const first = buildGifItem(key, i, true, active);
    const items = [first];

    // Yoğunluğu artır: sessiz pencerede mümkünse aynı anda 2 sessiz GIF göster.
    // Lane ve bloklama kuralları `buildGifItem` içinde.
    tryAddSecondSilent(items, active, i);
    events.push({
      at: t,
      duration,
      items
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

  function tryAddSilent(items, active, baseIndex) {
    const usedLaneIds = new Set(items.map((x) => x.laneId).filter(Boolean));
    let attempts = 0;
    while (attempts < GIF_KEYS.length) {
      const zKey = GIF_KEYS[(silentKeyIndex + attempts) % GIF_KEYS.length];
      const it = buildGifItem(zKey, baseIndex + 100 + attempts, true, [...active, ...items]);
      if (!usedLaneIds.has(it.laneId)) {
        items.push(it);
        usedLaneIds.add(it.laneId);
        silentKeyIndex += attempts + 1;
        return true;
      }
      attempts += 1;
    }
    silentKeyIndex += attempts;
    return false;
  }

  while (t < endMs) {
    const duration = gifDuration(endMs, t);
    if (duration < 400) break;

    const active = activeItemsAt(events, t);
    const hasSound = active.some((it) => !it.silent);
    const hasSilent = active.some((it) => it.silent);
    const wantSound = isSoundGifSlot(i);
    const canPlaceSound = wantSound && t >= nextSoundAllowedAt && !hasSound;
    const items = [];

    if (canPlaceSound) {
      const sKey = SOUND_GIF_KEYS[soundKeyIndex % SOUND_GIF_KEYS.length];
      soundKeyIndex += 1;
      const soundItem = buildGifItem(sKey, i, false, active);
      items.push(soundItem);
      nextSoundAllowedAt = t + duration;

      if (!hasSilent) {
        // Kombine kural: en fazla 1 sesli + 1 sessiz
        tryAddSilent(items, active, i);
      }
    } else if (wantSound && hasSound) {
      /* Sesli çıkış sırası ama ekranda ses var — yalnızca ses bitince yeni sesli */
    } else if (!hasSound) {
      // Kombine pencerede "sessiz slot" ise yoğunluğu artır: mümkünse 2 sessiz GIF
      tryAddSilent(items, active, i);
      if (!active.some((it) => it.key === "top" || it.key === "kedi" || it.key === "kosan")) {
        // Eğer hareketli bir şey yoksa da ikinciyi dene (en fazla 2).
        if (items.length < 2) tryAddSilent(items, active, i);
      } else {
        // Hareketli varken bile 2'yi dene (lane blokları zıt şerit/zone'a iter).
        if (items.length < 2) tryAddSilent(items, active, i);
      }
    } else if (hasSound && !hasSilent) {
      // Ekranda sesli var ama sessiz yoksa 1 sessiz ekleyebiliriz (max 1 sessiz)
      tryAddSilent(items, active, i);
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
