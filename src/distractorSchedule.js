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
  const GAP_MAX_MS = 1_200;

  while (t < endMs) {
    // Buradaki duration "güvenlik süre sınırı" gibi kullanılıyor (useAttentionTest sesleri bu sürede kapatıyor).
    // Seslerin arasındaki boşluğu azaltmak için event'leri sık tetikliyoruz (<= 1.2 sn).
    const duration = Math.min(GIF_ON_SCREEN_MS, endMs - t);
    if (duration < 400) break;

    events.push({ at: t, duration, key: SOUND_KEYS[i % SOUND_KEYS.length] });

    t += GAP_MAX_MS;
    if (t >= endMs) break;
    i += 1;
  }

  return events;
}

function buildSoundGifWindow(startMs, endMs) {
  // Yeni kombine mantık:
  // - Sessiz akış: sessiz penceredeki gibi "tek item" ama kesintisiz
  // - Sesli akış: daha sık, aynı anda en fazla 1 sesli (overlap yok)
  // - Hedef: sesli+sessiz birlikte daha stabil; "slot" mantığı yok.
  const events = [];
  let silentKeyIndex = 0;
  let soundKeyIndex = 0;

  // 8 sn max kuralına uyar; overlap olmasın diye duration=interval kullanıyoruz.
  const DUR = Math.min(GIF_ON_SCREEN_MS, GIF_START_INTERVAL_MS);
  const SOUND_OFFSET_MS = Math.min(1600, Math.floor(GIF_START_INTERVAL_MS / 4));

  function pickItem(keys, keyIndex, at, eventIndex, silent) {
    const active = activeItemsAt(events, at);
    const usedLaneIds = new Set(active.map((x) => x.laneId).filter(Boolean));
    let attempts = 0;
    while (attempts < keys.length) {
      const k = keys[(keyIndex + attempts) % keys.length];
      const it = buildGifItem(k, eventIndex + attempts, silent, active);
      if (!usedLaneIds.has(it.laneId)) {
        return { item: it, advance: attempts + 1 };
      }
      attempts += 1;
    }
    return { item: null, advance: attempts };
  }

  // Zaman ekseni boyunca sessiz + sesli eventleri sırayla kur.
  let t = startMs;
  while (t < endMs) {
    // Sessiz her zaman dene
    const d1 = Math.min(DUR, endMs - t);
    if (d1 >= 400) {
      const { item, advance } = pickItem(GIF_KEYS, silentKeyIndex, t, Math.floor(t / 10), true);
      silentKeyIndex += advance;
      if (item) events.push({ at: t, duration: d1, items: [item] });
    }

    // Sesli daha sık görünsün: offset ile aynı anda başlamasın.
    const ts = t + SOUND_OFFSET_MS;
    const d2 = ts < endMs ? Math.min(DUR, endMs - ts) : 0;
    if (d2 >= 400) {
      const { item, advance } = pickItem(SOUND_GIF_KEYS, soundKeyIndex, ts, Math.floor(ts / 10) + 5000, false);
      soundKeyIndex += advance;
      if (item) events.push({ at: ts, duration: d2, items: [item] });
    }

    t += GIF_START_INTERVAL_MS;
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
