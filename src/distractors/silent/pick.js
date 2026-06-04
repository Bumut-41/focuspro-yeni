/**
 * Yalnızca SESSİZ gif penceresi — gif seçimi.
 */

import { activeItemsOverlapping, pairViolatesPlacement } from "../../gifPlacementCore.js";
import { buildSilentGifItem } from "./placement.js";

function keyPickOrder(keys, offset) {
  const i = offset % keys.length;
  return [...keys.slice(i), ...keys.slice(0, i)];
}

export function pickSilentGif(keys, keyIndexRef, at, duration, eventIndex, events, extraActive = []) {
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
    const it = buildSilentGifItem(key, eventIndex + attempts, active);
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

export function pickSilentStaticBesideMover(staticKeys, keyRef, at, duration, eventIndex, events, extraActive) {
  const active = [...activeItemsOverlapping(events, at, duration), ...extraActive];
  const order = keyPickOrder(staticKeys, keyRef.current);
  let best = null;
  for (let ki = 0; ki < order.length; ki++) {
    const key = order[ki];
    if (active.some((p) => p.key === key)) continue;
    for (let laneTry = 0; laneTry < 12; laneTry++) {
      const it = buildSilentGifItem(key, eventIndex + ki * 12 + laneTry, active);
      if (!it) continue;
      if (active.some((p) => p.laneId && p.laneId === it.laneId)) continue;
      if (active.some((peer) => pairViolatesPlacement(it, peer))) continue;
      if (!best || it.top < best.top) best = it;
      if (it.top <= 20) {
        keyRef.current += ki + 1;
        return it;
      }
    }
  }
  if (best) keyRef.current += 1;
  return best;
}
