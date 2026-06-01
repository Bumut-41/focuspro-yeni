/**
 * GIF yerleşim ve hareket kuralları.
 * Ana simge ortada (~%50); gifler yalnızca üst/alt yan şeritlerde (orta band yok).
 */

export const GIF_LANES = [
  { id: "left-upper", area: "left", zone: "upper", left: 14, top: 16 },
  { id: "left-lower", area: "left", zone: "lower", left: 14, top: 84 },
  { id: "right-upper", area: "right", zone: "upper", left: 86, top: 16 },
  { id: "right-lower", area: "right", zone: "lower", left: 86, top: 84 }
];

/** movement: horizontal | vertical | static */
export const GIF_BEHAVIOR = {
  top: { movement: "vertical", sides: ["left", "right"] },
  kosan: { movement: "horizontal", sides: ["left"] },
  kedi: { movement: "horizontal", sides: ["left"] },
  araba: { movement: "static", sides: ["left", "right"] },
  agac: { movement: "static", sides: ["left", "right"] },
  arabakorna: { movement: "horizontal", sides: ["left"] },
  asansor: { movement: "vertical", sides: ["left", "right"] },
  camtemizlik: { movement: "static", sides: ["left", "right"] },
  kapi: { movement: "static", sides: ["left", "right"] },
  motorsiklet: { movement: "horizontal", sides: ["left"] },
  televizyon: { movement: "static", sides: ["left", "right"] }
};

const LANE_ROTATION = ["left-upper", "right-lower", "left-lower", "right-upper"];

export function lanesForKey(key) {
  const sides = GIF_BEHAVIOR[key]?.sides ?? ["left", "right"];
  return GIF_LANES.filter((l) => sides.includes(l.area));
}

/** Deterministik şerit: aynı anda iki gif farklı şeritlerde */
export function pickLaneForEvent(key, eventIndex) {
  const allowed = lanesForKey(key);
  const rot = LANE_ROTATION.map((id) => GIF_LANES.find((l) => l.id === id)).filter((l) =>
    allowed.some((a) => a.id === l.id)
  );
  if (!rot.length) return allowed[0] ?? GIF_LANES[0];
  return rot[eventIndex % rot.length];
}

export function buildGifItem(key, eventIndex, silent) {
  const lane = pickLaneForEvent(key, eventIndex);
  const behavior = GIF_BEHAVIOR[key] ?? { movement: "static", sides: ["left", "right"] };
  return {
    key,
    area: lane.area,
    zone: lane.zone,
    laneId: lane.id,
    left: lane.left,
    top: lane.top,
    movement: behavior.movement,
    silent
  };
}
