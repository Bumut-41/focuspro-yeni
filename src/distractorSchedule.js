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

  // 2. akışı daha erken başlat: aynı anda 2 GIF görülme oranı artsın,
  // ama yine de "aynı anda başlama" hissi olmasın.
  const OFFSET_MS = Math.min(2400, Math.floor(GIF_START_INTERVAL_MS / 3));

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
  // Sadece ses penceresi: sesler arası kısa bir boşluk olsun (çok sıkışık olmasın).
  // Boşluk hedefi ~0.5 sn (kısacık artırma).
  const SOUND_ON_MS = 5_500;
  const GAP_MS = 450;

  while (t < endMs) {
    // duration: bu sürenin sonunda useAttentionTest sesi kapatır.
    const duration = Math.min(SOUND_ON_MS, endMs - t);
    if (duration < 400) break;

    events.push({ at: t, duration, key: SOUND_KEYS[i % SOUND_KEYS.length] });

    t += duration + GAP_MS;
    if (t >= endMs) break;
    i += 1;
  }

  return events;
}

function buildSoundGifWindow(startMs, endMs) {
  // Kombine: tek akış; aynı event içinde sessiz + (çoğu slotta) sesli gif → ses her zaman çalar.
  const events = [];
  let silentKeyIndex = 0;
  let soundKeyIndex = 0;
  let t = startMs;
  let i = 0;

  while (t < endMs) {
    const duration = gifDuration(endMs, t);
    if (duration < 400) break;

    const active = activeItemsAt(events, t);
    const usedLaneIds = new Set(active.map((x) => x.laneId).filter(Boolean));
    const items = [];

    let attempts = 0;
    while (attempts < GIF_KEYS.length) {
      const key = GIF_KEYS[(silentKeyIndex + attempts) % GIF_KEYS.length];
      const it = buildGifItem(key, i * 10 + attempts, true, active);
      if (!usedLaneIds.has(it.laneId)) {
        silentKeyIndex += attempts + 1;
        items.push(it);
        usedLaneIds.add(it.laneId);
        break;
      }
      attempts += 1;
    }
    if (attempts >= GIF_KEYS.length) silentKeyIndex += attempts;

    if (isSoundGifSlot(i)) {
      let sAttempts = 0;
      while (sAttempts < SOUND_GIF_KEYS.length) {
        const sKey = SOUND_GIF_KEYS[(soundKeyIndex + sAttempts) % SOUND_GIF_KEYS.length];
        const soundItem = buildGifItem(sKey, i * 10 + 5000 + sAttempts, false, [...active, ...items]);
        if (!usedLaneIds.has(soundItem.laneId)) {
          soundKeyIndex += sAttempts + 1;
          items.push(soundItem);
          break;
        }
        sAttempts += 1;
      }
      if (sAttempts >= SOUND_GIF_KEYS.length) soundKeyIndex += sAttempts;
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
