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

function laneIdsWhere(fn) {
  return new Set(GIF_LANES.filter(fn).map((l) => l.id));
}

function isInTargetSafeExclusionBox(lane) {
  // Ana simge merkezi ~ (50,50). Merkez bandına lane koymuyoruz.
  return lane.left >= 30 && lane.left <= 70 && lane.top >= 32 && lane.top <= 68;
}

function isTooCloseToActive(lane, activeItems) {
  // Yüzde koordinatlarında basit mesafe kuralı.
  // Amaç: 2 GIF ekrandayken birbirine "yapışık" görünmesin.
  // Not: Orta bant (mid-*) lane'leri kenar lane'lerine yakın olduğu için eşiği biraz büyük tuttuk.
  const MIN_DX = 30;
  const MIN_DY = 28;
  for (const it of activeItems) {
    if (!Number.isFinite(it.left) || !Number.isFinite(it.top)) continue;
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
      // Sol→sağ: sol şerit + gifi takip eden yükseklik bandı (hareket hattı).
      laneIdsWhere((l) => l.area === "left").forEach((id) => blocked.add(id));
      if (Number.isFinite(it.top)) {
        laneIdsWhere((l) => Math.abs(l.top - it.top) < 28).forEach((id) => blocked.add(id));
      }
    }
    if (it.key === "top") {
      // Yukarı→aşağı: iniş kolonunda başka gif olmasın; karşı taraf serbest.
      laneIdsWhere((l) => l.area === it.area).forEach((id) => blocked.add(id));
    }
  }
  return blocked;
}

function lanesForKey(key, blocked, activeItems = []) {
  const sides = GIF_BEHAVIOR[key]?.sides ?? ["left", "right"];
  const movement = GIF_BEHAVIOR[key]?.movement ?? "static";
  const list = GIF_LANES.filter((l) => {
    if (!sides.includes(l.area)) return false;
    if (blocked.has(l.id)) return false;
    if (isInTargetSafeExclusionBox(l)) return false;
    if (movement !== "static" && l.id.includes("mid-")) return false;
    return true;
  });
  // Hareketsiz gifler yalnızca ekranın sol/sağ kenarına yakın lane'lerde.
  if (movement === "static") {
    let edgeOnly = list.filter(isEdgeLane);
    // Yatay hareketli gif varken statikler yalnızca sağ şeritte (sol yol üstüne binmesin).
    if (activeItems.some((it) => MOVING_HORIZONTAL_KEYS.has(it.key))) {
      const rightOnly = edgeOnly.filter((l) => l.area === "right");
      if (rightOnly.length) edgeOnly = rightOnly;
    }
    if (edgeOnly.length) return edgeOnly;
  }
  return list;
}

export function pickLaneForEvent(key, eventIndex, activeItems = []) {
  const blocked = blockedLaneIds(activeItems.filter((x) => isMovingKey(x.key)));
  let allowed = lanesForKey(key, blocked, activeItems);
  if (!allowed.length) allowed = lanesForKey(key, new Set(), activeItems);

  // Mesafe filtresi: aktif giflere çok yakın lane'leri ele.
  const spaced = allowed.filter((l) => !isTooCloseToActive(l, activeItems));
  if (spaced.length) allowed = spaced;

  const rot = LANE_ROTATION.map((id) => GIF_LANES.find((l) => l.id === id)).filter((l) =>
    allowed.some((a) => a.id === l.id)
  );
  if (rot.length) return rot[eventIndex % rot.length];

  // Yedek: merkeze en uzak lane'i seç
  const byEdge = [...allowed].sort((a, b) => Math.abs(50 - b.left) - Math.abs(50 - a.left));
  return byEdge[0] ?? GIF_LANES[eventIndex % GIF_LANES.length];
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
