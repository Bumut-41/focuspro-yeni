/**
 * Ortak gif seçimi — senaryo modülleri paylaşır.
 */

import { activeItemsOverlapping, buildGifItem, pairViolatesPlacement } from "../gifPlacement.js";

function keyPickOrder(keys, offset) {
  const i = offset % keys.length;
  return [...keys.slice(i), ...keys.slice(0, i)];
}

/** Tek gif dene (sıralı anahtar listesi). profile: 'silent' | 'combined' | 'default' */
export function pickItem(
  keys,
  keyIndexRef,
  at,
  duration,
  eventIndex,
  silent,
  events,
  extraActive = [],
  profile = "default"
) {
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
    const it = buildGifItem(key, eventIndex + attempts, silent, active, profile);
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

/** Hareketli varken ikinci gif: hareketsiz, yol üstüne konmaz. */
export function pickStaticBesideMover(
  staticKeys,
  keyIndexRef,
  at,
  duration,
  eventIndex,
  events,
  extraActive = [],
  silent = true,
  profile = "silent"
) {
  const active = [...activeItemsOverlapping(events, at, duration), ...extraActive];
  const order = keyPickOrder(staticKeys, keyIndexRef.current);
  let best = null;
  for (let ki = 0; ki < order.length; ki++) {
    const key = order[ki];
    if (active.some((p) => p.key === key)) continue;
    for (let laneTry = 0; laneTry < 12; laneTry++) {
      const idx = eventIndex + ki * 12 + laneTry;
      const it = buildGifItem(key, idx, silent, active, profile);
      if (!it) continue;
      if (active.some((p) => p.laneId && p.laneId === it.laneId)) continue;
      if (active.some((peer) => pairViolatesPlacement(it, peer))) continue;
      if (profile === "combined") {
        keyIndexRef.current += ki + 1;
        return it;
      }
      if (!best || it.top < best.top) best = it;
      if (it.top <= 20) {
        keyIndexRef.current += ki + 1;
        return it;
      }
    }
  }
  if (best) keyIndexRef.current += 1;
  return best;
}
