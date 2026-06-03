/** Çeldirici zamanlama sabitleri */
export const GIF_ON_SCREEN_MS = 8_000;

/** Sessiz-gif penceresi: boşluk max 0,8 sn */
export const MAX_EMPTY_MS = 800;
export const GIF_START_INTERVAL_MS = GIF_ON_SCREEN_MS - MAX_EMPTY_MS;

/** Kombine pencere (sesli+sessiz gif): boşluk max 1 sn */
export const COMBINED_MAX_EMPTY_MS = 1_000;
export const COMBINED_START_INTERVAL_MS = GIF_ON_SCREEN_MS - COMBINED_MAX_EMPTY_MS;

/** Kombine pencerede sesli gif oranı (deterministik) */
export function isSoundGifSlot(index) {
  return index % 10 < 7;
}
