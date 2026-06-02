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
  let silentKeyIndex = 0;

  const OFFSET_MS = Math.min(3200, Math.floor(GIF_START_INTERVAL_MS / 2));

  function pickSingleSilentItem(at, eventIndex) {
    const active = activeItemsAt(events, at);
    const usedLaneIds = new Set(active.map((x) => x.laneId).filter(Boolean));
    let attempts = 0;
    while (attempts < GIF_KEYS.length) {
      const key = GIF_KEYS[(silentKeyIndex + attempts) % GIF_KEYS.length];
      const it = buildGifItem(key, eventIndex + attempts, true, active);
      if (!usedLaneIds.has(it.laneId)) {
        silentKeyIndex += attempts + 1;
        return it;
      }
      attempts += 1;
    }
    silentKeyIndex += attempts;
    return null;
  }

  // 2 bağımsız akış: aynı anda başlatmak yerine kaydırmalı (staggered) başlat.
  // Böylece 2 GIF "aynı anda" değil, farklı anlarda ekrana girer.
  let t1 = startMs;
  let t2 = startMs + OFFSET_MS;
  let i = 0;

  while (t1 < endMs || t2 < endMs) {
    const nextAt = t2 < endMs && t2 <= t1 ? t2 : t1;
    if (nextAt >= endMs) break;
    const duration = gifDuration(endMs, nextAt);
    if (duration < 400) break;

    const it = pickSingleSilentItem(nextAt, i * 10);
    if (it) {
      events.push({ at: nextAt, duration, items: [it] });
    }

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
  const OFFSET_MS = Math.min(3200, Math.floor(GIF_START_INTERVAL_MS / 2));

  function pickSilentItem(at, eventIndex) {
    const active = activeItemsAt(events, at);
    const usedLaneIds = new Set(active.map((x) => x.laneId).filter(Boolean));
    let attempts = 0;
    while (attempts < GIF_KEYS.length) {
      const zKey = GIF_KEYS[(silentKeyIndex + attempts) % GIF_KEYS.length];
      const it = buildGifItem(zKey, eventIndex + attempts, true, active);
      if (!usedLaneIds.has(it.laneId)) {
        silentKeyIndex += attempts + 1;
        return it;
      }
      attempts += 1;
    }
    silentKeyIndex += attempts;
    return null;
  }

  while (t < endMs) {
    const duration = gifDuration(endMs, t);
    if (duration < 400) break;

    const active = activeItemsAt(events, t);
    const hasSound = active.some((it) => !it.silent);
    const hasSilent = active.some((it) => it.silent);
    const wantSound = isSoundGifSlot(i);
    const canPlaceSound = wantSound && t >= nextSoundAllowedAt && !hasSound;

    if (canPlaceSound) {
      const sKey = SOUND_GIF_KEYS[soundKeyIndex % SOUND_GIF_KEYS.length];
      soundKeyIndex += 1;
      const soundItem = buildGifItem(sKey, i, false, active);
      nextSoundAllowedAt = t + duration;

      const items = [soundItem];
      if (!hasSilent) {
        const silent = pickSilentItem(t, i + 1000);
        if (silent && silent.laneId !== soundItem.laneId) items.push(silent);
      }

      events.push({ at: t, duration, items });
    } else if (wantSound && hasSound) {
      /* Sesli çıkış sırası ama ekranda ses var — yalnızca ses bitince yeni sesli */
    } else if (!hasSound) {
      // Sessiz slot: 2 bağımsız başlangıç (kaydırmalı). Aynı anda 2 item değil.
      const silent1 = pickSilentItem(t, i * 10);
      if (silent1) events.push({ at: t, duration, items: [silent1] });

      const t2 = t + OFFSET_MS;
      if (t2 < endMs) {
        const d2 = gifDuration(endMs, t2);
        if (d2 >= 400) {
          const silent2 = pickSilentItem(t2, i * 10 + 5);
          if (silent2) events.push({ at: t2, duration: d2, items: [silent2] });
        }
      }
    } else if (hasSound && !hasSilent) {
      const silent = pickSilentItem(t, i + 2000);
      if (silent) events.push({ at: t, duration, items: [silent] });
    }

    t += GIF_START_INTERVAL_MS;
    i += 1;
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
