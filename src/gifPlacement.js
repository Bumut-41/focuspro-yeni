/**
 * GIF yerleşim ve hareket kuralları.
 * Ana simge ortada; hareketsiz gifler sol/sağ kenar şeritlerinde (merkeze yakın değil).
 * Hareket edenler: kedi, koşan (sol→sağ), top (üstten aşağı, sol/sağ).
 */

export const GIF_LANES = [
  // Kenar şeritleri — ana simgeden uzak; tam ekran dışına taşmaması için %14 / %86
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

/** Yatay geçiş bandı (%) — bu aralıktaki şeritlere başka gif konmaz */
const HORIZONTAL_PATH_BAND = 40;

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

// Önce kenar lane'leri (ana şekle en uzak)
const LANE_ROTATION = [
  "left-upper",
  "right-upper",
  "left-lower",
  "right-lower",
  "left-mid-upper",
  "right-mid-upper",
  "left-mid-lower",
  "right-mid-lower"
];

function isEdgeLane(lane) {
  return lane.left <= 20 || lane.left >= 80;
}

function isMovingKey(key) {
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

function isInTargetSafeExclusionBox(lane) {
  // Ana simge merkezi ~ (50,50). Merkez bandına lane koymuyoruz.
  return lane.left >= 30 && lane.left <= 70 && lane.top >= 32 && lane.top <= 68;
}

function isTooCloseToActive(lane, activeItems) {
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

/** Hareketli gifler varken hangi lane'ler bloklanır? */
function blockedLaneIds(activeItems) {
  const blocked = new Set();
  for (const it of activeItems) {
    if (MOVING_HORIZONTAL_KEYS.has(it.key)) {
      // Sol→sağ: sol şerit + tüm genişlikte yatay hareket bandı.
      laneIdsWhere((l) => l.area === "left").forEach((id) => blocked.add(id));
      if (Number.isFinite(it.top)) {
        laneIdsWhere((l) => Math.abs(l.top - it.top) < HORIZONTAL_PATH_BAND).forEach((id) =>
          blocked.add(id)
        );
      }
    }
    if (it.key === "top") {
      // Yukarı→aşağı: iniş kolonunda başka gif olmasın; karşı taraf serbest.
      laneIdsWhere((l) => l.area === it.area).forEach((id) => blocked.add(id));
    }
  }
  return blocked;
}

/** Hareket yolunda değil: zıt şerit / zıt kolon */
function filterOppositeToMovers(key, lanes, activeItems) {
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

function lanesForKey(key, blocked, activeItems = [], eventIndex = 0) {
  const sides = GIF_BEHAVIOR[key]?.sides ?? ["left", "right"];
  const movement = GIF_BEHAVIOR[key]?.movement ?? "static";
  if (key === "top" && activeItems.some((x) => MOVING_HORIZONTAL_KEYS.has(x.key))) {
    return [];
  }
  if (MOVING_HORIZONTAL_KEYS.has(key) && activeItems.some((x) => x.key === "top")) {
    return [];
  }
  let list = GIF_LANES.filter((l) => {
    if (!sides.includes(l.area)) return false;
    if (blocked.has(l.id)) return false;
    if (isInTargetSafeExclusionBox(l)) return false;
    if (movement !== "static" && l.id.includes("mid-")) return false;
    // Kedi / koşan yalnızca üst veya alt kenardan geçsin (orta bantta sabit gif ile çakışmasın).
    if (movement === "horizontal" && l.top > 22 && l.top < 78) return false;
    // Koşan/kedi sol→sağ: yalnızca sol şeritten başlar (alt öncelik pickLane'de)
    if (movement === "horizontal" && l.area !== "left") return false;
    // Top: yukarıdan aşağı — yalnızca üst şerit, sol/sağ kenar.
    if (key === "top") {
      if (l.top > 30) return false;
      const staticLeft = activeItems.some(
        (x) => (GIF_BEHAVIOR[x.key]?.movement ?? "static") === "static" && x.area === "left"
      );
      const staticRight = activeItems.some(
        (x) => (GIF_BEHAVIOR[x.key]?.movement ?? "static") === "static" && x.area === "right"
      );
      const horizOnLeft = activeItems.some((x) => MOVING_HORIZONTAL_KEYS.has(x.key));
      if (staticLeft && l.area === "left") return false;
      if (staticRight && l.area === "right") return false;
      if (horizOnLeft && l.area === "left") return false;
    }
    return true;
  });
  if (movement === "static") {
    let edgeOnly = list.filter(isEdgeLane);
    edgeOnly = filterOppositeToMovers(key, edgeOnly, activeItems);
    if (edgeOnly.length) return edgeOnly;
  }
  return filterOppositeToMovers(key, list, activeItems);
}

function sortLanesByPlacementPreference(movement, lanes, eventIndex = 0) {
  if (movement === "static") {
    return [...lanes].sort((a, b) => a.top - b.top || Math.abs(50 - b.left) - Math.abs(50 - a.left));
  }
  if (movement === "horizontal") {
    const preferLower = eventIndex >= 6;
    return [...lanes].sort((a, b) =>
      preferLower ? b.top - a.top || a.left - b.left : a.top - b.top || a.left - b.left
    );
  }
  if (movement === "vertical") {
    const preferLeft = eventIndex % 2 === 0;
    return [...lanes].sort((a, b) => {
      if (a.area !== b.area) return preferLeft ? (a.area === "left" ? -1 : 1) : a.area === "right" ? -1 : 1;
      return a.top - b.top;
    });
  }
  return lanes;
}

export function pickLaneForEvent(key, eventIndex, activeItems = []) {
  const blocked = blockedLaneIds(activeItems.filter((x) => isMovingKey(x.key)));
  let allowed = lanesForKey(key, blocked, activeItems, eventIndex);

  const spaced = allowed.filter((l) => !isTooCloseToActive(l, activeItems));
  if (spaced.length) allowed = spaced;

  const movement = GIF_BEHAVIOR[key]?.movement ?? "static";
  const ordered = sortLanesByPlacementPreference(movement, allowed, eventIndex);
  if (ordered.length) return ordered[eventIndex % ordered.length];

  const rot = LANE_ROTATION.map((id) => GIF_LANES.find((l) => l.id === id)).filter((l) =>
    allowed.some((a) => a.id === l.id)
  );
  if (rot.length) return rot[eventIndex % rot.length];

  const byEdge = [...allowed].sort((a, b) => Math.abs(50 - b.left) - Math.abs(50 - a.left));
  return byEdge[0] ?? null;
}

export function buildGifItem(key, eventIndex, silent, activeItems = []) {
  const lane = pickLaneForEvent(key, eventIndex, activeItems);
  if (!lane) return null;
  const behavior = GIF_BEHAVIOR[key] ?? { movement: "static", sides: ["left", "right"] };
  return {
    key,
    area: lane.area,
    zone: lane.zone,
    laneId: lane.id,
    left: lane.left,
    top: lane.top,
    movement: behavior.movement,
    silent: silent !== false
  };
}

/** Tek bir anda ekrandaki item'lar */
export function activeItemsAt(events, timeMs) {
  const items = [];
  for (const ev of events) {
    if (timeMs >= ev.at && timeMs < ev.at + ev.duration) {
      items.push(...ev.items);
    }
  }
  return items;
}

/** İki gif aynı anda yerleşim kurallarını ihlal ediyor mu? */
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

/** [at, at+duration) ile örtüşen tüm olayların item'ları — çizelge yerleşimi için */
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
