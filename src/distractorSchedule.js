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
  const SOUND_ON_MS = 3_000;
  const GAP_MS = 500;

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
  // Kombine pencere (sesli + sessiz GIF):
  // - Baz: sessiz penceredeki akış AYNEN korunur (buildSilentGifWindow)
  // - Fark: aynı zaman eksenine daha sık sesli GIF eklenir
  // - Kurallar: aynı anda max 1 sesli; sesli varken ekranda sessiz de olmalı
  const silentEvents = buildSilentGifWindow(startMs, endMs);
  const soundEvents = [];
  let soundKeyIndex = 0;

  // Sesli GIF'ler daha sık gelsin ama çakışmasın.
  const SOUND_ON_MS = 4_200; // <= 8 sn
  const SOUND_GAP_MS = 700;
  let nextSoundAllowedAt = startMs;

  // Sessiz akışla aynı anda başlamasın diye küçük offset.
  let t = startMs + Math.min(900, Math.floor(GIF_START_INTERVAL_MS / 6));
  let idx = 0;

  while (t < endMs) {
    const duration = Math.min(SOUND_ON_MS, endMs - t);
    if (duration < 400) break;

    if (t < nextSoundAllowedAt) {
      t += 200;
      continue;
    }

    // Sesli GIF ekleneceği anda ekranda en az 1 sessiz olmalı.
    const activeSilent = activeItemsAt(silentEvents, t);
    if (!activeSilent.some((x) => x.silent)) {
      t += 200;
      continue;
    }

    // Yerleşim için aktif item'ları (sessiz + mevcut sesliler) hesaba kat.
    const active = activeItemsAt([...silentEvents, ...soundEvents], t);
    const key = SOUND_GIF_KEYS[soundKeyIndex % SOUND_GIF_KEYS.length];
    soundKeyIndex += 1;

    const soundItem = buildGifItem(key, idx * 100 + 5000, false, active);
    soundEvents.push({ at: t, duration, items: [soundItem] });
    nextSoundAllowedAt = t + duration + SOUND_GAP_MS;

    t += 200;
    idx += 1;
  }

  return [...silentEvents, ...soundEvents].sort((a, b) => a.at - b.at);
}

export function mergeGifEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export function mergeSoundEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export { buildSilentGifWindow, buildSoloSoundWindow, buildSoundGifWindow };
