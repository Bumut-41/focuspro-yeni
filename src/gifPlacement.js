/**
 * Geriye dönük uyumluluk: çakışma kuralları ve aktif sorgular (çekirdek).
 * Yerleşim seçimi: distractors/silent/placement.js | distractors/combined/placement.js
 */

export {
  GIF_LANES,
  GIF_BEHAVIOR,
  MOVING_HORIZONTAL_KEYS,
  MOVING_VERTICAL_KEYS,
  HORIZONTAL_PATH_BAND,
  activeItemsAt,
  activeItemsOverlapping,
  pairViolatesPlacement,
  isMovingItem,
  itemMovement
} from "./gifPlacementCore.js";
