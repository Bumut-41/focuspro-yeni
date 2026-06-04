/**
 * Sadece sessiz gif penceresi (3–6 dk) — tamamen bağımsız modül.
 */

import { DISTRACTOR_GIF_KEYS } from "../../constants.js";
import { activeItemsOverlapping, isMovingItem } from "../../gifPlacementCore.js";
import {
  SILENT_GIF_ON_SCREEN_MS,
  SILENT_TRACK_INTERVAL_MS,
  SILENT_TRACK_STAGGER_MS
} from "../../distractorTiming.js";
import { pickSilentGif, pickSilentStaticBesideMover } from "./pick.js";

const MOVER_KEYS = ["top", "kosan", "kedi"];
const STATIC_GIF_KEYS = DISTRACTOR_GIF_KEYS.filter((k) => !MOVER_KEYS.includes(k));

const SILENT_MOVER_MAX = { top: 4, kosan: 4, kedi: 4 };
const SILENT_MOVER_SLOT_PERIOD = 5;
const MOVER_TURN = ["top", "kosan", "kedi"];

function silentMoverMax(key) {
  return SILENT_MOVER_MAX[key] ?? 3;
}

function sortMoversByQuota(moverCounts, slotIndex) {
  const turn = Math.floor(slotIndex / SILENT_MOVER_SLOT_PERIOD) % MOVER_TURN.length;
  const preferred = [MOVER_TURN[turn], MOVER_TURN[(turn + 1) % 3], MOVER_TURN[(turn + 2) % 3]];
  return [...preferred].sort((a, b) => {
    const diff = (moverCounts[a] ?? 0) - (moverCounts[b] ?? 0);
    if (diff !== 0) return diff;
    return preferred.indexOf(a) - preferred.indexOf(b);
  });
}

function silentGifDuration(endMs, at) {
  return Math.min(SILENT_GIF_ON_SCREEN_MS, endMs - at);
}

function laneEventIndexForMover(key, moverCounts) {
  const n = moverCounts[key] ?? 0;
  if (key === "kosan") return n % 2 === 0 ? 0 : 8;
  if (key === "kedi") return n % 2 === 0 ? 8 : 0;
  if (key === "top") return n % 2 === 0 ? 0 : 1;
  return 0;
}

function tryPickMoverKey(key, at, duration, guard, events, active, moverCounts) {
  const laneStart = laneEventIndexForMover(key, moverCounts);
  for (let laneTry = 0; laneTry < 12; laneTry++) {
    const idx = laneStart + laneTry;
    const it = pickSilentGif([key], { current: idx }, at, duration, guard + idx, events, active);
    if (it) return it;
  }
  return null;
}

function trySilentMover(slotIndex, at, duration, guard, events, active, moverCounts, lastMoverKey) {
  if (slotIndex % SILENT_MOVER_SLOT_PERIOD !== 0) return null;
  if (active.some(isMovingItem)) return null;

  for (const key of sortMoversByQuota(moverCounts, slotIndex)) {
    if ((moverCounts[key] ?? 0) >= silentMoverMax(key)) continue;
    if (key === lastMoverKey.current) continue;
    const it = tryPickMoverKey(key, at, duration, guard, events, active, moverCounts);
    if (it) {
      moverCounts[it.key] = (moverCounts[it.key] ?? 0) + 1;
      lastMoverKey.current = it.key;
      return it;
    }
  }

  for (const key of sortMoversByQuota(moverCounts, slotIndex)) {
    if ((moverCounts[key] ?? 0) >= silentMoverMax(key)) continue;
    const it = tryPickMoverKey(key, at, duration, guard, events, active, moverCounts);
    if (it) {
      moverCounts[it.key] = (moverCounts[it.key] ?? 0) + 1;
      lastMoverKey.current = it.key;
      return it;
    }
  }
  return null;
}

function pickSilentTrackItem(slotIndex, keyRef, at, duration, guard, events, active, moverCounts, lastMoverKey) {
  if (active.some(isMovingItem)) {
    return (
      pickSilentStaticBesideMover(STATIC_GIF_KEYS, keyRef, at, duration, guard, events, active) ??
      pickSilentGif(STATIC_GIF_KEYS, keyRef, at, duration, guard, events, active)
    );
  }

  const mover = trySilentMover(slotIndex, at, duration, guard, events, active, moverCounts, lastMoverKey);
  if (mover) return mover;

  return pickSilentGif(STATIC_GIF_KEYS, keyRef, at, duration, guard, events, active);
}

export function buildSilentGifWindow(startMs, endMs) {
  const events = [];
  const moverCounts = Object.fromEntries(MOVER_KEYS.map((k) => [k, 0]));
  const lastMoverKey = { current: null };
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
      const it = pickSilentTrackItem(
        guard,
        tr.keyRef,
        at,
        duration,
        guard,
        events,
        active,
        moverCounts,
        lastMoverKey
      );
      if (it) events.push({ at, duration, items: [it] });
    }
    tr.t += SILENT_TRACK_INTERVAL_MS;
  }

  return events.sort((a, b) => a.at - b.at);
}
