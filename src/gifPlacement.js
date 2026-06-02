/**
 * GIF yerleşim ve hareket kuralları.
 * Ana simge ortada; gifler üst/alt yan şeritlerde (orta bant yok).
 * Hareket edenler: kedi, koşan (sol→sağ), top (üstten aşağı, sol/sağ).
 */

export const GIF_LANES = [
  { id: "left-upper", area: "left", zone: "upper", left: 14, top: 16 },
  { id: "left-lower", area: "left", zone: "lower", left: 14, top: 84 },
  { id: "right-upper", area: "right", zone: "upper", left: 86, top: 16 },
  { id: "right-lower", area: "right", zone: "lower", left: 86, top: 84 }
];

export const MOVING_HORIZONTAL_KEYS = new Set(["kedi", "kosan"]);
export const MOVING_VERTICAL_KEYS = new Set(["top"]);

export const GIF_BEHAVIOR = {
  top: { movement: "vertical", sides: ["left", "right"] },
  kosan: { movement: "horizontal", sides: ["left"] },
  kedi: { movement: "horizontal", sides: ["left"] },
  araba: { movement: "static", sides: ["left", "right"] },
  agac: { movement: "static", sides: ["left", "right"] },
  arabakorna: { movement: "static", sides: ["left", "right"] },
  asansor: { movement: "static", sides: ["left", "right"] },
  camtemizlik: { movement: "static", sides: ["left", "right"] },
  kapi: { movement: "static", sides: ["left", "right"] },
  motorsiklet: { movement: "static", sides: ["left", "right"] },
  televizyon: { movement: "static", sides: ["left", "right"] }
};

const LANE_ROTATION = ["left-upper", "right-lower", "left-lower", "right-upper"];

function isMovingKey(key) {
  return MOVING_HORIZONTAL_KEYS.has(key) || MOVING_VERTICAL_KEYS.has(key);
}

/** Hareketli gif sol taraftayken statikler sağ şeride */
function blockedLaneIds(activeItems) {
  const blocked = new Set();
  for (const it of activeItems) {
    if (MOVING_HORIZONTAL_KEYS.has(it.key)) {
      blocked.add("left-upper");
      blocked.add("left-lower");

      // Hedefimiz: hareketli yatay gif (kedi/koşan) üstteyse diğer gif alt şeritte gelsin.
      // Bu nedenle, aynı zonu (upper/lower) sağ şeritten de bloklayıp sadece ters zondaki lane'leri
      // kullanılabilir bırakıyoruz.
      if (it.zone === "upper") blocked.add("right-upper");
      if (it.zone === "lower") blocked.add("right-lower");
    }
    if (it.key === "top") {
      // Top dikey gif ekranda soldaysa diğer gifler sağ şeritte gelsin.
      if (it.area === "left") {
        blocked.add("left-upper");
        blocked.add("left-lower");
      } else {
        blocked.add("right-upper");
        blocked.add("right-lower");
      }
    }
  }
  return blocked;
}

function lanesForKey(key, blocked) {
  const sides = GIF_BEHAVIOR[key]?.sides ?? ["left", "right"];
  return GIF_LANES.filter((l) => sides.includes(l.area) && !blocked.has(l.id));
}

export function pickLaneForEvent(key, eventIndex, activeItems = []) {
  const blocked = blockedLaneIds(activeItems.filter((x) => isMovingKey(x.key)));
  let allowed = lanesForKey(key, blocked);
  if (!allowed.length) allowed = lanesForKey(key, new Set());

  const rot = LANE_ROTATION.map((id) => GIF_LANES.find((l) => l.id === id)).filter((l) =>
    allowed.some((a) => a.id === l.id)
  );
  if (!rot.length) return allowed[0] ?? GIF_LANES[eventIndex % GIF_LANES.length];
  return rot[eventIndex % rot.length];
}

export function buildGifItem(key, eventIndex, silent, activeItems = []) {
  const lane = pickLaneForEvent(key, eventIndex, activeItems);
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

/** Zaman aralığında aktif item listesi (çakışma için) */
export function activeItemsAt(events, timeMs) {
  const items = [];
  for (const ev of events) {
    if (timeMs >= ev.at && timeMs < ev.at + ev.duration) {
      items.push(...ev.items);
    }
  }
  return items;
}
