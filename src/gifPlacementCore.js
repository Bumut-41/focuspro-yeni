/**
 * Ortak çekirdek: şeritler, çakışma kuralları, aktif item sorguları.
 * Yerleşim seçimi (pickLane) senaryo dosyalarında — birbirini etkilemez.
 */

export const GIF_LANES = [
  { id: "left-upper", area: "left", zone: "upper", left: 14, top: 16 },
  { id: "right-upper", area: "right", zone: "upper", left: 86, top: 16 },
  { id: "left-lower", area: "left", zone: "lower", left: 14, top: 84 },
  { id: "right-lower", area: "right", zone: "lower", left: 86, top: 84 },
  { id: "left-mid-upper", area: "left", zone: "mid-upper", left: 16, top: 34 },
  { id: "right-mid-upper", area: "right", zone: "mid-upper", left: 84, top: 34 },
  { id: "left-mid-lower", area: "left", zone: "mid-lower", left: 16, top: 66 },
  { id: "right-mid-lower", area: "right", zone: "mid-lower", left: 84, top: 66 }
];

export const MOVING_HORIZONTAL_KEYS = new Set(["kedi", "kosan"]);
export const MOVING_VERTICAL_KEYS = new Set(["top"]);
export const HORIZONTAL_PATH_BAND = 40;

export const GIF_BEHAVIOR = {
  top: { movement: "vertical", sides: ["left", "right"] },
  kosan: { movement: "horizontal", sides: ["left", "right"] },
  kedi: { movement: "horizontal", sides: ["left", "right"] },
  araba: { movement: "static", sides: ["left", "right"] },
  agac: { movement: "static", sides: ["left", "right"] },
  arabakorna: { movement: "static", sides: ["left", "right"] },
  asansor: { movement: "static", sides: ["left", "right"] },
  camtemizlik: { movement: "static", sides: ["left", "right"] },
  kapi: { movement: "static", sides: ["left", "right"] },
  motorsiklet: { movement: "static", sides: ["left", "right"] },
  televizyon: { movement: "static", sides: ["left", "right"] }
};

export function isMovingKey(key) {
  return MOVING_HORIZONTAL_KEYS.has(key) || MOVING_VERTICAL_KEYS.has(key);
}

export function itemMovement(it) {
  return GIF_BEHAVIOR[it?.key]?.movement ?? it?.movement ?? "static";
}

export function isMovingItem(it) {
  const m = itemMovement(it);
  return m === "horizontal" || m === "vertical";
}

function laneIdsWhere(fn) {
  return new Set(GIF_LANES.filter(fn).map((l) => l.id));
}

export function activeItemsAt(events, timeMs) {
  const items = [];
  for (const ev of events) {
    if (timeMs >= ev.at && timeMs < ev.at + ev.duration) {
      items.push(...ev.items);
    }
  }
  return items;
}

export function activeItemsOverlapping(events, at, duration) {
  const end = at + duration;
  const items = [];
  for (const ev of events) {
    if (ev.at < end && ev.at + ev.duration > at) {
      items.push(...ev.items);
    }
  }
  return items;
}

export function pairViolatesPlacement(a, b) {
  if (a.key === b.key) return "aynı-gif";
  if (a.laneId && a.laneId === b.laneId) return "aynı-lane";
  if (isMovingItem(a) && isMovingItem(b)) return "iki-hareketli";
  if (
    (a.key === "top" && MOVING_HORIZONTAL_KEYS.has(b.key)) ||
    (b.key === "top" && MOVING_HORIZONTAL_KEYS.has(a.key))
  ) {
    return "top-yatay";
  }

  const horizVsStatic = (mover, stat) => {
    if (
      stat.area === "left" &&
      Number.isFinite(stat.top) &&
      Number.isFinite(mover.top) &&
      Math.abs(stat.top - mover.top) < HORIZONTAL_PATH_BAND
    ) {
      return "sabit-sol-yatay-yol";
    }
    if (Math.abs(stat.top - mover.top) < HORIZONTAL_PATH_BAND) return "sabit-yatay-bant";
    return null;
  };

  if (MOVING_HORIZONTAL_KEYS.has(a.key) && GIF_BEHAVIOR[b.key]?.movement === "static") {
    const v = horizVsStatic(a, b);
    if (v) return v;
  }
  if (MOVING_HORIZONTAL_KEYS.has(b.key) && GIF_BEHAVIOR[a.key]?.movement === "static") {
    const v = horizVsStatic(b, a);
    if (v) return v;
  }

  if (a.key === "top" && GIF_BEHAVIOR[b.key]?.movement === "static" && b.area === a.area) {
    return "sabit-top-kolonu";
  }
  if (b.key === "top" && GIF_BEHAVIOR[a.key]?.movement === "static" && a.area === b.area) {
    return "sabit-top-kolonu";
  }

  if (MOVING_HORIZONTAL_KEYS.has(a.key) && a.top > 22 && a.top < 78) return "yatay-orta-bant";
  if (MOVING_HORIZONTAL_KEYS.has(b.key) && b.top > 22 && b.top < 78) return "yatay-orta-bant";

  if (GIF_BEHAVIOR[a.key]?.movement === "static" && GIF_BEHAVIOR[b.key]?.movement === "static") {
    const dx = Math.abs(a.left - b.left);
    const dy = Math.abs(a.top - b.top);
    if (dx <= 30 && dy <= 28) return "iki-sabit-yakın";
  }

  return null;
}

/** Senaryo placement modülleri için ortak yardımcılar */
export function isInTargetSafeExclusionBox(lane) {
  return lane.left >= 30 && lane.left <= 70 && lane.top >= 32 && lane.top <= 68;
}

export function isTooCloseToActive(lane, activeItems) {
  for (const it of activeItems) {
    if (!Number.isFinite(it.left) || !Number.isFinite(it.top)) continue;
    if (MOVING_HORIZONTAL_KEYS.has(it.key) && Math.abs(lane.top - it.top) < HORIZONTAL_PATH_BAND) {
      return true;
    }
    if (it.key === "top" && lane.area === it.area) return true;
    const mover = isMovingKey(it.key);
    const MIN_DX = mover ? 22 : 30;
    const MIN_DY = mover ? HORIZONTAL_PATH_BAND : 28;
    const dx = Math.abs(lane.left - it.left);
    const dy = Math.abs(lane.top - it.top);
    if (dx <= MIN_DX && dy <= MIN_DY) return true;
  }
  return false;
}

export function blockedLaneIds(activeItems) {
  const blocked = new Set();
  for (const it of activeItems) {
    if (MOVING_HORIZONTAL_KEYS.has(it.key)) {
      laneIdsWhere((l) => l.area === "left").forEach((id) => blocked.add(id));
      if (Number.isFinite(it.top)) {
        laneIdsWhere((l) => Math.abs(l.top - it.top) < HORIZONTAL_PATH_BAND).forEach((id) =>
          blocked.add(id)
        );
      }
    }
    if (it.key === "top") {
      laneIdsWhere((l) => l.area === it.area).forEach((id) => blocked.add(id));
    }
  }
  return blocked;
}

export function filterOppositeToMovers(key, lanes, activeItems) {
  const movement = GIF_BEHAVIOR[key]?.movement ?? "static";
  if (movement !== "static") return lanes;

  const movers = activeItems.filter((m) => isMovingKey(m.key));
  if (!movers.length) return lanes;

  return lanes.filter((lane) => {
    for (const m of movers) {
      if (MOVING_HORIZONTAL_KEYS.has(m.key)) {
        if (
          lane.area === "left" &&
          Number.isFinite(m.top) &&
          Math.abs(lane.top - m.top) < HORIZONTAL_PATH_BAND
        ) {
          return false;
        }
        if (Number.isFinite(m.top) && Math.abs(lane.top - m.top) < HORIZONTAL_PATH_BAND) return false;
      }
      if (m.key === "top" && lane.area === m.area) return false;
    }
    return true;
  });
}

export function isEdgeLane(lane) {
  return lane.left <= 20 || lane.left >= 80;
}
