/** Çeldirici zamanlama sabitleri */
export const GIF_ON_SCREEN_MS = 8_000;
export const MAX_EMPTY_MS = 800;
/** Yeni gif başlangıcı: ekranda en fazla 0,8 sn boşluk kalmasın */
export const GIF_START_INTERVAL_MS = GIF_ON_SCREEN_MS - MAX_EMPTY_MS;

/** Kombine pencerede sesli gif oranı (deterministik) */
export function isSoundGifSlot(index) {
  return index % 10 < 7;
}
