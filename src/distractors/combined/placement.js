/**
 * Yalnızca SESSİZ+SESLİ gif (kombine) penceresi yerleşimi — sessiz modülünden bağımsız.
 */

import {
  GIF_BEHAVIOR,
  GIF_LANES,
  MOVING_HORIZONTAL_KEYS,
  blockedLaneIds,
  filterOppositeToMovers,
  isEdgeLane,
  isInTargetSafeExclusionBox,
  isTooCloseToActive,
  isMovingKey
} from "../../gifPlacementCore.js";

function lanesForCombined(key, blocked, activeItems, eventIndex) {
  const sides = GIF_BEHAVIOR[key]?.sides ?? ["left", "right"];
  const movement = GIF_BEHAVIOR[key]?.movement ?? "static";
  if (key === "top" && activeItems.some((x) => MOVING_HORIZONTAL_KEYS.has(x.key))) return [];
  if (MOVING_HORIZONTAL_KEYS.has(key) && activeItems.some((x) => x.key === "top")) return [];

  let list = GIF_LANES.filter((l) => {
    if (!sides.includes(l.area)) return false;
    if (blocked.has(l.id)) return false;
    if (isInTargetSafeExclusionBox(l)) return false;
    if (movement !== "static" && l.id.includes("mid-")) return false;
    if (movement === "horizontal" && l.top > 22 && l.top < 78) return false;
    if (movement === "horizontal" && l.area !== "left") return false;
    if (key === "top" && l.top > 30) return false;
    return true;
  });

  if (movement === "static") {
    let edgeOnly = list.filter(isEdgeLane);
    edgeOnly = filterOppositeToMovers(key, edgeOnly, activeItems);
    if (edgeOnly.length) return edgeOnly;
  }
  return filterOppositeToMovers(key, list, activeItems);
}

function sortCombinedLanes(movement, lanes, eventIndex) {
  if (movement === "static") {
    const preferBottom = eventIndex % 2 === 0;
    return [...lanes].sort((a, b) =>
      preferBottom ? b.top - a.top : a.top - b.top || Math.abs(50 - b.left) - Math.abs(50 - a.left)
    );
  }
  if (movement === "horizontal") {
    const preferLower = eventIndex >= 6;
    return [...lanes].sort((a, b) => (preferLower ? b.top - a.top : a.top - b.top));
  }
  if (movement === "vertical") {
    const preferLeft = eventIndex % 2 === 0;
    return [...lanes].sort((a, b) => {
      if (a.area !== b.area) return preferLeft ? (a.area === "left" ? -1 : 1) : 1;
      return a.top - b.top;
    });
  }
  return lanes;
}

export function pickCombinedLane(key, eventIndex, activeItems) {
  const blocked = blockedLaneIds(activeItems.filter((x) => isMovingKey(x.key)));
  let allowed = lanesForCombined(key, blocked, activeItems, eventIndex);
  const spaced = allowed.filter((l) => !isTooCloseToActive(l, activeItems));
  if (spaced.length) allowed = spaced;

  const movement = GIF_BEHAVIOR[key]?.movement ?? "static";
  const ordered = sortCombinedLanes(movement, allowed, eventIndex);
  if (ordered.length) return ordered[eventIndex % ordered.length];
  return allowed[0] ?? null;
}

export function buildCombinedGifItem(key, eventIndex, silent, activeItems) {
  const lane = pickCombinedLane(key, eventIndex, activeItems);
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
