/**
 * Çeldirici çizelgeleri — üç bağımsız senaryo modülü.
 *
 * distractors/silent/   → yalnızca sessiz gif
 * distractors/combined/ → sessiz + sesli gif
 * distractors/soloSoundSchedule.js → yalnızca ses
 */

export { buildSilentGifWindow } from "./distractors/silent/schedule.js";
export { buildSoundGifWindow } from "./distractors/combined/schedule.js";
export { buildSoloSoundWindow } from "./distractors/soloSoundSchedule.js";

export function mergeGifEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}

export function mergeSoundEvents(windows) {
  return windows.flat().sort((a, b) => a.at - b.at);
}
