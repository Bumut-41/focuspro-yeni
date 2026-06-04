/**
 * Yalnızca SESSİZ gif penceresi yerleşimi — başka senaryoları etkilemez.
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

function lanesForSilent(key, blocked, activeItems, eventIndex) {
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

function sortSilentLanes(movement, lanes, eventIndex) {
  if (movement === "static") {
    return [...lanes].sort((a, b) => a.top - b.top || Math.abs(50 - b.left) - Math.abs(50 - a.left));
  }
  if (movement === "horizontal") {
    const preferLower = eventIndex >= 6;
    return [...lanes].sort((a, b) =>
      preferLower ? b.top - a.top : a.top - b.top || a.left - b.left
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

export function pickSilentLane(key, eventIndex, activeItems) {
  const blocked = blockedLaneIds(activeItems.filter((x) => isMovingKey(x.key)));
  let allowed = lanesForSilent(key, blocked, activeItems, eventIndex);
  const spaced = allowed.filter((l) => !isTooCloseToActive(l, activeItems));
  if (spaced.length) allowed = spaced;

  const movement = GIF_BEHAVIOR[key]?.movement ?? "static";
  const ordered = sortSilentLanes(movement, allowed, eventIndex);
  if (ordered.length) return ordered[eventIndex % ordered.length];
  return allowed[0] ?? null;
}

export function buildSilentGifItem(key, eventIndex, activeItems) {
  const lane = pickSilentLane(key, eventIndex, activeItems);
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
    silent: true
  };
}
