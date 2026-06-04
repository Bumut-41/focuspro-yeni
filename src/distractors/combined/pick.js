/**
 * Yalnızca SESSİZ+SESLİ gif (kombine) penceresi — gif seçimi.
 */

import { activeItemsOverlapping, pairViolatesPlacement } from "../../gifPlacementCore.js";
import { buildCombinedGifItem } from "./placement.js";

function keyPickOrder(keys, offset) {
  const i = offset % keys.length;
  return [...keys.slice(i), ...keys.slice(0, i)];
}

export function pickCombinedGif(keys, keyIndexRef, at, duration, eventIndex, silent, events, extraActive = []) {
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
    const it = buildCombinedGifItem(key, eventIndex + attempts, silent, active);
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

export function pickCombinedStaticBesideMover(staticKeys, keyRef, at, duration, eventIndex, events, extraActive, silent) {
  const active = [...activeItemsOverlapping(events, at, duration), ...extraActive];
  const order = keyPickOrder(staticKeys, keyRef.current);
  for (let ki = 0; ki < order.length; ki++) {
    const key = order[ki];
    if (active.some((p) => p.key === key)) continue;
    for (let laneTry = 0; laneTry < 12; laneTry++) {
      const it = buildCombinedGifItem(key, eventIndex + ki * 12 + laneTry, silent, active);
      if (!it) continue;
      if (active.some((p) => p.laneId && p.laneId === it.laneId)) continue;
      if (active.some((peer) => pairViolatesPlacement(it, peer))) continue;
      keyRef.current += ki + 1;
      return it;
    }
  }
  return null;
}
