/**
 * Çeldirici çizelgeleri — senaryolar ayrı modüllerde.
 * @see distractors/silentGifSchedule.js
 * @see distractors/soloSoundSchedule.js
 * @see distractors/combinedGifSchedule.js
 */

export { buildSilentGifWindow } from "./distractors/silentGifSchedule.js";
export { buildSoloSoundWindow } from "./distractors/soloSoundSchedule.js";
export { buildSoundGifWindow } from "./distractors/combinedGifSchedule.js";

export function mergeGifEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export function mergeSoundEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}
