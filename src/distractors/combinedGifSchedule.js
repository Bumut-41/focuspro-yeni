/**
 * Sessiz + sesli gif birlikte (kombine pencere) — sessiz modülden ayrı kurallar.
 * Sürekli 1 sessiz + 1 sesli gif; sessiz tarafta hareketli olabilir, sesli hep hareketsiz.
 */

import { DISTRACTOR_GIF_KEYS, DISTRACTOR_SOUND_GIF_KEYS } from "../constants.js";
import { activeItemsAt, pairViolatesPlacement } from "../gifPlacement.js";
import { COMBINED_SOUND_STAGGER_MS, GIF_ON_SCREEN_MS } from "../distractorTiming.js";
import { pickItem, pickStaticBesideMover } from "./distractorPick.js";

const MOVER_KEYS = ["top", "kosan", "kedi"];
const STATIC_GIF_KEYS = DISTRACTOR_GIF_KEYS.filter((k) => !MOVER_KEYS.includes(k));
const SOUND_GIF_KEYS = DISTRACTOR_SOUND_GIF_KEYS;

function gifDuration(endMs, at) {
  return Math.min(GIF_ON_SCREEN_MS, endMs - at);
}

function hasSilentActive(events, at) {
  return activeItemsAt(events, at).some((x) => x.silent !== false);
}

function hasSoundGifActive(events, at) {
  return activeItemsAt(events, at).some((x) => x.silent === false);
}

function pickCombinedSound(events, tSound, durS, n, soundKeyRef, peerSilent) {
  if (hasSoundGifActive(events, tSound)) return null;
  const extra = peerSilent ? [peerSilent] : [];

  let it =
    pickStaticBesideMover(SOUND_GIF_KEYS, soundKeyRef, tSound, durS, n * 10 + 5000, events, extra, false) ??
    pickItem(SOUND_GIF_KEYS, soundKeyRef, tSound, durS, n * 10 + 5000, false, events, extra);

  if (it && peerSilent && pairViolatesPlacement(peerSilent, it)) {
    it =
      pickStaticBesideMover(
        SOUND_GIF_KEYS,
        { current: soundKeyRef.current + 2 },
        tSound,
        durS,
        n * 10 + 5001,
        events,
        [peerSilent],
        false
      ) ?? pickItem(SOUND_GIF_KEYS, soundKeyRef, tSound, durS, n * 10 + 5002, false, events, [peerSilent]);
  }
  return it;
}

function pickCombinedWave(events, tSilent, tSound, dur, durS, n, silentKeyRef, soundKeyRef, endMs) {
  if (tSilent >= endMs || dur < 400) return { silentIt: null, soundIt: null };
  if (tSound >= endMs || durS < 400) return { silentIt: null, soundIt: null };

  let soundIt = pickCombinedSound(events, tSound, durS, n, soundKeyRef, null);
  if (!soundIt) return { silentIt: null, soundIt: null };

  let silentIt = null;
  const moverSlot = n % 4 === 0;

  if (moverSlot && !hasSilentActive(events, tSilent)) {
    for (const key of MOVER_KEYS) {
      const candidate = pickItem([key], { current: 0 }, tSilent, dur, n * 10, true, events, [soundIt]);
      if (candidate && !pairViolatesPlacement(candidate, soundIt)) {
        silentIt = candidate;
        break;
      }
    }
  }

  if (!silentIt) {
    silentIt =
      pickStaticBesideMover(STATIC_GIF_KEYS, silentKeyRef, tSilent, dur, n * 10, events, [soundIt]) ??
      pickItem(STATIC_GIF_KEYS, silentKeyRef, tSilent, dur, n * 10 + 1, true, events, [soundIt]);
  }

  if (silentIt && soundIt && pairViolatesPlacement(silentIt, soundIt)) {
    silentIt =
      pickStaticBesideMover(STATIC_GIF_KEYS, { current: silentKeyRef.current + 2 }, tSilent, dur, n * 10 + 3, events, [
        soundIt
      ]) ??
      pickItem(STATIC_GIF_KEYS, silentKeyRef, tSilent, dur, n * 10 + 4, true, events, [soundIt]);
  }

  if (!silentIt) {
    return { silentIt: null, soundIt };
  }

  return { silentIt, soundIt };
}

export function buildSoundGifWindow(startMs, endMs) {
  const events = [];
  const silentKeyRef = { current: 0 };
  const soundKeyRef = { current: 0 };
  let n = 0;

  while (startMs + n * GIF_ON_SCREEN_MS < endMs) {
    const tSilent = startMs + n * GIF_ON_SCREEN_MS;
    const tSound = startMs + COMBINED_SOUND_STAGGER_MS + n * GIF_ON_SCREEN_MS;

    const dur = gifDuration(endMs, tSilent);
    const durS = gifDuration(endMs, tSound);
    const { silentIt, soundIt } = pickCombinedWave(
      events,
      tSilent,
      tSound,
      dur,
      durS,
      n,
      silentKeyRef,
      soundKeyRef,
      endMs
    );
    if (soundIt) events.push({ at: tSound, duration: durS, items: [soundIt] });
    if (silentIt) events.push({ at: tSilent, duration: dur, items: [silentIt] });

    n += 1;
    if (n > 5000) break;
  }

  return events.sort((a, b) => a.at - b.at);
}
