/**
 * Sadece sessiz gif penceresi (3–6 dk) — diğer senaryolardan bağımsız.
 * En fazla 2 sessiz gif; en fazla 1 hareketli; ikincisi hareketsiz.
 */

import { DISTRACTOR_GIF_KEYS } from "../constants.js";
import { activeItemsOverlapping, isMovingItem } from "../gifPlacement.js";
import {
  SILENT_GIF_ON_SCREEN_MS,
  SILENT_TRACK_INTERVAL_MS,
  SILENT_TRACK_STAGGER_MS
} from "../distractorTiming.js";
import { pickItem, pickStaticBesideMover } from "./distractorPick.js";

const MOVER_KEYS = ["top", "kosan", "kedi"];
const STATIC_GIF_KEYS = DISTRACTOR_GIF_KEYS.filter((k) => !MOVER_KEYS.includes(k));

const SILENT_MOVER_MAX = { top: 4, kosan: 6, kedi: 6 };
const SILENT_MOVER_PRIORITY = { kedi: 0, kosan: 1, top: 2 };
const SILENT_MOVER_SLOT_PERIOD = 3;

function silentMoverMax(key) {
  return SILENT_MOVER_MAX[key] ?? 4;
}

function sortMoversByQuota(moverCounts) {
  return [...MOVER_KEYS].sort((a, b) => {
    const diff = (moverCounts[a] ?? 0) - (moverCounts[b] ?? 0);
    if (diff !== 0) return diff;
    return (SILENT_MOVER_PRIORITY[a] ?? 9) - (SILENT_MOVER_PRIORITY[b] ?? 9);
  });
}

function silentGifDuration(endMs, at) {
  return Math.min(SILENT_GIF_ON_SCREEN_MS, endMs - at);
}

function trySilentMover(slotIndex, at, duration, guard, events, active, moverCounts) {
  if (slotIndex % SILENT_MOVER_SLOT_PERIOD !== 0) return null;
  if (active.some(isMovingItem)) return null;

  for (const key of sortMoversByQuota(moverCounts)) {
    if ((moverCounts[key] ?? 0) >= silentMoverMax(key)) continue;
    const it = pickItem([key], { current: 0 }, at, duration, guard, true, events, active);
    if (it) {
      moverCounts[it.key] = (moverCounts[it.key] ?? 0) + 1;
      return it;
    }
  }
  return null;
}

function pickSilentTrackItem(slotIndex, keyRef, at, duration, guard, events, active, moverCounts) {
  if (active.some(isMovingItem)) {
    return (
      pickStaticBesideMover(STATIC_GIF_KEYS, keyRef, at, duration, guard, events, active) ??
      pickItem(STATIC_GIF_KEYS, keyRef, at, duration, guard, true, events, active)
    );
  }

  const mover = trySilentMover(slotIndex, at, duration, guard, events, active, moverCounts);
  if (mover) return mover;

  return pickItem(STATIC_GIF_KEYS, keyRef, at, duration, guard, true, events, active);
}

export function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  const moverCounts = Object.fromEntries(MOVER_KEYS.map((k) => [k, 0]));
  const tracks = [
    { t: startMs, keyRef: { current: 0 } },
    { t: startMs + SILENT_TRACK_STAGGER_MS, keyRef: { current: 4 } }
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
      const it = pickSilentTrackItem(guard, tr.keyRef, at, duration, guard, events, active, moverCounts);
      if (it) events.push({ at, duration, items: [it] });
    }
    tr.t += SILENT_TRACK_INTERVAL_MS;
  }

  return events.sort((a, b) => a.at - b.at);
}
