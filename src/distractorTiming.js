/** Çeldirici zamanlama sabitleri */
export const GIF_ON_SCREEN_MS = 8_000;

/** Sessiz-gif penceresi: boşluk max 0,8 sn */
export const MAX_EMPTY_MS = 800;
export const GIF_START_INTERVAL_MS = GIF_ON_SCREEN_MS - MAX_EMPTY_MS;

/** Kombine pencere (sesli+sessiz gif): ekranda gif yok max 0,8 sn */
export const COMBINED_MAX_EMPTY_MS = MAX_EMPTY_MS;
export const COMBINED_START_INTERVAL_MS = GIF_ON_SCREEN_MS - COMBINED_MAX_EMPTY_MS;
/** Sesli gif, sessizden bu kadar sonra başlar (çoğu süre 2 gif ekranda) */
export const COMBINED_SOUND_STAGGER_MS = 400;
